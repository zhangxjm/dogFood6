from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import crud, schemas

router = APIRouter(prefix="/api/meter-readings", tags=["水电读数"])


@router.get("/", response_model=List[schemas.MeterReading])
def read_meter_readings(
    shop_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    readings = crud.get_meter_readings(db, shop_id=shop_id, skip=skip, limit=limit)
    return readings


@router.get("/last/{shop_id}", response_model=Optional[schemas.MeterReading])
def read_last_meter_reading(shop_id: int, db: Session = Depends(get_db)):
    reading = crud.get_last_meter_reading(db, shop_id=shop_id)
    return reading


@router.get("/{reading_id}", response_model=schemas.MeterReading)
def read_meter_reading(reading_id: int, db: Session = Depends(get_db)):
    db_reading = crud.get_meter_reading(db, reading_id=reading_id)
    if db_reading is None:
        raise HTTPException(status_code=404, detail="读数记录不存在")
    return db_reading


@router.post("/", response_model=schemas.MeterReading)
def create_meter_reading(reading: schemas.MeterReadingCreate, db: Session = Depends(get_db)):
    shop = crud.get_shop(db, shop_id=reading.shop_id)
    if shop is None:
        raise HTTPException(status_code=404, detail="商铺不存在")
    return crud.create_meter_reading(db=db, reading=reading)
