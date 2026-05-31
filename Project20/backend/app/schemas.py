from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SatelliteImageBase(BaseModel):
    original_name: str
    satellite_source: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    tags: Optional[str] = None


class SatelliteImageCreate(SatelliteImageBase):
    filename: str
    file_path: str
    thumbnail_path: str
    file_size: int
    width: int
    height: int


class SatelliteImage(SatelliteImageBase):
    id: int
    filename: str
    file_path: str
    thumbnail_path: str
    file_size: int
    width: int
    height: int
    es_indexed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AnnotationBase(BaseModel):
    image_id: int
    label: str
    bbox_x: float
    bbox_y: float
    bbox_width: float
    bbox_height: float
    annotation_type: str
    confidence: Optional[float] = 1.0
    annotated_by: Optional[str] = None


class AnnotationCreate(AnnotationBase):
    pass


class Annotation(AnnotationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class DetectionResultBase(BaseModel):
    image_id: int
    detection_type: str
    label: str
    confidence: float
    bbox_x: float
    bbox_y: float
    bbox_width: float
    bbox_height: float


class DetectionResultCreate(DetectionResultBase):
    mask_path: Optional[str] = None


class DetectionResult(DetectionResultBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChangeDetectionCreate(BaseModel):
    image1_id: int
    image2_id: int


class ChangeDetection(BaseModel):
    id: int
    image1_id: int
    image2_id: int
    change_mask_path: str
    change_percentage: float
    change_areas: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DetectionRequest(BaseModel):
    image_id: int
    model_name: Optional[str] = "default"


class ChangeDetectionRequest(BaseModel):
    image1_id: int
    image2_id: int


class SearchQuery(BaseModel):
    query: str
    filters: Optional[dict] = None
