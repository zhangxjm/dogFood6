from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, SessionLocal
from app.utils.init_data import init_db, seed_data
from app.services.minio_service import minio_service
from app.routers import heritage, pointcloud, texture, copyright

app = FastAPI(
    title=settings.APP_NAME,
    description="非遗数字化三维复原平台 - 提供文物三维建模、纹理修复、数字版权存证服务",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(heritage.router, prefix=settings.API_V1_PREFIX)
app.include_router(pointcloud.router, prefix=settings.API_V1_PREFIX)
app.include_router(texture.router, prefix=settings.API_V1_PREFIX)
app.include_router(copyright.router, prefix=settings.API_V1_PREFIX)


@app.on_event("startup")
async def startup_event():
    init_db()
    minio_service.ensure_buckets()
    
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "app_name": settings.APP_NAME,
        "version": "1.0.0",
        "endpoints": {
            "heritage": "/api/v1/heritage/",
            "pointcloud": "/api/v1/pointcloud/",
            "texture": "/api/v1/texture/",
            "copyright": "/api/v1/copyright/"
        },
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "minio": "connected"
    }
