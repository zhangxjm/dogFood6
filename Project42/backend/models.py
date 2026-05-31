from __future__ import annotations

from datetime import datetime

from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)

    materials: Mapped[list[Material]] = relationship(back_populates="category")


class Material(Base):
    __tablename__ = "materials"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("categories.id"), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    file_path: Mapped[str] = mapped_column(String(500), nullable=True)
    file_type: Mapped[str] = mapped_column(String(50), nullable=True)
    file_size: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    category: Mapped[Category] = relationship(back_populates="materials")


class CheckinRecord(Base):
    __tablename__ = "checkin_records"
    __table_args__ = (UniqueConstraint("checkin_date", name="uq_checkin_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    checkin_date: Mapped[str] = mapped_column(String(10), nullable=False)
    note: Mapped[str] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    total_hours: Mapped[float] = mapped_column(Float, default=0.0)

    study_records: Mapped[list[StudyRecord]] = relationship(back_populates="subject")


class StudyRecord(Base):
    __tablename__ = "study_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    subject_id: Mapped[int] = mapped_column(Integer, ForeignKey("subjects.id"), nullable=False)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)
    note: Mapped[str] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    subject: Mapped[Subject] = relationship(back_populates="study_records")
