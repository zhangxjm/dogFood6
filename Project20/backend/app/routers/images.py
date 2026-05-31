from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import shutil
from datetime import datetime

from ..database import get_db
from ..models import SatelliteImage as SatelliteImageModel
from ..schemas import SatelliteImage, SatelliteImageCreate
from ..config import settings
from ..image_processor import image_processor
from ..elasticsearch_client import es_client

router = APIRouter(prefix="/images", tags=["images"])

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.THUMBNAIL_DIR, exist_ok=True)


@router.get("/", response_model=List[SatelliteImage])
def get_images(
    skip: int = 0,
    limit: int = 100,
    satellite_source: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SatelliteImageModel)
    
    if satellite_source:
        query = query.filter(SatelliteImageModel.satellite_source == satellite_source)
    if location:
        query = query.filter(SatelliteImageModel.location.contains(location))
    
    return query.order_by(SatelliteImageModel.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{image_id}", response_model=SatelliteImage)
def get_image(image_id: int, db: Session = Depends(get_db)):
    image = db.query(SatelliteImageModel).filter(SatelliteImageModel.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return image


@router.get("/file/{image_id}")
def get_image_file(image_id: int, db: Session = Depends(get_db)):
    image = db.query(SatelliteImageModel).filter(SatelliteImageModel.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    if not os.path.exists(image.file_path):
        raise HTTPException(status_code=404, detail="Image file not found")
    
    return FileResponse(image.file_path)


@router.get("/thumbnail/{image_id}")
def get_thumbnail(image_id: int, db: Session = Depends(get_db)):
    image = db.query(SatelliteImageModel).filter(SatelliteImageModel.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    if not os.path.exists(image.thumbnail_path):
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    
    return FileResponse(image.thumbnail_path)


@router.post("/upload", response_model=SatelliteImage)
async def upload_image(
    file: UploadFile = File(...),
    satellite_source: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    thumbnail_filename = f"thumb_{unique_filename}"
    thumbnail_path = os.path.join(settings.THUMBNAIL_DIR, thumbnail_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    image_processor.create_thumbnail(file_path, thumbnail_path)
    
    width, height = image_processor.get_image_dimensions(file_path)
    file_size = os.path.getsize(file_path)
    
    db_image = SatelliteImageModel(
        filename=unique_filename,
        original_name=file.filename,
        file_path=file_path,
        thumbnail_path=thumbnail_path,
        file_size=file_size,
        width=width,
        height=height,
        satellite_source=satellite_source,
        location=location,
        latitude=latitude,
        longitude=longitude,
        description=description,
        tags=tags,
        es_indexed=False
    )
    
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    
    image_data = {
        "id": db_image.id,
        "original_name": db_image.original_name,
        "satellite_source": db_image.satellite_source,
        "location": db_image.location,
        "latitude": db_image.latitude,
        "longitude": db_image.longitude,
        "description": db_image.description,
        "tags": db_image.tags,
        "created_at": db_image.created_at.isoformat() if db_image.created_at else None
    }
    
    if es_client.index_image(image_data):
        db_image.es_indexed = True
        db.commit()
        db.refresh(db_image)
    
    return db_image


@router.delete("/{image_id}")
def delete_image(image_id: int, db: Session = Depends(get_db)):
    image = db.query(SatelliteImageModel).filter(SatelliteImageModel.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    if os.path.exists(image.file_path):
        os.remove(image.file_path)
    if os.path.exists(image.thumbnail_path):
        os.remove(image.thumbnail_path)
    
    es_client.delete_image(image_id)
    
    db.delete(image)
    db.commit()
    
    return {"message": "Image deleted successfully"}


@router.post("/search", response_model=List[SatelliteImage])
def search_images(
    query: str,
    satellite_source: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    filters = {}
    if satellite_source:
        filters["satellite_source"] = satellite_source
    if location:
        filters["location"] = location
    
    image_ids = es_client.search_images(query, filters)
    
    if image_ids:
        images = db.query(SatelliteImageModel).filter(
            SatelliteImageModel.id.in_(image_ids)
        ).all()
        image_map = {img.id: img for img in images}
        return [image_map[id] for id in image_ids if id in image_map]
    else:
        return db.query(SatelliteImageModel).filter(
            SatelliteImageModel.original_name.contains(query) |
            SatelliteImageModel.location.contains(query) |
            SatelliteImageModel.description.contains(query) |
            SatelliteImageModel.tags.contains(query)
        ).all()


@router.post("/reindex/{image_id}")
def reindex_image(image_id: int, db: Session = Depends(get_db)):
    image = db.query(SatelliteImageModel).filter(SatelliteImageModel.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    image_data = {
        "id": image.id,
        "original_name": image.original_name,
        "satellite_source": image.satellite_source,
        "location": image.location,
        "latitude": image.latitude,
        "longitude": image.longitude,
        "description": image.description,
        "tags": image.tags,
        "created_at": image.created_at.isoformat() if image.created_at else None
    }
    
    success = es_client.index_image(image_data)
    if success:
        image.es_indexed = True
        db.commit()
        return {"message": "Image reindexed successfully"}
    else:
        return {"message": "Failed to reindex image", "success": False}
