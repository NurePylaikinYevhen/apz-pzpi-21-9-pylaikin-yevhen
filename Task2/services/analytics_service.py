from sqlalchemy.orm import Session
import pandas as pd
from statistics import mean, median
from typing import List, Tuple, Dict, Optional
from datetime import datetime
import math
import openpyxl

from models.esp import Device
from models.measurement import Measurement
from models.deviceconfig import DeviceConfig

from sсhemas.measurement import EnvironmentDataInput

from sсhemas.analytics import StatisticsOutput


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


def get_statistics(db: Session, time_from: datetime, time_to: datetime, room_id: Optional[int] = None) -> List[StatisticsOutput]:
    query = db.query(Measurement).filter(Measurement.timestamp.between(time_from, time_to))
    if room_id:
        query = query.join(Device).filter(Device.room_id == room_id)

    df = pd.read_sql(query.statement, db.bind)

    if df.empty:
        return []

    device_stats = []
    for device_id, device_df in df.groupby('device_id'):
        device_stats.append(StatisticsOutput(
            device_id=f'device_{device_id}',
            avg_temperature=device_df['temperature'].mean(),
            median_temperature=device_df['temperature'].median(),
            temperature_deviation=calculate_deviation(device_df['temperature']),
            avg_humidity=device_df['humidity'].mean(),
            median_humidity=device_df['humidity'].median(),
            humidity_deviation=calculate_deviation(device_df['humidity']),
            avg_co2=device_df['co2'].mean(),
            median_co2=device_df['co2'].median(),
            co2_deviation=calculate_deviation(device_df['co2']),
            avg_productivity=device_df['productivity'].mean(),
            median_productivity=device_df['productivity'].median(),
            productivity_deviation=calculate_deviation(device_df['productivity'])
        ))

    return device_stats


def calculate_deviation(series: pd.Series) -> float:
    return (series.mean() - series.median()) / series.median()


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


