from pydantic import BaseModel, field_validator
from typing import Dict, Optional

from Task2.sсhemas.BaseConfig import BaseConfig


class MonitoringSettings(BaseModel):
    Interval: int


class SensorValues(BaseModel):
    Temperature: float
    Humidity: float
    CO2: float


class ConfigExport(BaseModel):
    device_id: str
    config_data: dict


class ConfigImport(BaseConfig):
    ideal_values: SensorValues
    min_values: SensorValues
    max_values: SensorValues
    monitoring_settings: MonitoringSettings


class ConfigUpdate(BaseConfig):
    ideal_values: Optional[SensorValues]
    min_values: Optional[SensorValues]
    max_values: Optional[SensorValues]
    monitoring_settings: Optional[MonitoringSettings]
