from sqlalchemy import Column, Integer, JSON, ForeignKey, String
from sqlalchemy.orm import relationship

from get_db import Base


class DeviceConfig(Base):
    __tablename__ = "device_configs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"))
    config_data = Column(JSON)
    device = relationship("Device", back_populates="configs")
