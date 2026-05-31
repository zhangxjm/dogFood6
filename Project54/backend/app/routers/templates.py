from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/templates", tags=["模板管理"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


@router.get("", response_model=List[dict])
def read_templates(category_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_templates(db, category_id=category_id, skip=skip, limit=limit)


@router.get("/{template_id}", response_model=dict)
def read_template(template_id: int, db: Session = Depends(get_db)):
    db_template = crud.get_template(db, template_id=template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="模板不存在")
    return db_template


@router.post("", response_model=schemas.Template)
def create_template(template: schemas.TemplateCreate, db: Session = Depends(get_db)):
    return crud.create_template(db=db, template=template)


@router.put("/{template_id}", response_model=schemas.Template)
def update_template(template_id: int, template: schemas.TemplateUpdate, db: Session = Depends(get_db)):
    db_template = crud.update_template(db, template_id=template_id, template=template)
    if db_template is None:
        raise HTTPException(status_code=404, detail="模板不存在")
    return db_template


@router.delete("/{template_id}")
def delete_template(template_id: int, db: Session = Depends(get_db)):
    success = crud.delete_template(db, template_id=template_id)
    if not success:
        raise HTTPException(status_code=404, detail="模板不存在")
    return {"message": "删除成功"}


@router.get("/{template_id}/download")
def download_template(template_id: int, db: Session = Depends(get_db)):
    db_template = crud.increment_download_count(db, template_id=template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    file_path = os.path.join(BASE_DIR, db_template.file_path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="模板文件不存在")
    
    return FileResponse(
        path=file_path,
        filename=os.path.basename(file_path),
        media_type="application/octet-stream"
    )


@router.get("/preview/{template_id}")
def preview_template(template_id: int, db: Session = Depends(get_db)):
    db_template = crud.get_template(db, template_id=template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    preview_image = db_template.get('preview_image') if isinstance(db_template, dict) else getattr(db_template, 'preview_image', None)
    if not preview_image:
        raise HTTPException(status_code=404, detail="预览图不存在")
    
    preview_path = os.path.join(BASE_DIR, preview_image)
    if not os.path.exists(preview_path):
        raise HTTPException(status_code=404, detail="预览图文件不存在")
    
    return FileResponse(path=preview_path, media_type="image/svg+xml")
