from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class SatelliteImage(Base):
    __tablename__ = "satellite_images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), index=True)
    original_name = Column(String(255))
    file_path = Column(String(500))
    thumbnail_path = Column(String(500))
    file_size = Column(Integer)
    width = Column(Integer)
    height = Column(Integer)
    satellite_source = Column(String(100))
    capture_date = Column(DateTime)
    location = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    description = Column(Text)
    tags = Column(String(500))
    es_indexed = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    annotations = relationship("Annotation", back_populates="image")
    detection_results = relationship("DetectionResult", back_populates="image")


class Annotation(Base):
    __tablename__ = "annotations"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("satellite_images.id"))
    label = Column(String(100), index=True)
    bbox_x = Column(Float)
    bbox_y = Column(Float)
    bbox_width = Column(Float)
    bbox_height = Column(Float)
    annotation_type = Column(String(50))
    confidence = Column(Float, default=1.0)
    annotated_by = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())

    image = relationship("SatelliteImage", back_populates="annotations")


class DetectionResult(Base):
    __tablename__ = "detection_results"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("satellite_images.id"))
    detection_type = Column(String(100))
    label = Column(String(100))
    confidence = Column(Float)
    bbox_x = Column(Float)
    bbox_y = Column(Float)
    bbox_width = Column(Float)
    bbox_height = Column(Float)
    mask_path = Column(String(500))
    created_at = Column(DateTime, server_default=func.now())

    image = relationship("SatelliteImage", back_populates="detection_results")


class ChangeDetection(Base):
    __tablename__ = "change_detections"

    id = Column(Integer, primary_key=True, index=True)
    image1_id = Column(Integer, ForeignKey("satellite_images.id"))
    image2_id = Column(Integer, ForeignKey("satellite_images.id"))
    change_mask_path = Column(String(500))
    change_percentage = Column(Float)
    change_areas = Column(Text)
    created_at = Column(DateTime, server_default=func.now())


class ModelInfo(Base):
    __tablename__ = "model_info"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), unique=True)
    model_type = Column(String(50))
    version = Column(String(50))
    description = Column(Text)
    accuracy = Column(Float)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
