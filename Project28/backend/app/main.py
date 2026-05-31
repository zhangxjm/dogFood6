from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import satellite, orbit, collision
from app.services.initializer import init_database

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(satellite.router, prefix=settings.API_V1_STR, tags=["satellites"])
app.include_router(orbit.router, prefix=settings.API_V1_STR, tags=["orbit"])
app.include_router(collision.router, prefix=settings.API_V1_STR, tags=["collision"])


@app.on_event("startup")
async def startup_event():
    init_database()


@app.get("/")
async def root():
    return {"message": settings.PROJECT_NAME, "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
