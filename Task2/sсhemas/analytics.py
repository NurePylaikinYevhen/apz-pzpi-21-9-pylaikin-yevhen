from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PredictionInput(BaseModel):
    device_id: int
    Temperature: float
    Humidity: float
    CO2: float

class StatisticsInput(BaseModel):
    time_from: datetime
    time_to: datetime
    room_id: Optional[int] = None