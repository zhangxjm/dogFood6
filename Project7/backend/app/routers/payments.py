from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import crud, schemas

router = APIRouter(prefix="/api/payments", tags=["缴费记录"])


@router.get("/", response_model=List[schemas.Payment])
def read_payments(
    shop_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    payments = crud.get_payments(db, shop_id=shop_id, skip=skip, limit=limit)
    return payments


@router.get("/{payment_id}", response_model=schemas.Payment)
def read_payment(payment_id: int, db: Session = Depends(get_db)):
    db_payment = crud.get_payment(db, payment_id=payment_id)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="缴费记录不存在")
    return db_payment


@router.post("/", response_model=schemas.Payment)
def create_payment(payment: schemas.PaymentCreate, db: Session = Depends(get_db)):
    shop = crud.get_shop(db, shop_id=payment.shop_id)
    if shop is None:
        raise HTTPException(status_code=404, detail="商铺不存在")
    bill = crud.get_bill(db, bill_id=payment.bill_id)
    if bill is None:
        raise HTTPException(status_code=404, detail="账单不存在")
    return crud.create_payment(db=db, payment=payment)
