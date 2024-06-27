from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class PredictionInput(BaseModel):
    device_id: int
    Temperature: float
    Humidity: float
    CO2: float


class StatisticsInput(BaseModel):
    time_from: datetime
    time_to: datetime


class RoomStatisticsInput(StatisticsInput):
    room_id: int


class StatisticsOutput(BaseModel):
    device_id: str
    avg_temperature: float
    median_temperature: float
    temperature_deviation: float
    avg_humidity: float
    median_humidity: float
    humidity_deviation: float
    avg_co2: float
    median_co2: float
    co2_deviation: float
    avg_productivity: float
    median_productivity: float
    productivity_deviation: float


class StatisticsResponse(BaseModel):
    statistics: List[StatisticsOutput]
