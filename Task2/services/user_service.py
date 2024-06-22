from datetime import timedelta
from fastapi import HTTPException, status

from sqlalchemy.orm import Session

from models.user import User

from auth import authenticate_user, get_password_hash, verify_password, create_access_token

from Constants import ACCESS_TOKEN_EXPIRE_MINUTES


def register_user(db: Session, username: str, password: str, role: str = "manager"):
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Користувач з таким ім'ям вже існує")

    hashed_password = get_password_hash(password)
    new_user = User(username=username, password_hash=hashed_password, role=role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def login(db: Session, username: str, password: str):
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


def change_password(db: Session, user: User, old_password: str, new_password: str):
    if not verify_password(old_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Не вірний старий пароль")

    user.password_hash = get_password_hash(new_password)
    db.commit()


def ban_user(db: Session, username: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    user.is_banned = True
    db.commit()


def unban_user(db: Session, username: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    user.is_banned = False
    db.commit()


def change_role(db: Session, username: str, role: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    if role not in ['manager', 'admin']:
        raise HTTPException(status_code=400, detail="Неправильна роль")
    user.role = role
    db.commit()
