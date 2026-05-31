from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "航天遥感影像智能解译平台"
    
    SQLALCHEMY_DATABASE_URL: str = "sqlite:///./remote_sensing.db"
    
    ELASTICSEARCH_HOST: str = "http://localhost:9200"
    ELASTICSEARCH_USERNAME: Optional[str] = None
    ELASTICSEARCH_PASSWORD: Optional[str] = None
    
    UPLOAD_DIR: str = "./uploads"
    THUMBNAIL_DIR: str = "./thumbnails"
    
    class Config:
        case_sensitive = True


settings = Settings()
