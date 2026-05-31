from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import CheckinRecord
from schemas import CheckinCreate, CheckinOut, CheckinStatsOut

router = APIRouter(prefix="/api")


@router.post("/checkin", response_model=CheckinOut)
def create_checkin(data: CheckinCreate, db: Session = Depends(get_db)):
    today = datetime.now().strftime("%Y-%m-%d")
    existing = db.query(CheckinRecord).filter(CheckinRecord.checkin_date == today).first()
    if existing:
        raise HTTPException(status_code=400, detail="今天已经打卡过了")
    record = CheckinRecord(checkin_date=today, note=data.note)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/checkin", response_model=list[CheckinOut])
def get_checkin_records(year: int = None, month: int = None, db: Session = Depends(get_db)):
    query = db.query(CheckinRecord)
    if year and month:
        prefix = f"{year}-{month:02d}"
        query = query.filter(CheckinRecord.checkin_date.startswith(prefix))
    elif year:
        query = query.filter(CheckinRecord.checkin_date.startswith(str(year)))
    records = query.order_by(CheckinRecord.checkin_date.desc()).all()
    return records


@router.get("/checkin/stats", response_model=CheckinStatsOut)
def get_checkin_stats(db: Session = Depends(get_db)):
    total_days = db.query(func.count(CheckinRecord.id)).scalar() or 0

    streak_days = 0
    today = datetime.now().date()
    for i in range(365):
        check_date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        exists = db.query(CheckinRecord).filter(CheckinRecord.checkin_date == check_date).first()
        if exists:
            streak_days += 1
        else:
            if i == 0:
                continue
            break

    now = datetime.now()
    days_in_month = (now.replace(month=now.month % 12 + 1, day=1) - timedelta(days=1)).day if now.month < 12 else 31
    month_prefix = now.strftime("%Y-%m")
    month_days = db.query(func.count(CheckinRecord.id)).filter(
        CheckinRecord.checkin_date.startswith(month_prefix)
    ).scalar() or 0
    month_rate = round(month_days / days_in_month * 100, 1)

    return CheckinStatsOut(total_days=total_days, streak_days=streak_days, month_rate=month_rate)
