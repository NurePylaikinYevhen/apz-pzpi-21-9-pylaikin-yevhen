from fastapi import APIRouter, status, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from services import user_service
from models.user import User
from auth import get_current_active_user
from sсhemas.user import PasswordChangeInput, UserCreate, UserOut, LoginInput, LoginResult
from get_db import get_db
from auth import get_current_admin

auth_router = APIRouter(tags=["auth"], prefix="/auth")


@auth_router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(
        user: UserCreate,
        db: Session = Depends(get_db)):
        #current_user: User = Depends(get_current_admin)):
    try:
        return user_service.register_user(db, user.username, user.password, user.role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@auth_router.post("/login", response_model=LoginResult)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        return user_service.login(db, form_data.username, form_data.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail="Неправильне ім'я користувача або пароль")


@auth_router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@auth_router.put("/password")
def change_password(password_change: PasswordChangeInput, current_user: User = Depends(get_current_active_user),
                    db: Session = Depends(get_db)):
    try:
        user_service.change_password(db, current_user, password_change.old_password, password_change.new_password)
        return {"message": "Пароль успішно змінено"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


