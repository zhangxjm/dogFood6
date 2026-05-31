from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from .config import settings
from .database import Base, engine
from .routers import auth, crafts, live, works, search, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    from .services.search import search_service
    search_service.connect()
    search_service.ensure_index()

    try:
        from .init_data import init_database
        init_database()
    except Exception as e:
        print(f"Init data warning: {e}")

    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="非遗手工技艺数字传承系统API - 集成直播SDK与Elasticsearch，实现技艺教学直播、步骤拆解、作品溯源",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["根路径"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "message": "非遗手工技艺数字传承系统 API 服务已启动",
        "docs": "/docs",
        "api_prefix": "/api"
    }


@app.get("/health", tags=["健康检查"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": __import__("datetime").datetime.utcnow().isoformat()
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "type": type(exc).__name__
        }
    )


app.include_router(auth.router, prefix="/api")
app.include_router(crafts.router, prefix="/api")
app.include_router(live.router, prefix="/api")
app.include_router(works.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
