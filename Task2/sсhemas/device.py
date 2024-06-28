from datetime import datetime
from typing import List, Optional
import re

from pydantic import BaseModel, validator


class MeasurementRead(BaseModel):
    id: int
    temperature: float
    humidity: float
    co2: float
    timestamp: datetime

    class Config:
        from_attributes = True


class ConfigRead(BaseModel):
    id: int
    config_data: dict

    class Config:
        from_attributes = True


class DeviceRead(BaseModel):
    id: int
    mac_address: str
    room_id: Optional[int] = None
    measurements: List[MeasurementRead] = []
    configs: List[ConfigRead] = []

    class Config:
        from_attributes = True


class DeviceCreate(BaseModel):
    mac_address: str

    @validator('mac_address')
    def validate_mac_address(cls, v):
        mac_validate = re.compile(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$')
        if not mac_validate.match(v):
            raise ValueError(f'Некоректний формат MAC-адреси: {v}')
        return v
