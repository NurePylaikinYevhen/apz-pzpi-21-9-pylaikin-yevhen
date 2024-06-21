from sqlalchemy.orm import Session
import pandas as pd
from statistics import mean, median
from typing import List, Tuple, Dict
from datetime import datetime
import math
import openpyxl

from models.esp import Device
from models.measurement import Measurement
from models.deviceconfig import DeviceConfig

from sсhemas.measurement import EnvironmentDataInput


def get_device_config(db: Session, device_id: int) -> Dict:
    device_config = db.query(DeviceConfig).filter(DeviceConfig.device_id == device_id).first()
    if not device_config:
        raise ValueError(f"Конфігурацію для пристрою з id {device_id} не знайдено")
    return device_config.config_data


def calculate_adjustment_factor(current_val, min_val, max_val, ideal_val, key):
    if current_val < min_val or current_val > max_val:
        return 0
    else:
        return 1


def adjust_model_config(scores, config, temperature, humidity, co2):
    adjustment_factors = {
        'Temperature': calculate_adjustment_factor(temperature, config['min_values']['Temperature'],
                                                   config['max_values']['Temperature'],
                                                   config['ideal_values']['Temperature'], 'Temperature'),
        'Humidity': calculate_adjustment_factor(humidity, config['min_values']['Humidity'],
                                                config['max_values']['Humidity'], config['ideal_values']['Humidity'],
                                                'Humidity'),
        'CO2': calculate_adjustment_factor(co2, config['min_values']['CO2'], config['max_values']['CO2'],
                                           config['ideal_values']['CO2'], 'CO2')
    }

    adjusted_scores = {
        'Temperature': scores['Temperature'] * adjustment_factors['Temperature'],
        'Humidity': scores['Humidity'] * adjustment_factors['Humidity'],
        'CO2': scores['CO2'] * adjustment_factors['CO2']
    }

    return adjusted_scores


def calculate_productivity(temperature, humidity, co2, config):
    temperature_weight = 5
    humidity_weight = 3
    co2_weight = 1

    temperature_score = math.exp(-((temperature - config['ideal_values']['Temperature']) ** 2) / 50)
    humidity_score = math.exp(-((humidity - config['ideal_values']['Humidity']) ** 2) / 100)

    co2_ideal = config['ideal_values']['CO2']
    co2_max = config['max_values']['CO2']
    if co2 <= co2_ideal:
        co2_score = 1
    else:
        co2_score = 1 - math.log(1 + (co2 - co2_ideal) / (co2_max - co2_ideal)) / math.log(3)

    scores = {
        "Temperature": temperature_score,
        "Humidity": humidity_score,
        "CO2": co2_score
    }

    adjusted_scores = adjust_model_config(scores, config, temperature, humidity, co2)

    overall_score = (
                            adjusted_scores["Temperature"] ** temperature_weight *
                            adjusted_scores["Humidity"] ** humidity_weight *
                            adjusted_scores["CO2"] ** co2_weight
                    ) ** (1 / (temperature_weight + humidity_weight + co2_weight)) * 100

    return round(overall_score)


def calculate_prediction(db: Session, device_id: int, temperature: float, humidity: float, co2: float) -> Tuple[
    float, List[str]]:
    config = get_device_config(db, device_id)
    prediction = calculate_productivity(temperature, humidity, co2, config)

    recommendations = []
    if prediction < config.get('productivity_norm', 80):  # Припустимо, що норма продуктивності - 80%
        recommendations.append(f"Ваша продуктивність може бути занадто низькою, близько {prediction}%.")
        if temperature < config['min_values']['Temperature'] or temperature > config['max_values']['Temperature']:
            recommendations.append(
                f"Відрегулюйте температуру між {config['min_values']['Temperature']}-{config['max_values']['Temperature']}°C.")
        if humidity < config['min_values']['Humidity'] or humidity > config['max_values']['Humidity']:
            recommendations.append(
                f"Відрегулюйте вологість між {config['min_values']['Humidity']}-{config['max_values']['Humidity']}%.")
        if co2 > config['max_values']['CO2']:
            recommendations.append(f"Зменшіть рівень CO2 нижче {config['max_values']['CO2']} ppm.")

    return prediction, recommendations


def get_db_stats(db: Session, from_date: datetime, to_date: datetime, room_id: int = None) -> pd.DataFrame:
    query = db.query(Measurement).filter(Measurement.timestamp > from_date, Measurement.timestamp < to_date)
    if room_id:
        query = query.join(Device).filter(Device.room_id == room_id)

    rows = query.all()

    if not rows:
        return pd.DataFrame()

    stats = {}
    for row in rows:
        device_config = get_device_config(db, row.device_id)
        prediction = calculate_productivity(row.temperature, row.humidity, row.co2, device_config)

        if row.device_id not in stats:
            stats[row.device_id] = {
                'Температура': [],
                'Вологість': [],
                'CO2': [],
                'Продуктивність': []
            }

        stats[row.device_id]['Температура'].append(row.temperature)
        stats[row.device_id]['Вологість'].append(row.humidity)
        stats[row.device_id]['CO2'].append(row.co2)
        stats[row.device_id]['Продуктивність'].append(prediction)

    result = []
    for device_id, device_stats in stats.items():
        device_config = get_device_config(db, device_id)
        result.append({
            'Пристрій': f'device_{device_id}',
            'Середня температура': mean(device_stats['Температура']),
            'Медіанна температура': median(device_stats['Температура']),
            'Відхилення температури': (mean(device_stats['Температура']) - device_config['ideal_values']['Temperature']) / device_config['ideal_values']['Temperature'],
            'Середня вологість': mean(device_stats['Вологість']),
            'Медіанна вологість': median(device_stats['Вологість']),
            'Відхилення вологості': (mean(device_stats['Вологість']) - device_config['ideal_values']['Humidity']) / device_config['ideal_values']['Humidity'],
            'Середній CO2': mean(device_stats['CO2']),
            'Медіанний CO2': median(device_stats['CO2']),
            'Відхилення CO2': (mean(device_stats['CO2']) - device_config['ideal_values']['CO2']) / device_config['ideal_values']['CO2'],
            'Середня продуктивність': mean(device_stats['Продуктивність']),
            'Медіанна продуктивність': median(device_stats['Продуктивність']),
            'Відхилення продуктивності': (mean(device_stats['Продуктивність']) - device_config.get('productivity_norm', 80)) / device_config.get('productivity_norm', 80)
        })

    return pd.DataFrame(result)


def record_environment_data(db: Session, input_data: EnvironmentDataInput):
    try:
        measurement = Measurement(
            device_id=input_data.device_id,
            timestamp=datetime.now(),
            temperature=input_data.Temperature,
            humidity=input_data.Humidity,
            co2=input_data.CO2
        )
        db.add(measurement)
        db.commit()
        return {"message": "Дані успішно записано"}
    except Exception as e:
        db.rollback()
        raise e
def generate_statistics(db: Session, from_date: datetime, to_date: datetime) -> str:
    df = get_db_stats(db, from_date, to_date)
    excel_file = 'statistics.xlsx'
    with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    return excel_file


def generate_statistics_room(db: Session, from_date: datetime, to_date: datetime, room_id: int) -> str:
    df = get_db_stats(db, from_date, to_date, room_id)
    excel_file = 'statistics_room.xlsx'
    with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    return excel_file


