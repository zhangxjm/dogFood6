from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import engine, Base
from .routers import categories, templates, notes

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="简历模板管理系统 API",
    description="FastAPI + Vue3 线上简历模板整理选用系统",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.include_router(categories.router)
app.include_router(templates.router)
app.include_router(notes.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "系统运行正常"}
