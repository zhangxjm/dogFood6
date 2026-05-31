from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "非遗数字化三维复原平台"
    API_V1_PREFIX: str = "/api/v1"
    
    DATABASE_URL: str = "sqlite:///./heritage_platform.db"
    
    MINIO_ENDPOINT: str = "localhost"
    MINIO_PORT: int = 9000
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_SECURE: bool = False
    MINIO_BUCKET_3D: str = "heritage-3d-models"
    MINIO_BUCKET_TEXTURE: str = "heritage-textures"
    MINIO_BUCKET_POINTCLOUD: str = "heritage-pointclouds"
    
    MAX_UPLOAD_SIZE: int = 500 * 1024 * 1024
    
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]
    
    class Config:
        env_file = ".env"


settings = Settings()
