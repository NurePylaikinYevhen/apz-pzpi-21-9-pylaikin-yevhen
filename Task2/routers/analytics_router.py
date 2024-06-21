from fastapi import APIRouter, HTTPException, Depends

from services import analytics_service
from sqlalchemy.orm import Session
from starlette.responses import FileResponse

from sсhemas.analytics import StatisticsInput, PredictionInput

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

@analytics_router.post("/statistics")
def get_statistics(input_data: StatisticsInput, db: Session = Depends(get_db)):
    try:
        excel_file = analytics_service.generate_statistics(
            db, input_data.time_from, input_data.time_to
        )
        return FileResponse(
            excel_file,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename="statistics.xlsx"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@analytics_router.post("/statistics_room")
def get_statistics_room(input_data: StatisticsInput, db: Session = Depends(get_db)):
    try:
        excel_file = analytics_service.generate_statistics_room(
            db, input_data.time_from, input_data.time_to, input_data.room_id
        )
        return FileResponse(
            excel_file,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename="statistics_room.xlsx"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@analytics_router.post("/record_environment")
def record_environment(input_data: EnvironmentDataInput, db: Session = Depends(get_db)):
    try:
        response = analytics_service.record_environment_data(db, input_data)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))