import json
import traceback
from datetime import datetime
from typing import List, Optional, Union, Dict

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Query, Body
from fastapi.responses import Response
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from get_db import get_db
from models.esp import Device
from models.room import Room
from services import room_service, device_service, config_service, user_service
from sсhemas.config import ConfigUpdate
from sсhemas.device import DeviceCreate
from sсhemas.room import RoomCreate
from sсhemas.config import ConfigImport
from sсhemas.config import CustomJSONEncoder

from sсhemas.room import RoomRead

from sсhemas.device import DeviceRead

from logger import logger

from models.user import User

from auth import get_current_manager_or_admin, get_current_user, get_current_admin

administration_router = APIRouter(tags=["admin"], prefix="/admin")


@administration_router.post("/rooms", response_model=RoomRead)
def create_room(
        room: RoomCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_admin)):
    try:
        room_service.create_room(db, room)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@administration_router.delete("/rooms/{room_id}")
def delete_room(
        room_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_admin)):
    try:
        room_service.delete_room(db, room_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"message": "Кімната видалена успішно"}


@administration_router.post("/devices")
def create_device(device: DeviceCreate,
                  db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_admin)):
    try:
        device_service.create_device(db, device)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Пристрій створений успішно"}


@administration_router.delete("/devices/{mac_address}")
def delete_device(mac_address: str,
                  db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_admin)):
    try:
        device_service.delete_device_by_mac(db, mac_address)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"message": "Пристрій видалений успішно"}


@administration_router.get("/devices/{mac_address}")
def get_device(
        mac_address: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_admin)):
    try:
        return device_service.get_device_by_mac(db, mac_address)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@administration_router.get("/rooms", response_model=List[RoomRead])
def get_all_rooms(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_manager_or_admin)
):

    return room_service.get_all_rooms(db)


@administration_router.get("/rooms/{room_id}/devices", response_model=List[DeviceRead])
def get_room_devices(
        room_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_manager_or_admin)):

    return room_service.get_room_devices(db, room_id)


@administration_router.post("/config/import")
async def import_config(
    file: UploadFile = File(...),
    device_id: Optional[int] = Query(None, description="ID пристрою для імпорту конфігурації"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager_or_admin)
):
    content = await file.read()
    try:
        data = json.loads(content)
        result = config_service.import_config(db, data, device_id)
        return {"message": f"Успішно імпортовано {result} конфігурацій"}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Некоректний формат JSON")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Внутрішня помилка сервера: {str(e)}")


@administration_router.get("/config/export")
def export_config(
    db: Session = Depends(get_db),
    device_id: Optional[int] = Query(None, description="ID пристрою для експорту конфігурації"),
    current_user: User = Depends(get_current_manager_or_admin)
):
    config_data = config_service.export_config(db, device_id)
    if not config_data:
        raise HTTPException(status_code=404, detail="Конфігурацію не знайдено")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"config_export_{timestamp}.json"
    if device_id:
        filename = f"config_device_{device_id}_{timestamp}.json"

    return Response(
        content=json.dumps(config_data, cls=CustomJSONEncoder, indent=2, ensure_ascii=False),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@administration_router.put("/config/{device_id}")
def update_config_parameter(
        device_id: int,
        config_update: ConfigUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_manager_or_admin)
):
    try:
        updated_config = config_service.update_config_parameter(db, device_id, config_update)
        logger.info(f"Configuration updated successfully for device {device_id}")
        return {"message": "Конфігурацію успішно оновлено", "updated_config": updated_config}
    except ValidationError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        logger.error(f"Value error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Помилка бази даних")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Внутрішня помилка сервера")


@administration_router.get("/measurements/export")
def export_measurements(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_manager_or_admin)
):

    measurements = device_service.export_measurements(db)
    return measurements


@administration_router.post("/ban/{username}")
def ban_user(
        username: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_admin)):

    try:
        user_service.ban_user(db, username)
        return {"message": f"Користувач {username} розблокований"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@administration_router.post("/unban/{username}")
def unban_user(
        username: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_admin)):

    try:
        user_service.unban_user(db, username)
        return {"message": f"Користувач {username} розблокований"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@administration_router.get("/change_role/{username}")
def change_role(
        username: str,
        role: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_admin)):

    try:
        user_service.change_role(db, username, role)
        return {"message": f"Роль користувача {username} змінена на {role}"}
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=str(e.detail))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
