from __future__ import annotations

import os
import shutil
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Category, Material
from schemas import CategoryOut, MaterialOut, MaterialListOut

router = APIRouter(prefix="/api")

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    result = []
    for cat in categories:
        count = db.query(func.count(Material.id)).filter(Material.category_id == cat.id).scalar() or 0
        result.append(CategoryOut(id=cat.id, name=cat.name, type=cat.type, material_count=count))
    return result


@router.get("/materials", response_model=MaterialListOut)
def list_materials(
    page: int = 1,
    page_size: int = 10,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Material)
    if category_id:
        query = query.filter(Material.category_id == category_id)
    if search:
        query = query.filter(Material.title.contains(search))
    total = query.count()
    items = query.order_by(Material.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return MaterialListOut(total=total, items=items, page=page, page_size=page_size)


@router.post("/materials", response_model=MaterialOut)
def upload_material(
    title: str = Form(...),
    category_id: int = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="分类不存在")

    file_path = None
    file_type = None
    file_size = 0

    if file and file.filename:
        file_type = os.path.splitext(file.filename)[1]
        safe_name = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
        save_path = os.path.join(UPLOAD_DIR, safe_name)
        with open(save_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        file_path = save_path
        file_size = os.path.getsize(save_path)

    material = Material(
        title=title,
        category_id=category_id,
        description=description,
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@router.get("/materials/{material_id}/download")
def download_material(material_id: int, db: Session = Depends(get_db)):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material or not material.file_path:
        raise HTTPException(status_code=404, detail="文件不存在")
    if not os.path.exists(material.file_path):
        raise HTTPException(status_code=404, detail="文件已被删除")
    filename = os.path.basename(material.file_path)
    return FileResponse(path=material.file_path, filename=filename)


@router.delete("/materials/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db)):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="资料不存在")
    if material.file_path and os.path.exists(material.file_path):
        os.remove(material.file_path)
    db.delete(material)
    db.commit()
    return {"message": "删除成功"}

