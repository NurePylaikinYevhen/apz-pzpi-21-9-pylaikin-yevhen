from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from models.esp import Device
from models.room import Room
from sсhemas.device import DeviceRead
from sсhemas.room import RoomCreate, RoomRead



def create_room(db: Session, room: RoomCreate):

    existing_room = db.query(Room).filter(Room.name == room.name).first()
    if existing_room:
        raise HTTPException(400, f"Кімната з назвою '{room.name}' вже існує")

    devices = []
    for mac in room.device_macs:
        device = db.query(Device).filter(Device.mac_address == mac).first()
        if not device:
            raise HTTPException(status_code=404, detail=f"Пристрій з MAC-адресом {mac} не знайдено.")
        devices.append(device)

    db_room = Room(name=room.name)
    db.add(db_room)
    db.flush()

    for device in devices:
        device.room_id = db_room.id

    db.commit()
    db.refresh(db_room)

    return db_room


def delete_room(db: Session, room_id: int):
    db_room = db.query(Room).filter(Room.id == room_id).first()
    if db_room:
        db.delete(db_room)
        db.commit()


def get_all_rooms(db: Session):
    rooms = db.query(Room).options(
        joinedload(Room.devices).joinedload(Device.measurements),
        joinedload(Room.devices).joinedload(Device.configs)
    ).all()
    return [RoomRead.from_orm(room) for room in rooms]


def get_room_devices(db: Session, room_id: int):
    devices = db.query(Device).filter(Device.room_id == room_id).options(
        joinedload(Device.measurements),
        joinedload(Device.configs)
    ).all()
    return [DeviceRead.from_orm(device) for device in devices]
