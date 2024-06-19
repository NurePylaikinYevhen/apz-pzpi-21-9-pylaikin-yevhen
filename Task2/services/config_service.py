from fastapi import UploadFile
from sqlalchemy.orm import Session
import json

from Task2.models.deviceconfig import DeviceConfig
from Task2.sсhemas.config import ConfigUpdate


def import_config(db: Session, device_id: int, file: UploadFile):
    config_data = json.load(file.file)
    db_config = db.query(DeviceConfig).filter(DeviceConfig.device_id == device_id).first()

    if db_config:
        db_config.config_data = config_data
    else:
        db_config = DeviceConfig(device_id=device_id, config_data=config_data)
        db.add(db_config)

    db.commit()


def export_config(db: Session):
    configs = db.query(DeviceConfig).all()
    config_data = {}
    for config in configs:
        config_data[str(config.device_id)] = config.config_data
    return config_data


def update_config_parameter(db: Session, device_id: int, config_update: ConfigUpdate):
    db_config = db.query(DeviceConfig).filter(DeviceConfig.device_id == device_id).first()
    if db_config:
        config_data = db_config.config_data
        update_data = config_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            if isinstance(value, dict):
                config_data.setdefault(key, {}).update(value)
            else:
                config_data[key] = value
        db_config.config_data = config_data
        db.commit()
    else:
        raise ValueError(f"Конфігурація для пристрою з ідентифікатором {device_id} не знайдена")
