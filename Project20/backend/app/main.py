from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .config import settings
from .database import engine, Base
from .routers import images, annotations, detection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="航天遥感影像智能解译平台 - 提供卫星影像地物识别、变化检测、数据标注等功能",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(images.router, prefix=settings.API_V1_STR)
app.include_router(annotations.router, prefix=settings.API_V1_STR)
app.include_router(detection.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "message": "航天遥感影像智能解译平台 API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
