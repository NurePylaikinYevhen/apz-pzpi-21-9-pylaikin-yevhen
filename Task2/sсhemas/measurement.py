from pydantic import BaseModel
from datetime import datetime


class MeasurementExport(BaseModel):
    id: int
    device_id: int
    timestamp: datetime
    temperature: float
    humidity: float
    co2: float


class EnvironmentDataInput(BaseModel):
    device_id: int
    Temperature: float
    Humidity: float
    CO2: float
