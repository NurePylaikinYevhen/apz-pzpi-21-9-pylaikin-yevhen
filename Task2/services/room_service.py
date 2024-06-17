from http.client import HTTPException

from sqlalchemy.orm import Session, joinedload

from Task2.models.esp import Esp
from Task2.models.room import Room
from Task2.sсhemas.device import DeviceRead
from Task2.sсhemas.room import RoomCreate, RoomRead


def create_room(db: Session, room: RoomCreate):
    for mac in room.device_macs:
        device = db.query(Esp).filter(Esp.mac_address == mac).first()
        if not device:
            raise HTTPException(status_code=400, detail=f"Device with MAC address {mac} not found.")

    db_room = Room(name=room.name)
    db.add(db_room)
    db.commit()
    db.refresh(db_room)

    devices = []
    for mac in room.device_macs:
        device = db.query(Esp).filter(Esp.mac_address == mac).first()
        device.room_id = db_room.id
        devices.append(device)

    db.add_all(devices)
    db.commit()

    return db_room


def delete_room(db: Session, room_id: int):
    db_room = db.query(Room).filter(Room.id == room_id).first()
    if db_room:
        db.delete(db_room)
        db.commit()


def get_all_rooms(db: Session):
    rooms = db.query(Room).options(
        joinedload(Room.devices).joinedload(Esp.measurements),
        joinedload(Room.devices).joinedload(Esp.configs)
    ).all()
    return [RoomRead.from_orm(room) for room in rooms]


def get_room_devices(db: Session, room_id: int):
    devices = db.query(Esp).filter(Esp.room_id == room_id).options(
        joinedload(Esp.measurements),
        joinedload(Esp.configs)
    ).all()
    return [DeviceRead.from_orm(device) for device in devices]
