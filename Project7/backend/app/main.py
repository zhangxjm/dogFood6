from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import shops, meter_readings, bills, payments, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="商业商铺水电费用统计系统",
    description="商铺水电读数录入、费用核算、缴费记录、欠费提醒管理系统",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shops.router)
app.include_router(meter_readings.router)
app.include_router(bills.router)
app.include_router(payments.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {
        "message": "商业商铺水电费用统计系统 API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
