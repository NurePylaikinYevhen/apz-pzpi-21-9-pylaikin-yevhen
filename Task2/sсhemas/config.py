import json

from pydantic import BaseModel, Field
from typing import Optional, Union


class MonitoringSettings(BaseModel):
    Interval: int


class SensorValues(BaseModel):
    Temperature: float
    Humidity: float
    CO2: float


class ConfigImport(BaseModel):
    ideal_values: SensorValues
    min_values: SensorValues
    max_values: SensorValues
    monitoring_settings: MonitoringSettings
    productivity_norm: float = Field(..., description="Норма продуктивності у відсотках")

    class Config:
        json_encoders = {
            SensorValues: lambda v: v.dict(),
            MonitoringSettings: lambda v: v.dict()
        }


class ConfigExport(ConfigImport):
    device_id: Union[int, str]


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, BaseModel):
            return obj.dict()
        return super().default(obj)


class ConfigUpdate(BaseModel):
    ideal_values: Optional[SensorValues] = None
    min_values: Optional[SensorValues] = None
    max_values: Optional[SensorValues] = None
    monitoring_settings: Optional[MonitoringSettings] = None
    productivity_norm: Optional[float] = Field(None, description="Норма продуктивності у відсотках")

    class Config:
        extra = "forbid"
