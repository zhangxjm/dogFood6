from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import HeritageModel
from app.models.schemas import HeritageCreate, HeritageUpdate, HeritageResponse, FileUploadResponse
from app.services.minio_service import minio_service
from app.config import settings
import uuid

router = APIRouter(prefix="/heritage", tags=["文物管理"])


@router.get("/", response_model=List[HeritageResponse])
def list_heritage(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    dynasty: Optional[str] = None,
    is_restored: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(HeritageModel)
    if category:
        query = query.filter(HeritageModel.category == category)
    if dynasty:
        query = query.filter(HeritageModel.dynasty == dynasty)
    if is_restored is not None:
        query = query.filter(HeritageModel.is_restored == is_restored)
    
    return query.offset(skip).limit(limit).all()


@router.get("/{heritage_id}", response_model=HeritageResponse)
def get_heritage(heritage_id: int, db: Session = Depends(get_db)):
    heritage = db.query(HeritageModel).filter(HeritageModel.id == heritage_id).first()
    if not heritage:
        raise HTTPException(status_code=404, detail="文物记录不存在")
    return heritage


@router.post("/", response_model=HeritageResponse)
def create_heritage(heritage: HeritageCreate, db: Session = Depends(get_db)):
    db_heritage = HeritageModel(**heritage.dict())
    db.add(db_heritage)
    db.commit()
    db.refresh(db_heritage)
    return db_heritage


@router.put("/{heritage_id}", response_model=HeritageResponse)
def update_heritage(heritage_id: int, heritage: HeritageUpdate, db: Session = Depends(get_db)):
    db_heritage = db.query(HeritageModel).filter(HeritageModel.id == heritage_id).first()
    if not db_heritage:
        raise HTTPException(status_code=404, detail="文物记录不存在")
    
    for key, value in heritage.dict(exclude_unset=True).items():
        setattr(db_heritage, key, value)
    
    db.commit()
    db.refresh(db_heritage)
    return db_heritage


@router.delete("/{heritage_id}")
def delete_heritage(heritage_id: int, db: Session = Depends(get_db)):
    db_heritage = db.query(HeritageModel).filter(HeritageModel.id == heritage_id).first()
    if not db_heritage:
        raise HTTPException(status_code=404, detail="文物记录不存在")
    
    if db_heritage.model_url:
        minio_service.delete_file(settings.MINIO_BUCKET_3D, db_heritage.model_url.split("/")[-1])
    
    db.delete(db_heritage)
    db.commit()
    return {"message": "删除成功"}


@router.post("/{heritage_id}/upload-model", response_model=FileUploadResponse)
async def upload_model(heritage_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    heritage = db.query(HeritageModel).filter(HeritageModel.id == heritage_id).first()
    if not heritage:
        raise HTTPException(status_code=404, detail="文物记录不存在")
    
    if file.size and file.size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="文件大小超过限制")
    
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ["obj", "glb", "gltf", "fbx", "stl", "ply"]:
        raise HTTPException(status_code=400, detail="不支持的文件格式")
    
    unique_name = f"{heritage_id}_{uuid.uuid4().hex}.{file_ext}"
    content = await file.read()
    
    try:
        file_url = minio_service.upload_file(
            settings.MINIO_BUCKET_3D,
            unique_name,
            content,
            file.content_type or "application/octet-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")
    
    heritage.model_url = file_url
    heritage.model_format = file_ext.upper()
    heritage.model_size = len(content) / (1024 * 1024)
    db.commit()
    
    return FileUploadResponse(
        file_url=file_url,
        file_name=unique_name,
        file_size=len(content),
        bucket=settings.MINIO_BUCKET_3D
    )


@router.post("/{heritage_id}/upload-texture")
async def upload_texture(heritage_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    heritage = db.query(HeritageModel).filter(HeritageModel.id == heritage_id).first()
    if not heritage:
        raise HTTPException(status_code=404, detail="文物记录不存在")
    
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ["jpg", "jpeg", "png", "webp", "bmp"]:
        raise HTTPException(status_code=400, detail="不支持的纹理格式")
    
    unique_name = f"{heritage_id}_{uuid.uuid4().hex}.{file_ext}"
    content = await file.read()
    
    try:
        file_url = minio_service.upload_file(
            settings.MINIO_BUCKET_TEXTURE,
            unique_name,
            content,
            file.content_type or "image/*"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")
    
    heritage.texture_url = file_url
    db.commit()
    
    return {"file_url": file_url, "message": "纹理上传成功"}


@router.get("/{heritage_id}/model-url")
def get_model_url(heritage_id: int, db: Session = Depends(get_db)):
    heritage = db.query(HeritageModel).filter(HeritageModel.id == heritage_id).first()
    if not heritage or not heritage.model_url:
        raise HTTPException(status_code=404, detail="模型文件不存在")
    
    file_name = heritage.model_url.split("/")[-1]
    presigned_url = minio_service.get_file_url(settings.MINIO_BUCKET_3D, file_name)
    
    if not presigned_url:
        raise HTTPException(status_code=404, detail="获取模型链接失败")
    
    return {"model_url": presigned_url}


@router.get("/{heritage_id}/texture-url")
def get_texture_url(heritage_id: int, db: Session = Depends(get_db)):
    heritage = db.query(HeritageModel).filter(HeritageModel.id == heritage_id).first()
    if not heritage or not heritage.texture_url:
        raise HTTPException(status_code=404, detail="纹理文件不存在")
    
    file_name = heritage.texture_url.split("/")[-1]
    presigned_url = minio_service.get_file_url(settings.MINIO_BUCKET_TEXTURE, file_name)
    
    if not presigned_url:
        raise HTTPException(status_code=404, detail="获取纹理链接失败")
    
    return {"texture_url": presigned_url}
