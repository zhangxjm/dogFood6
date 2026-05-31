from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class HeritageBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    dynasty: Optional[str] = None
    location: Optional[str] = None
    model_format: Optional[str] = None


class HeritageCreate(HeritageBase):
    pass


class HeritageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    dynasty: Optional[str] = None
    location: Optional[str] = None


class HeritageResponse(HeritageBase):
    id: int
    model_url: Optional[str] = None
    texture_url: Optional[str] = None
    pointcloud_url: Optional[str] = None
    model_size: Optional[float] = None
    vertex_count: Optional[int] = None
    face_count: Optional[int] = None
    texture_resolution: Optional[str] = None
    is_restored: bool = False
    restoration_status: str = "pending"
    copyright_registered: bool = False
    copyright_hash: Optional[str] = None
    copyright_register_time: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PointCloudTaskCreate(BaseModel):
    heritage_id: int
    task_name: str
    algorithm: Optional[str] = None
    parameters: Optional[str] = None


class PointCloudTaskResponse(BaseModel):
    id: int
    heritage_id: int
    task_name: str
    status: str
    progress: float
    point_count: Optional[int] = None
    algorithm: Optional[str] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class TextureRestorationCreate(BaseModel):
    heritage_id: int
    restoration_type: str
    parameters: Optional[str] = None


class TextureRestorationResponse(BaseModel):
    id: int
    heritage_id: int
    original_texture: Optional[str] = None
    restored_texture: Optional[str] = None
    restoration_type: str
    status: str
    confidence: Optional[float] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class CopyrightCreate(BaseModel):
    heritage_id: int
    work_name: str
    author: str
    creation_date: Optional[str] = None
    work_metadata: Optional[str] = None


class CopyrightResponse(BaseModel):
    id: int
    heritage_id: int
    work_name: str
    author: str
    creation_date: Optional[str] = None
    register_hash: Optional[str] = None
    transaction_id: Optional[str] = None
    block_number: Optional[str] = None
    timestamp: Optional[datetime] = None
    certificate_url: Optional[str] = None
    status: str
    work_metadata: Optional[str] = None
    
    class Config:
        from_attributes = True


class FileUploadResponse(BaseModel):
    file_url: str
    file_name: str
    file_size: int
    bucket: str
