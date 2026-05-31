from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from models import Category, Subject, CheckinRecord, StudyRecord


def seed_initial_data(db: Session) -> None:
    if db.query(Category).first():
        return

    exam_categories = [
        Category(name="马克思主义基本原理", type="考试科目"),
        Category(name="英语(二)", type="考试科目"),
        Category(name="高等数学", type="考试科目"),
        Category(name="中国近现代史纲要", type="考试科目"),
    ]
    db.add_all(exam_categories)

    material_categories = [
        Category(name="教材", type="资料类型"),
        Category(name="真题", type="资料类型"),
        Category(name="笔记", type="资料类型"),
        Category(name="视频", type="资料类型"),
    ]
    db.add_all(material_categories)
    db.flush()

    subjects = [
        Subject(name="马克思主义基本原理", progress=25, total_hours=12.0),
        Subject(name="英语(二)", progress=40, total_hours=20.0),
        Subject(name="高等数学", progress=15, total_hours=8.0),
        Subject(name="中国近现代史纲要", progress=60, total_hours=30.0),
    ]
    db.add_all(subjects)
    db.flush()

    today = datetime.now().date()
    checkin_records = []
    for i in range(1, 6):
        d = today - timedelta(days=i)
        checkin_records.append(
            CheckinRecord(
                checkin_date=d.strftime("%Y-%m-%d"),
                note=f"第{i}天打卡，坚持学习！",
            )
        )
    db.add_all(checkin_records)

    study_records = []
    study_data = [
        (subjects[0].id, 60, "学习了第一章"),
        (subjects[1].id, 90, "背单词和阅读理解"),
        (subjects[2].id, 45, "微积分基础"),
        (subjects[3].id, 120, "近代史重点章节"),
        (subjects[0].id, 30, "复习笔记"),
        (subjects[1].id, 60, "做真题练习"),
    ]
    for idx, (sid, dur, note) in enumerate(study_data):
        d = datetime.now() - timedelta(days=idx // 2, hours=idx * 3)
        study_records.append(
            StudyRecord(
                subject_id=sid,
                duration=dur,
                note=note,
                created_at=d,
            )
        )
    db.add_all(study_records)

    db.commit()
