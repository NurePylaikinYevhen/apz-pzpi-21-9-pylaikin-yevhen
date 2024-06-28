from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict


class PredictionInput(BaseModel):
    mac_address: str
    Temperature: float
    Humidity: float
    CO2: float


class ParameterStats(BaseModel):
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    quartiles: Optional[List[Optional[float]]] = None
    iqr: Optional[float] = None
    skewness: Optional[float] = None
    kurtosis: Optional[float] = None


class TimeStats(BaseModel):
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration: Optional[float] = None
    hourly_trends: Optional[Dict[str, List[Optional[float]]]] = None


class StatisticsOutput(BaseModel):
    device_id: str
    temperature: Optional[ParameterStats] = None
    humidity: Optional[ParameterStats] = None
    co2: Optional[ParameterStats] = None
    productivity: Optional[ParameterStats] = None
    time_stats: Optional[TimeStats] = None


class StatisticsInput(BaseModel):
    time_from: datetime
    time_to: datetime


class RoomStatisticsInput(StatisticsInput):
    room_id: int


class StatisticsResponse(BaseModel):
    statistics: List[StatisticsOutput]
