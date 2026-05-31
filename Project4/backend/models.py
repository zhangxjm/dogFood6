from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import os

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root123456")
DB_NAME = os.getenv("DB_NAME", "error_notebook")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    questions = relationship("Question", back_populates="subject")


class KnowledgePoint(Base):
    __tablename__ = "knowledge_points"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    subject = relationship("Subject")
    questions = relationship("Question", back_populates="knowledge_point")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(200))
    created_at = Column(DateTime, default=datetime.now)

    questions = relationship("Question", back_populates="category")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    knowledge_point_id = Column(Integer, ForeignKey("knowledge_points.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    analysis = Column(Text)
    error_count = Column(Integer, default=1)
    last_practice_at = Column(DateTime, nullable=True)
    next_practice_at = Column(DateTime, nullable=True)
    mastery_level = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    subject = relationship("Subject", back_populates="questions")
    knowledge_point = relationship("KnowledgePoint", back_populates="questions")
    category = relationship("Category", back_populates="questions")
    practice_records = relationship("PracticeRecord", back_populates="question")


class PracticeRecord(Base):
    __tablename__ = "practice_records"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    is_correct = Column(Integer, nullable=False)
    user_answer = Column(Text)
    practiced_at = Column(DateTime, default=datetime.now)

    question = relationship("Question", back_populates="practice_records")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
