from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app import crud, schemas

router = APIRouter(prefix="/api/bills", tags=["费用核算"])


@router.get("/", response_model=List[schemas.Bill])
def read_bills(
    shop_id: Optional[int] = None,
    is_paid: Optional[bool] = None,
    bill_month: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    bills = crud.get_bills(
        db, shop_id=shop_id, is_paid=is_paid,
        bill_month=bill_month, skip=skip, limit=limit
    )
    return bills


@router.get("/overdue", response_model=List[schemas.Bill])
def read_overdue_bills(db: Session = Depends(get_db)):
    bills = crud.get_overdue_bills(db)
    return bills


@router.get("/{bill_id}", response_model=schemas.Bill)
def read_bill(bill_id: int, db: Session = Depends(get_db)):
    db_bill = crud.get_bill(db, bill_id=bill_id)
    if db_bill is None:
        raise HTTPException(status_code=404, detail="账单不存在")
    return db_bill


@router.post("/", response_model=schemas.Bill)
def create_bill(bill: schemas.BillCreate, db: Session = Depends(get_db)):
    shop = crud.get_shop(db, shop_id=bill.shop_id)
    if shop is None:
        raise HTTPException(status_code=404, detail="商铺不存在")
    return crud.create_bill(db=db, bill=bill)


@router.post("/generate/{reading_id}", response_model=schemas.Bill)
def generate_bill(reading_id: int, db: Session = Depends(get_db)):
    bill = crud.generate_bill_from_reading(db, reading_id=reading_id)
    if bill is None:
        raise HTTPException(status_code=404, detail="读数记录不存在或商铺不存在")
    return bill


@router.put("/{bill_id}", response_model=schemas.Bill)
def update_bill(bill_id: int, bill: schemas.BillUpdate, db: Session = Depends(get_db)):
    db_bill = crud.get_bill(db, bill_id=bill_id)
    if db_bill is None:
        raise HTTPException(status_code=404, detail="账单不存在")
    return crud.update_bill(db=db, bill_id=bill_id, bill=bill)
