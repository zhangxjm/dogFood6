from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Material, Subject, CheckinRecord, StudyRecord
from schemas import DashboardOut, MaterialOut, SubjectOut

router = APIRouter(prefix="/api")


@router.get("/dashboard", response_model=DashboardOut)
def get_dashboard(db: Session = Depends(get_db)):
    total_materials = db.query(func.count(Material.id)).scalar() or 0
    total_subjects = db.query(func.count(Subject.id)).scalar() or 0

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

    total_minutes = db.query(func.coalesce(func.sum(StudyRecord.duration), 0)).scalar()
    total_hours = round(total_minutes / 60.0, 1)

    today_str = today.strftime("%Y-%m-%d")
    today_checked_in = db.query(CheckinRecord).filter(CheckinRecord.checkin_date == today_str).first() is not None

    recent_materials = (
        db.query(Material).order_by(Material.created_at.desc()).limit(5).all()
    )
    subjects_progress = db.query(Subject).all()

    return DashboardOut(
        total_materials=total_materials,
        total_subjects=total_subjects,
        streak_days=streak_days,
        total_hours=total_hours,
        today_checked_in=today_checked_in,
        recent_materials=[MaterialOut.model_validate(m) for m in recent_materials],
        subjects_progress=[SubjectOut.model_validate(s) for s in subjects_progress],
    )
