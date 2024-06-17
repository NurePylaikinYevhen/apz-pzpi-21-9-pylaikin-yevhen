

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from Task2.get_db import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    devices = relationship("Device", back_populates="room", cascade="delete, delete-orphan")