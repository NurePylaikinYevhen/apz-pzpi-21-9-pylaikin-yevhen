import copy
import traceback
from typing import Optional, Dict, Any, List, Union

from fastapi import UploadFile, HTTPException
from sqlalchemy import inspect
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
import json

from models.deviceconfig import DeviceConfig
from sqlalchemy.orm.attributes import flag_modified
from sсhemas.config import ConfigUpdate
from sсhemas.config import ConfigExport
from sсhemas.config import ConfigImport
from logger import logger


def get_device_config(db: Session, device_id: int) -> DeviceConfig:
    db_config = db.query(DeviceConfig).filter(DeviceConfig.device_id == device_id).first()
    if not db_config:
        raise ValueError(f"Конфігурацію для пристрою з ідентифікатором {device_id} не знайдено")
    return db_config


def update_config_data(config_data: dict, update_data: dict) -> dict:
    if config_data is None:
        config_data = {}

    for key, value in update_data.items():
        if isinstance(value, dict):
            config_data.setdefault(key, {}).update(value)
        else:
            config_data[key] = value

    return config_data


def save_config(db: Session, db_config: DeviceConfig):
    flag_modified(db_config, "config_data")
    db.add(db_config)
    try:
        db.commit()
        db.refresh(db_config)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Помилка бази даних при збереженні конфігурації")



def import_config(db: Session, data: Dict[str, Any], device_id: Optional[int] = None) -> int:
    if device_id is not None:
        # Імпорт для конкретного пристрою
        if not isinstance(data, dict):
            raise ValueError("Для імпорту конфігурації конкретного пристрою дані повинні бути словником")
        config = ConfigImport(**data)
        db_config = db.query(DeviceConfig).filter(DeviceConfig.device_id == device_id).first()
        if db_config:
            db_config.config_data = config.dict()
        else:
            db_config = DeviceConfig(device_id=device_id, config_data=config.dict())
            db.add(db_config)
        db.commit()
        return 1
    else:
        # Імпорт всього файлу
        if not isinstance(data, dict) or not all(isinstance(k, str) and k.isdigit() for k in data.keys()):
            raise ValueError("Для імпорту всіх конфігурацій дані повинні бути словником з числовими ключами")
        imported_count = 0
        for dev_id, config_data in data.items():
            config = ConfigImport(**config_data)
            db_config = db.query(DeviceConfig).filter(DeviceConfig.device_id == int(dev_id)).first()
            if db_config:
                db_config.config_data = config.dict()
            else:
                db_config = DeviceConfig(device_id=int(dev_id), config_data=config.dict())
                db.add(db_config)
            imported_count += 1
        db.commit()
        return imported_count


def export_config(db: Session, device_id: Optional[int] = None) -> Union[Dict[str, ConfigExport], ConfigExport]:
    if device_id:
        config = db.query(DeviceConfig).filter(DeviceConfig.device_id == device_id).first()
        if not config:
            raise HTTPException(status_code=404, detail=f"Конфігурацію для пристрою з ID {device_id} не знайдено")
        return ConfigExport(
            device_id=config.device_id,
            productivity_norm=config.config_data.get('productivity_norm'),
            **{k: v for k, v in config.config_data.items() if k != 'productivity_norm'}
        )
    else:
        configs = db.query(DeviceConfig).all()
        return {
            str(config.device_id): ConfigExport(
                device_id=config.device_id,
                productivity_norm=config.config_data.get('productivity_norm'),
                **{k: v for k, v in config.config_data.items() if k != 'productivity_norm'}
            )
            for config in configs
        }


def update_config_parameter(db: Session, device_id: int, config_update: ConfigUpdate):
    try:
        db_config = get_device_config(db, device_id)
        original_config = copy.deepcopy(db_config.config_data)
        update_data = config_update.dict(exclude_unset=True, exclude_none=True)

        db_config.config_data = update_config_data(db_config.config_data, update_data)

        if db_config.config_data != original_config:
            save_config(db, db_config)

        return db_config.config_data
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Помилка бази даних при оновленні конфігурації")
    except Exception:
        raise HTTPException(status_code=500, detail="Неочікувана помилка при оновленні конфігурації")