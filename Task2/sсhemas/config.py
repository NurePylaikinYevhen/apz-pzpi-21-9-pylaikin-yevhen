from pydantic import BaseModel
from typing import Dict


class ConfigImport(BaseModel):
    config_data: Dict[str, dict]


class ConfigExport(BaseModel):
    device_id: str
    config_data: dict


class ConfigUpdate(BaseModel):
    key: str
    value: str
