import json
from sqlalchemy.orm import Session, joinedload

from Task2.models.esp import Esp
from Task2.models.measurement import Measurement
from Task2.sсhemas.device import DeviceCreate, DeviceRead


def export_measurements(db: Session):
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
    return json.dumps(measurement_data)


def create_device(db: Session, device: DeviceCreate):
    device = Esp(mac_address=device.mac_address)
    db.add(device)
    db.commit()
    db.refresh(device)
    return device


def delete_device_by_mac(db: Session, mac_address: str):
    device = db.query(Esp).filter(Esp.mac_address == mac_address).first()
    if device:
        db.delete(device)
        db.commit()
    else:
        raise ValueError(f"Пристрій з mac-адресою '{mac_address}' не знайдено")


def get_device_by_mac(db: Session, mac_address: str):
    device = db.query(Esp).filter(Esp.mac_address == mac_address).options(
        joinedload(Esp.measurements),
        joinedload(Esp.configs)
    ).first()
    if not device:
        raise ValueError(f"Пристрій з mac-адресою '{mac_address}' не знайдено")
    return DeviceRead.from_orm(device)
