from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Subject, StudyRecord
from schemas import SubjectOut, SubjectProgressUpdate, StudyRecordCreate, StudyRecordOut, StudyStatOut

router = APIRouter(prefix="/api")


@router.get("/subjects", response_model=list[SubjectOut])
def list_subjects(db: Session = Depends(get_db)):
    return db.query(Subject).all()


@router.put("/subjects/{subject_id}/progress", response_model=SubjectOut)
def update_progress(subject_id: int, data: SubjectProgressUpdate, db: Session = Depends(get_db)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="科目不存在")
    if data.progress < 0 or data.progress > 100:
        raise HTTPException(status_code=400, detail="进度必须在0-100之间")
    subject.progress = data.progress
    db.commit()
    db.refresh(subject)
    return subject


@router.post("/study-records", response_model=StudyRecordOut)
def add_study_record(data: StudyRecordCreate, db: Session = Depends(get_db)):
    subject = db.query(Subject).filter(Subject.id == data.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="科目不存在")
    record = StudyRecord(
        subject_id=data.subject_id,
        duration=data.duration,
        note=data.note,
    )
    db.add(record)
    subject.total_hours = round(subject.total_hours + data.duration / 60.0, 1)
    db.commit()
    db.refresh(record)
    result = StudyRecordOut(
        id=record.id,
        subject_id=record.subject_id,
        subject_name=subject.name,
        duration=record.duration,
        note=record.note,
        created_at=record.created_at,
    )
    return result


@router.get("/study-records", response_model=list[StudyRecordOut])
def get_study_records(days: int = 7, db: Session = Depends(get_db)):
    since = datetime.now() - timedelta(days=days)
    records = (
        db.query(StudyRecord)
        .filter(StudyRecord.created_at >= since)
        .order_by(StudyRecord.created_at.desc())
        .all()
    )
    result = []
    for r in records:
        result.append(
            StudyRecordOut(
                id=r.id,
                subject_id=r.subject_id,
                subject_name=r.subject.name if r.subject else None,
                duration=r.duration,
                note=r.note,
                created_at=r.created_at,
            )
        )
    return result


@router.get("/study-stats", response_model=list[StudyStatOut])
def get_study_stats(days: int = 30, db: Session = Depends(get_db)):
    since = datetime.now() - timedelta(days=days)
    records = db.query(StudyRecord).filter(StudyRecord.created_at >= since).all()
    daily = {}
    for r in records:
        date_str = r.created_at.strftime("%Y-%m-%d")
        daily[date_str] = daily.get(date_str, 0) + r.duration
    stats = [
        StudyStatOut(date=d, hours=round(m / 60.0, 1))
        for d, m in sorted(daily.items())
    ]
    return stats
