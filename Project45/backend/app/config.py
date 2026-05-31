from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "非遗手工技艺数字传承系统"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./heritage.db"

    ELASTICSEARCH_URL: str = "http://localhost:9200"
    ELASTICSEARCH_INDEX: str = "heritage_content"

    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    ZEGO_APP_ID: int = 123456789
    ZEGO_SERVER_SECRET: str = "your-zego-server-secret"

    LIVE_LOW_LATENCY: bool = True
    LIVE_BUFFER_SIZE: int = 2
    MAX_CONCURRENT_LIVES: int = 100

    CORS_ORIGINS: list = ["*"]


settings = Settings()
