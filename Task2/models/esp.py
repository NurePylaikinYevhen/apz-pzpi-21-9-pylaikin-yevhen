from sqlalchemy import Integer, Column, String, ForeignKey
from sqlalchemy.orm import relationship

from get_db import Base


class Device(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True, index=True)
    mac_address = Column(String, unique=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    room = relationship("Room", back_populates="devices")
    measurements = relationship("Measurement", back_populates="device")
    configs = relationship("DeviceConfig", back_populates="device")
