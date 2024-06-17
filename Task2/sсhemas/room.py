from typing import List

from pydantic import BaseModel, field_validator, validator
import re

from Task2.sсhemas.device import DeviceRead


class RoomCreate(BaseModel):
    name: str
    device_macs: str

    @field_validator('device_macs')
    def validate_device_macs(self, v):
        # Регулярний вираз для валідації правильного формату MAC-адреси
        mac_validate = re.compile(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$')
        macs = [mac.strip() for mac in v.split(',')]

        if not all(mac_validate.match(mac) for mac in macs):
            raise ValueError('Кожна MAC-адреса повинна бути у форматі "XX:XX:XX:XX:XX" та розділена комами')

        return macs


class RoomRead(BaseModel):
    id: int
    name: str
    devices: List[DeviceRead] = []

    class Config:
        orm_mode = True
