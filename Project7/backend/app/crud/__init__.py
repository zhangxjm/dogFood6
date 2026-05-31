from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import date, datetime
from app import models, schemas


def get_shop(db: Session, shop_id: int):
    return db.query(models.Shop).filter(models.Shop.id == shop_id).first()


def get_shop_by_number(db: Session, shop_number: str):
    return db.query(models.Shop).filter(models.Shop.shop_number == shop_number).first()


def get_shops(db: Session, skip: int = 0, limit: int = 100, is_active: Optional[bool] = None):
    query = db.query(models.Shop)
    if is_active is not None:
        query = query.filter(models.Shop.is_active == is_active)
    return query.order_by(models.Shop.shop_number).offset(skip).limit(limit).all()


def create_shop(db: Session, shop: schemas.ShopCreate):
    db_shop = models.Shop(**shop.model_dump())
    db.add(db_shop)
    db.commit()
    db.refresh(db_shop)
    return db_shop


def update_shop(db: Session, shop_id: int, shop: schemas.ShopUpdate):
    db_shop = get_shop(db, shop_id)
    if db_shop:
        for key, value in shop.model_dump().items():
            setattr(db_shop, key, value)
        db.commit()
        db.refresh(db_shop)
    return db_shop


def delete_shop(db: Session, shop_id: int):
    db_shop = get_shop(db, shop_id)
    if db_shop:
        db.delete(db_shop)
        db.commit()
    return db_shop


def get_meter_reading(db: Session, reading_id: int):
    return db.query(models.MeterReading).filter(models.MeterReading.id == reading_id).first()


def get_meter_readings(db: Session, shop_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.MeterReading)
    if shop_id:
        query = query.filter(models.MeterReading.shop_id == shop_id)
    return query.order_by(models.MeterReading.reading_date.desc()).offset(skip).limit(limit).all()


def get_last_meter_reading(db: Session, shop_id: int):
    return db.query(models.MeterReading).filter(
        models.MeterReading.shop_id == shop_id
    ).order_by(models.MeterReading.reading_date.desc()).first()


def create_meter_reading(db: Session, reading: schemas.MeterReadingCreate):
    electric_usage = reading.electric_current - reading.electric_previous
    water_usage = reading.water_current - reading.water_previous
    
    db_reading = models.MeterReading(
        **reading.model_dump(),
        electric_usage=electric_usage,
        water_usage=water_usage
    )
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)
    return db_reading


def get_bill(db: Session, bill_id: int):
    return db.query(models.Bill).filter(models.Bill.id == bill_id).first()


def get_bills(
    db: Session, 
    shop_id: Optional[int] = None, 
    is_paid: Optional[bool] = None,
    bill_month: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100
):
    query = db.query(models.Bill)
    if shop_id:
        query = query.filter(models.Bill.shop_id == shop_id)
    if is_paid is not None:
        query = query.filter(models.Bill.is_paid == is_paid)
    if bill_month:
        query = query.filter(models.Bill.bill_month == bill_month)
    return query.order_by(models.Bill.bill_month.desc(), models.Bill.id).offset(skip).limit(limit).all()


def create_bill(db: Session, bill: schemas.BillCreate):
    db_bill = models.Bill(**bill.model_dump())
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)
    return db_bill


def update_bill(db: Session, bill_id: int, bill: schemas.BillUpdate):
    db_bill = get_bill(db, bill_id)
    if db_bill:
        update_data = bill.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_bill, key, value)
        db.commit()
        db.refresh(db_bill)
    return db_bill


def generate_bill_from_reading(db: Session, reading_id: int):
    reading = get_meter_reading(db, reading_id)
    if not reading:
        return None
    
    shop = get_shop(db, reading.shop_id)
    if not shop:
        return None
    
    existing_bill = db.query(models.Bill).filter(
        models.Bill.meter_reading_id == reading_id
    ).first()
    if existing_bill:
        return existing_bill
    
    electric_amount = reading.electric_usage * shop.electric_rate
    water_amount = reading.water_usage * shop.water_rate
    total_amount = electric_amount + water_amount
    
    bill_month = reading.reading_date.strftime("%Y-%m")
    deadline_date = date(reading.reading_date.year, reading.reading_date.month, 25)
    
    bill = schemas.BillCreate(
        shop_id=shop.id,
        meter_reading_id=reading_id,
        bill_month=bill_month,
        electric_usage=reading.electric_usage,
        electric_amount=round(electric_amount, 2),
        water_usage=reading.water_usage,
        water_amount=round(water_amount, 2),
        total_amount=round(total_amount, 2),
        payment_deadline=deadline_date
    )
    
    return create_bill(db, bill)


def get_payment(db: Session, payment_id: int):
    return db.query(models.Payment).filter(models.Payment.id == payment_id).first()


def get_payments(db: Session, shop_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Payment)
    if shop_id:
        query = query.filter(models.Payment.shop_id == shop_id)
    return query.order_by(models.Payment.payment_date.desc()).offset(skip).limit(limit).all()


def create_payment(db: Session, payment: schemas.PaymentCreate):
    db_payment = models.Payment(**payment.model_dump())
    db.add(db_payment)
    
    bill = get_bill(db, payment.bill_id)
    if bill:
        bill.is_paid = True
    
    db.commit()
    db.refresh(db_payment)
    return db_payment


def get_overdue_bills(db: Session, today: Optional[date] = None):
    if today is None:
        today = date.today()
    return db.query(models.Bill).filter(
        and_(
            models.Bill.is_paid == False,
            models.Bill.payment_deadline < today
        )
    ).all()


def get_dashboard_stats(db: Session):
    today = date.today()
    current_month = today.strftime("%Y-%m")
    
    total_shops = db.query(func.count(models.Shop.id)).filter(models.Shop.is_active == True).scalar()
    
    unpaid_bills = db.query(models.Bill).filter(models.Bill.is_paid == False).all()
    total_unpaid_bills = len(unpaid_bills)
    total_unpaid_amount = sum(b.total_amount for b in unpaid_bills)
    
    monthly_payments = db.query(models.Payment).filter(
        func.to_char(models.Payment.payment_date, 'YYYY-MM') == current_month
    ).all()
    total_monthly_revenue = sum(p.amount for p in monthly_payments)
    
    overdue_bills = get_overdue_bills(db, today)
    overdue_count = len(overdue_bills)
    overdue_amount = sum(b.total_amount for b in overdue_bills)
    
    return schemas.DashboardStats(
        total_shops=total_shops or 0,
        total_unpaid_bills=total_unpaid_bills,
        total_unpaid_amount=round(total_unpaid_amount, 2),
        total_monthly_revenue=round(total_monthly_revenue, 2),
        overdue_count=overdue_count,
        overdue_amount=round(overdue_amount, 2)
    )
