from typing import List, Union

from pydantic import BaseModel, field_validator, validator
import re

from .device import DeviceRead


class RoomCreate(BaseModel):
    name: str
    device_macs: Union[List[str], str]

    @validator('device_macs', pre=True)
    def validate_device_macs(cls, v):
        if isinstance(v, str):
            v = [mac.strip() for mac in v.split(',')]
        elif not isinstance(v, list):
            raise ValueError('device_macs должен быть строкой или списком')

        mac_validate = re.compile(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$')
        invalid_macs = [mac for mac in v if not mac_validate.match(mac)]
        if invalid_macs:
            raise ValueError(f'Неверный формат MAC-адреса: {", ".join(invalid_macs)}')

        return v


class RoomRead(BaseModel):
    id: int
    name: str
    devices: List[DeviceRead] = []

    class Config:
        from_attributes = True
