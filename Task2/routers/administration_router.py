from typing import List

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session

from Task2.get_db import get_db
from Task2.models.esp import Esp
from Task2.models.room import Room
from Task2.models.user import User
from Task2.services import device_service, room_service, config_service
from Task2.sсhemas.device import DeviceCreate
from Task2.sсhemas.room import RoomCreate

administration_router = APIRouter(tags=["admin"], prefix="/admin")


@administration_router.post("/rooms", response_model=Room)
def create_room(room: RoomCreate, db: Session = Depends(get_db)):  #, current_user: User = Depends(get_current_user)):
    #if current_user.role != "admin":
    #raise HTTPException(status_code=403, detail="Тільки адмін може створювати кімнати")
    try:
        return create_room(room, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@administration_router.delete("/rooms/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db)):  #, current_user: User = Depends(get_current_user)):
    #if current_user.role != "admin":
    #raise HTTPException(status_code=403, detail="Тільки адмін може видаляти кімнати")
    room_service.delete_room(db, room_id)
    return {"message": "Кімната видалена успішно"}


@administration_router.post("/devices", response_model=Esp)
def create_device(device: DeviceCreate,
                  db: Session = Depends(get_db)):  #, current_user: User = Depends(get_current_user)):
    #if current_user.role != "admin":
    #raise HTTPException(status_code=403, detail="Тільки адмін може додавати пристрої")
    return device_service.create_device(db, device)


@administration_router.delete("/devices/{mac_address}")
def delete_device(mac_address: str, db: Session = Depends(get_db)):  #, current_user: User = Depends(get_current_user)):
    #if current_user.role != "admin":
    #raise HTTPException(status_code=403, detail="Тільки адмін може видаляти пристрої")
    device_service.delete_device_by_mac(db, mac_address)
    return {"message": "Пристрій видалений успішно"}

@administration_router.get("/devices/{mac_address}")
def get_device(mac_address: str, db: Session = Depends(get_db)):  #, current_user: User = Depends(get_current_user)):
    #if current_user.role != "admin":
    #raise HTTPException(status_code=403, detail="Тільки адмін може видаляти пристрої")
    return device_service.get_device_by_mac(db, mac_address)


@administration_router.get("/rooms", response_model=List[Room])
def get_all_rooms(db: Session = Depends(get_db)):  #, current_user: User = Depends(get_current_user)):
    #if current_user.role not in ["admin", "manager"] and not current_user.is_banned:
    #raise HTTPException(status_code=403, detail="Тільки адмін та менеджер можуть переглядати кімнати")
    return room_service.get_all_rooms(db)


@administration_router.get("/rooms/{room_id}/devices", response_model=List[Esp])
def get_room_devices(room_id: int, db: Session = Depends(get_db)):  #, current_user: User = Depends(get_current_user)):
    #if current_user.role not in ["admin", "manager"] and not current_user.is_banned:
    #raise HTTPException(status_code=403, detail="Тільки адмін та менеджер можуть переглядати пристрої в кімнаті")
    return room_service.get_room_devices(db, room_id)


@administration_router.post("/config/import")
def import_config(file: UploadFile = File(...),
                  db: Session = Depends(get_db)):  #, current_user: User = Depends(get_current_user)):
    #if current_user.role not in ["admin", "manager"] and not current_user.is_banned:
    #raise HTTPException(status_code=403, detail="Тільки адмін та менеджер можуть імпортувати конфіг")
    config_service.import_config(db, file)
    return {"message": "Конфіг імпортовано успішно"}


@administration_router.get("/config/export")
def export_config(db: Session = Depends(get_db)):  #, current_user: User = Depends(get_current_user)):
    #if current_user.role not in ["admin", "manager"] and not current_user.is_banned:
    #raise HTTPException(status_code=403, detail="Тільки адмін та менеджер можуть експортувати конфіг")
    config = config_service.export_config(db)
    return config


@administration_router.put("/config/{config_id}")
def update_config_parameter(config_id: int, key: str, value: str,
                            db: Session = Depends(get_db)):  #, current_user: User = Depends(get_current_user)):
    #if current_user.role not in ["admin", "manager"] and not current_user.is_banned:
    #raise HTTPException(status_code=403, detail="Тільки адмін та менеджер можуть оновлювати параметри конфігурації")
    config_service.update_config_parameter(db, config_id, key, value)
    return {"message": "Параметр конфігурації оновлено успішно"}


@administration_router.get("/measurements/export")
def export_measurements(db: Session = Depends(get_db)):  #, current_user: User = Depends(get_current_user)):
    #if current_user.role not in ["admin", "manager"] and not current_user.is_banned:
    #raise HTTPException(status_code=403, detail="Тільки адмін та менеджер можуть експортувати всі дані вимірювань")
    measurements = device_service.export_measurements(db)
    return measurements

@administration_router.post("/ban/{username}")
def ban_user(username: str, db: Session = Depends(get_db)): #, current_user: User = Depends(get_current_user)):
    #if current_user.role not in ["admin", "manager"] and not current_user.is_banned:
    #raise HTTPException(status_code=403, detail="Тільки адмін може блокувати користувачів")
    ...

@administration_router.post("/unban/{username}")
def unban_user(username: str, db: Session = Depends(get_db)):
    #if current_user.role not in ["admin"] and not current_user.is_banned:
    #raise HTTPException(status_code=403, detail="Тільки адмін може розблокувати користувачів")
    ...

@administration_router.get("/change_role/{username}")
def change_role(username: str, role: str, db: Session = Depends(get_db)):
    #if current_user.role not in ["admin"] and not current_user.is_banned:
    #raise HTTPException(status_code=403, detail="Тільки адмін може змінювати ролі користувачів")
    ...


