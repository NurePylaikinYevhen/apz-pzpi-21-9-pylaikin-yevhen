import math
from datetime import datetime
from typing import List, Tuple, Dict, Optional

import numpy as np
import pandas as pd
from models.deviceconfig import DeviceConfig
from models.esp import Device
from models.measurement import Measurement
from sqlalchemy.orm import Session
from sсhemas.analytics import StatisticsOutput
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


def calculate_prediction(db: Session, device_id: int, temperature: float, humidity: float, co2: float) -> Tuple[float, List[str]]:
    config = get_device_config(db, device_id)
    prediction = calculate_productivity(temperature, humidity, co2, config)

    new_measurement = Measurement(
        device_id=device_id,
        timestamp=datetime.utcnow(),
        temperature=temperature,
        humidity=humidity,
        co2=co2,
        productivity=prediction
    )
    db.add(new_measurement)
    db.commit()

    recommendations = []
    if prediction < config.get('productivity_norm', 80):
        recommendations.append(f"Ваша продуктивність може бути занадто низькою, близько {prediction}%.")

        temp_ideal = config['ideal_values']['Temperature']
        if abs(temperature - temp_ideal) > 2:
            direction = "підвищити" if temperature < temp_ideal else "знизити"
            recommendations.append(f"Рекомендується {direction} температуру ближче до {temp_ideal}°C.")

        humidity_ideal = config['ideal_values']['Humidity']
        if abs(humidity - humidity_ideal) > 10:
            direction = "підвищити" if humidity < humidity_ideal else "знизити"
            recommendations.append(f"Рекомендується {direction} вологість ближче до {humidity_ideal}%.")

        co2_ideal = config['ideal_values']['CO2']
        if co2 > co2_ideal + 100:
            recommendations.append(f"Рекомендується зменшити рівень CO2 ближче до {co2_ideal} ppm.")

    return prediction, recommendations


def clean_float(value):
    if isinstance(value, (float, np.floating)):
        if math.isnan(value) or math.isinf(value):
            return None
    return value


def clean_dict(d):
    return {k: clean_float(v) if isinstance(v, (float, np.floating)) else v for k, v in d.items()}


def get_statistics(db: Session, time_from: datetime, time_to: datetime, room_id: Optional[int] = None) -> List[
    StatisticsOutput]:
    query = db.query(Measurement).filter(Measurement.timestamp.between(time_from, time_to))
    if room_id:
        query = query.join(Device).filter(Device.room_id == room_id)

    df = pd.read_sql(query.statement, db.bind)

    if df.empty:
        return []

    device_stats = []
    for device_id, device_df in df.groupby('device_id'):
        try:
            stats = {
                'device_id': f'device_{device_id}',
                'temperature': calculate_parameter_stats(device_df['temperature']),
                'humidity': calculate_parameter_stats(device_df['humidity']),
                'co2': calculate_parameter_stats(device_df['co2']),
                'productivity': calculate_parameter_stats(device_df['productivity']),
                'time_stats': calculate_time_stats(device_df)
            }
            device_stats.append(StatisticsOutput(**clean_dict(stats)))
        except Exception as e:
            print(f"Помилка при розрахунку статистики для девайсу з  {device_id}: {str(e)}")
            continue

    return device_stats


def calculate_parameter_stats(series: pd.Series) -> Dict:
    try:
        return clean_dict({
            'mean': series.mean(),
            'median': series.median(),
            'std': series.std(),
            'min': series.min(),
            'max': series.max(),
            'quartiles': series.quantile([0.25, 0.5, 0.75]).tolist(),
            'iqr': series.quantile(0.75) - series.quantile(0.25),
            'skewness': series.skew(),
            'kurtosis': series.kurtosis()
        })
    except Exception as e:
        print(f"Помилка при розрахунку статистичних параметрів: {str(e)}")
        return {}


def calculate_time_stats(df: pd.DataFrame) -> Dict:
    try:
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.set_index('timestamp')
        hourly_means = df.resample('h').mean()

        hourly_trends = {
            'temperature': hourly_means['temperature'].tolist(),
            'humidity': hourly_means['humidity'].tolist(),
            'co2': hourly_means['co2'].tolist(),
            'productivity': hourly_means['productivity'].tolist() if 'productivity' in hourly_means.columns else None
        }

        return clean_dict({
            'start_time': df.index.min().isoformat(),
            'end_time': df.index.max().isoformat(),
            'duration': (df.index.max() - df.index.min()).total_seconds() / 3600,
            'hourly_trends': {k: [clean_float(v) for v in values] for k, values in hourly_trends.items() if
                              values is not None}
        })
    except Exception as e:
        print(f"Помилка при розрахунку даних часового ряду: {str(e)}")
        return {}


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
