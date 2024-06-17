from datetime import datetime
from typing import List

from pydantic import BaseModel


class MeasurementRead(BaseModel):
    id: int
    temperature: float
    humidity: float
    co2: float
    timestamp: datetime

    class Config:
        orm_mode = True


class ConfigRead(BaseModel):
    id: int
    config_data: dict

    class Config:
        orm_mode = True


class DeviceRead(BaseModel):
    id: int
    mac_address: str
    room_id: int
    measurements: List[MeasurementRead] = []
    configs: List[ConfigRead] = []

    class Config:
        orm_mode = True


class DeviceCreate(BaseModel):
    mac_address: str
