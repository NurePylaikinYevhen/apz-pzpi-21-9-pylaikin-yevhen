from sqlalchemy import Integer, Column, String, Enum, Boolean

from get_db import Base


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True)
    password_hash = Column(String)
    role = Column(Enum('manager', 'admin', name='user_role'))
    is_banned = Column(Boolean, default=False)
