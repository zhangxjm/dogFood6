from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CategoryOut(BaseModel):
    id: int
    name: str
    type: str
    material_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class MaterialCreate(BaseModel):
    title: str
    category_id: int
    description: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = 0


class MaterialOut(BaseModel):
    id: int
    title: str
    category_id: int
    description: Optional[str] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    file_size: int = 0
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MaterialListOut(BaseModel):
    total: int
    items: list[MaterialOut]
    page: int
    page_size: int


class CheckinCreate(BaseModel):
    note: Optional[str] = None


class CheckinOut(BaseModel):
    id: int
    checkin_date: str
    note: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CheckinStatsOut(BaseModel):
    total_days: int
    streak_days: int
    month_rate: float


class SubjectOut(BaseModel):
    id: int
    name: str
    progress: int
    total_hours: float

    model_config = ConfigDict(from_attributes=True)


class SubjectProgressUpdate(BaseModel):
    progress: int


class StudyRecordCreate(BaseModel):
    subject_id: int
    duration: int
    note: Optional[str] = None


class StudyRecordOut(BaseModel):
    id: int
    subject_id: int
    subject_name: Optional[str] = None
    duration: int
    note: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class StudyStatOut(BaseModel):
    date: str
    hours: float


class DashboardOut(BaseModel):
    total_materials: int
    total_subjects: int
    streak_days: int
    total_hours: float
    today_checked_in: bool
    recent_materials: list[MaterialOut]
    subjects_progress: list[SubjectOut]
