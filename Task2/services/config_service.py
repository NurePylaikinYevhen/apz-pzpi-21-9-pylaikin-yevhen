from sqlalchemy.orm import Session
import json

from Task2.models.deviceconfig import DeviceConfig


def import_config(db: Session, device_id: int, file):
    config_data = json.load(file.file)
    db_config = DeviceConfig(device_id=device_id, config_data=config_data)
    db.add(db_config)
    db.commit()


def export_config(db: Session):
    configs = db.query(DeviceConfig).all()
    config_data = {}
    for config in configs:
        config_data[str(config.device_id)] = config.config_data
    return config_data


def update_config_parameter(db: Session, config_id: int, key: str, value: str):
    db_config = db.query(DeviceConfig).filter(DeviceConfig.id == config_id).first()
    if db_config:
        config_data = db_config.config_data
        if key in config_data:
            config_data[key] = value
            db_config.config_data = config_data
            db.commit()
        else:
            raise ValueError(f"Параметр '{key}' не знайдено в конфігурації")
