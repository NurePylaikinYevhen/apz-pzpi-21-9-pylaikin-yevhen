from fastapi import APIRouter, HTTPException, Depends

from services import analytics_service
from sqlalchemy.orm import Session
from starlette.responses import FileResponse

from sсhemas.analytics import StatisticsInput, PredictionInput, StatisticsResponse, RoomStatisticsInput

from get_db import get_db

from sсhemas.measurement import EnvironmentDataInput

analytics_router = APIRouter(tags=["analytics"], prefix="/analytics")


@analytics_router.post("/predict")
def predict_productivity(input_data: PredictionInput, db: Session = Depends(get_db)):
    try:
        prediction, recommendations = analytics_service.calculate_prediction(
            db, input_data.device_id, input_data.Temperature, input_data.Humidity, input_data.CO2
        )
        return {"prediction": prediction, "recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@analytics_router.post("/statistics/all", response_model=StatisticsResponse)
async def get_all_statistics(input_data: StatisticsInput, db: Session = Depends(get_db)):
    try:
        statistics = analytics_service.get_statistics(db, input_data.time_from, input_data.time_to)
        return StatisticsResponse(statistics=statistics)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@analytics_router.post("/statistics/room", response_model=StatisticsResponse)
async def get_room_statistics(input_data: RoomStatisticsInput, db: Session = Depends(get_db)):
    try:
        statistics = analytics_service.get_statistics(db, input_data.time_from, input_data.time_to, input_data.room_id)
        return StatisticsResponse(statistics=statistics)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@analytics_router.post("/record_environment")
def record_environment(input_data: EnvironmentDataInput, db: Session = Depends(get_db)):
    try:
        response = analytics_service.record_environment_data(db, input_data)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
