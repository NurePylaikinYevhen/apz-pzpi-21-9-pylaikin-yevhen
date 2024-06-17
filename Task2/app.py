from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .get_db import initialize_db, close_connection
from Task2.routers.administration_router import administration_router
from Task2.routers.analytics_router import analytics_router
from Task2.routers.auth_router import auth_router

app = FastAPI(
    title="Програмна система для контролю впливу мікроклімату офісу на активність робітників",
    description="...",
    version="0.1"
)

api = APIRouter(prefix="/api")


@app.on_event("startup")
async def startup():
    initialize_db()


@app.on_event("shutdown")
async def shutdown():
    await close_connection()


api.include_router(administration_router)
api.include_router(analytics_router)
api.include_router(auth_router)
app.include_router(api)
