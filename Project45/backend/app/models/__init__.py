from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    avatar = Column(String(255))
    role = Column(String(20), default="user")
    bio = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    live_rooms = relationship("LiveRoom", back_populates="host")
    works = relationship("Work", back_populates="creator")
    comments = relationship("Comment", back_populates="user")


class CraftCategory(Base):
    __tablename__ = "craft_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    icon = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    crafts = relationship("Craft", back_populates="category")


class Craft(Base):
    __tablename__ = "crafts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    cover_image = Column(String(255))
    category_id = Column(Integer, ForeignKey("craft_categories.id"))
    difficulty_level = Column(String(20), default="beginner")
    estimated_time = Column(Integer)
    materials = Column(Text)
    tools = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("CraftCategory", back_populates="crafts")
    steps = relationship("CraftStep", back_populates="craft", cascade="all, delete-orphan")
    live_rooms = relationship("LiveRoom", back_populates="craft")
    works = relationship("Work", back_populates="craft")


class CraftStep(Base):
    __tablename__ = "craft_steps"

    id = Column(Integer, primary_key=True, index=True)
    craft_id = Column(Integer, ForeignKey("crafts.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    image_url = Column(String(255))
    video_url = Column(String(255))
    tips = Column(Text)
    duration_seconds = Column(Integer, default=300)
    created_at = Column(DateTime, default=datetime.utcnow)

    craft = relationship("Craft", back_populates="steps")


class LiveRoom(Base):
    __tablename__ = "live_rooms"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    cover_image = Column(String(255))
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    craft_id = Column(Integer, ForeignKey("crafts.id"))
    stream_key = Column(String(100), unique=True)
    stream_url = Column(String(500))
    hls_url = Column(String(500))
    webrtc_url = Column(String(500))
    is_live = Column(Boolean, default=False)
    is_low_latency = Column(Boolean, default=True)
    viewer_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    started_at = Column(DateTime)
    ended_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    host = relationship("User", back_populates="live_rooms")
    craft = relationship("Craft", back_populates="live_rooms")
    chats = relationship("LiveChat", back_populates="live_room", cascade="all, delete-orphan")


class LiveChat(Base):
    __tablename__ = "live_chats"

    id = Column(Integer, primary_key=True, index=True)
    live_room_id = Column(Integer, ForeignKey("live_rooms.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    username = Column(String(50))
    message = Column(Text, nullable=False)
    message_type = Column(String(20), default="chat")
    timestamp = Column(DateTime, default=datetime.utcnow)

    live_room = relationship("LiveRoom", back_populates="chats")


class Work(Base):
    __tablename__ = "works"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    image_url = Column(String(255))
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    craft_id = Column(Integer, ForeignKey("crafts.id"))
    traceability_code = Column(String(100), unique=True)
    material_sources = Column(Text)
    creation_process = Column(Text)
    quality_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", back_populates="works")
    craft = relationship("Craft", back_populates="works")
    trace_records = relationship("TraceRecord", back_populates="work", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="work")


class TraceRecord(Base):
    __tablename__ = "trace_records"

    id = Column(Integer, primary_key=True, index=True)
    work_id = Column(Integer, ForeignKey("works.id"), nullable=False)
    step_number = Column(Integer)
    action = Column(String(200), nullable=False)
    description = Column(Text)
    operator = Column(String(100))
    location = Column(String(200))
    temperature = Column(Float)
    humidity = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

    work = relationship("Work", back_populates="trace_records")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    work_id = Column(Integer, ForeignKey("works.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)

    work = relationship("Work", back_populates="comments")
    user = relationship("User", back_populates="comments")


class SearchIndex(Base):
    __tablename__ = "search_indices"

    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String(50), nullable=False)
    content_id = Column(Integer, nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text)
    tags = Column(String(500))
    indexed_at = Column(DateTime, default=datetime.utcnow)
