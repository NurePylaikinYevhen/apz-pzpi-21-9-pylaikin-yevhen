from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from Task2.get_db import Base


class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    timestamp = Column(DateTime)
    temperature = Column(Float)
    humidity = Column(Float)
    co2 = Column(Float)
    device = relationship("Device", back_populates="measurements")