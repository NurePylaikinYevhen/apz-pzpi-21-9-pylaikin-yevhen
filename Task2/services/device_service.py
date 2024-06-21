import json
from typing import List, Dict

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from models.esp import Device
from models.measurement import Measurement
from sсhemas.device import DeviceCreate, DeviceRead


def export_measurements(db: Session) -> List[Dict]:
    measurements = db.query(Measurement).all()
    measurement_data = []
    for measurement in measurements:
        measurement_data.append({
            "id": measurement.id,
            "device_id": measurement.device_id,
            "timestamp": measurement.timestamp.isoformat(),
            "temperature": measurement.temperature,
            "humidity": measurement.humidity,
            "co2": measurement.co2
        })
    return measurement_data


def create_device(db: Session, device: DeviceCreate):
    db_device = db.query(Device).filter(Device.mac_address == device.mac_address).first()
    if db_device:
        raise HTTPException(400, f"Пристрій з mac-адресою '{device.mac_address}' вже існує")
    new_device = Device(mac_address=device.mac_address)
    db.add(new_device)
    db.commit()
    db.refresh(new_device)


def delete_device_by_mac(db: Session, mac_address: str):
    device = db.query(Device).filter(Device.mac_address == mac_address).first()
    if device:
        db.delete(device)
        db.commit()
    else:
        raise ValueError(f"Пристрій з mac-адресою '{mac_address}' не знайдено")


def get_device_by_mac(db: Session, mac_address: str):
    device = db.query(Device).filter(Device.mac_address == mac_address).options(
        joinedload(Device.measurements),
        joinedload(Device.configs)
    ).first()
    if not device:
        raise ValueError(f"Пристрій з mac-адресою '{mac_address}' не знайдено")
    return DeviceRead.from_orm(device)
