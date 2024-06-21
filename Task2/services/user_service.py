from http.client import HTTPException

from sqlalchemy.orm import Session

from models.user import User


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
