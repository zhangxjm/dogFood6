from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    avatar: Optional[str] = None
    role: Optional[str] = "user"
    bio: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class CraftCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None


class CraftCategoryCreate(CraftCategoryBase):
    pass


class CraftCategoryResponse(CraftCategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CraftStepBase(BaseModel):
    step_number: int
    title: str
    description: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    tips: Optional[str] = None
    duration_seconds: Optional[int] = 300


class CraftStepCreate(CraftStepBase):
    pass


class CraftStepResponse(CraftStepBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CraftBase(BaseModel):
    title: str
    description: str
    cover_image: Optional[str] = None
    category_id: Optional[int] = None
    difficulty_level: Optional[str] = "beginner"
    estimated_time: Optional[int] = None
    materials: Optional[str] = None
    tools: Optional[str] = None


class CraftCreate(CraftBase):
    steps: Optional[List[CraftStepCreate]] = None


class CraftUpdate(CraftBase):
    pass


class CraftResponse(CraftBase):
    id: int
    category: Optional[CraftCategoryResponse] = None
    steps: List[CraftStepResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LiveRoomBase(BaseModel):
    title: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    craft_id: Optional[int] = None
    is_low_latency: Optional[bool] = True


class LiveRoomCreate(LiveRoomBase):
    pass


class LiveRoomResponse(LiveRoomBase):
    id: int
    host_id: int
    host: Optional[UserResponse] = None
    craft: Optional[CraftResponse] = None
    stream_key: Optional[str] = None
    stream_url: Optional[str] = None
    hls_url: Optional[str] = None
    webrtc_url: Optional[str] = None
    is_live: bool
    viewer_count: int
    like_count: int
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LiveChatBase(BaseModel):
    message: str
    message_type: Optional[str] = "chat"


class LiveChatCreate(LiveChatBase):
    username: Optional[str] = None


class LiveChatResponse(LiveChatBase):
    id: int
    live_room_id: int
    user_id: Optional[int] = None
    username: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class TraceRecordBase(BaseModel):
    step_number: Optional[int] = None
    action: str
    description: Optional[str] = None
    operator: Optional[str] = None
    location: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None


class TraceRecordCreate(TraceRecordBase):
    pass


class TraceRecordResponse(TraceRecordBase):
    id: int
    work_id: int
    timestamp: datetime

    class Config:
        from_attributes = True


class WorkBase(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    craft_id: Optional[int] = None
    material_sources: Optional[str] = None
    creation_process: Optional[str] = None


class WorkCreate(WorkBase):
    trace_records: Optional[List[TraceRecordCreate]] = None


class WorkResponse(WorkBase):
    id: int
    creator_id: int
    creator: Optional[UserResponse] = None
    craft: Optional[CraftResponse] = None
    traceability_code: str
    quality_verified: bool
    trace_records: List[TraceRecordResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class CommentBase(BaseModel):
    content: str
    rating: Optional[int] = 5


class CommentCreate(CommentBase):
    work_id: int


class CommentResponse(CommentBase):
    id: int
    work_id: int
    user_id: int
    user: Optional[UserResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SearchResult(BaseModel):
    id: int
    type: str
    title: str
    description: str
    score: float
    image_url: Optional[str] = None


class SearchResponse(BaseModel):
    total: int
    results: List[SearchResult]
    query: str


class LiveStreamStats(BaseModel):
    viewer_count: int
    like_count: int
    duration_seconds: int
    bitrate: float
    latency_ms: int
    resolution: str
