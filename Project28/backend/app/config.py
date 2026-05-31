from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "航天卫星轨道计算仿真平台"
    SQLALCHEMY_DATABASE_URL: str = "sqlite:///./satellite.db"

    class Config:
        case_sensitive = True


settings = Settings()
