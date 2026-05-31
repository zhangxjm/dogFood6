from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    sort_order: Optional[int] = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int
    created_at: datetime
    template_count: Optional[int] = 0

    class Config:
        from_attributes = True


class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: int
    file_path: str
    preview_image: Optional[str] = None
    is_active: Optional[bool] = True


class TemplateCreate(TemplateBase):
    pass


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    file_path: Optional[str] = None
    preview_image: Optional[str] = None
    is_active: Optional[bool] = None


class Template(TemplateBase):
    id: int
    download_count: int
    created_at: datetime
    updated_at: datetime
    category: Optional[Category] = None
    notes_count: Optional[int] = 0

    class Config:
        from_attributes = True


class NoteBase(BaseModel):
    template_id: int
    title: str
    content: str


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class Note(NoteBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
