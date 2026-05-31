from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import TextureRestoration, HeritageModel
from app.models.schemas import TextureRestorationCreate, TextureRestorationResponse
from datetime import datetime

router = APIRouter(prefix="/texture", tags=["纹理修复"])


@router.get("/", response_model=List[TextureRestorationResponse])
def list_restorations(
    heritage_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(TextureRestoration)
    if heritage_id:
        query = query.filter(TextureRestoration.heritage_id == heritage_id)
    if status:
        query = query.filter(TextureRestoration.status == status)
    
    return query.order_by(TextureRestoration.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{restoration_id}", response_model=TextureRestorationResponse)
def get_restoration(restoration_id: int, db: Session = Depends(get_db)):
    restoration = db.query(TextureRestoration).filter(TextureRestoration.id == restoration_id).first()
    if not restoration:
        raise HTTPException(status_code=404, detail="修复记录不存在")
    return restoration


@router.post("/", response_model=TextureRestorationResponse)
def create_restoration(restoration: TextureRestorationCreate, db: Session = Depends(get_db)):
    heritage = db.query(HeritageModel).filter(HeritageModel.id == restoration.heritage_id).first()
    if not heritage:
        raise HTTPException(status_code=404, detail="关联文物不存在")
    
    db_restoration = TextureRestoration(
        heritage_id=restoration.heritage_id,
        restoration_type=restoration.restoration_type,
        parameters=restoration.parameters,
        status="pending"
    )
    db.add(db_restoration)
    db.commit()
    db.refresh(db_restoration)
    return db_restoration


@router.post("/{restoration_id}/start")
def start_restoration(restoration_id: int, db: Session = Depends(get_db)):
    restoration = db.query(TextureRestoration).filter(TextureRestoration.id == restoration_id).first()
    if not restoration:
        raise HTTPException(status_code=404, detail="修复记录不存在")
    
    if restoration.status not in ["pending", "failed"]:
        raise HTTPException(status_code=400, detail="修复已在进行或已完成")
    
    restoration.status = "in_progress"
    db.commit()
    
    return {"message": "修复已启动", "restoration_id": restoration_id}


@router.post("/{restoration_id}/complete")
def complete_restoration(
    restoration_id: int,
    confidence: float = 0.9,
    db: Session = Depends(get_db)
):
    restoration = db.query(TextureRestoration).filter(TextureRestoration.id == restoration_id).first()
    if not restoration:
        raise HTTPException(status_code=404, detail="修复记录不存在")
    
    restoration.status = "completed"
    restoration.confidence = confidence
    restoration.completed_at = datetime.now()
    
    heritage = db.query(HeritageModel).filter(HeritageModel.id == restoration.heritage_id).first()
    if heritage:
        heritage.is_restored = True
        heritage.restoration_status = "completed"
    
    db.commit()
    
    return {"message": "修复已完成", "restoration_id": restoration_id, "confidence": confidence}


@router.post("/{restoration_id}/simulate")
def simulate_restoration(restoration_id: int, db: Session = Depends(get_db)):
    restoration = db.query(TextureRestoration).filter(TextureRestoration.id == restoration_id).first()
    if not restoration:
        raise HTTPException(status_code=404, detail="修复记录不存在")
    
    import random
    restoration.status = "completed"
    restoration.confidence = round(random.uniform(0.85, 0.99), 2)
    restoration.completed_at = datetime.now()
    
    heritage = db.query(HeritageModel).filter(HeritageModel.id == restoration.heritage_id).first()
    if heritage:
        heritage.is_restored = True
        heritage.restoration_status = "completed"
    
    db.commit()
    
    return {
        "message": "模拟修复完成",
        "restoration_id": restoration_id,
        "confidence": restoration.confidence
    }


@router.delete("/{restoration_id}")
def delete_restoration(restoration_id: int, db: Session = Depends(get_db)):
    restoration = db.query(TextureRestoration).filter(TextureRestoration.id == restoration_id).first()
    if not restoration:
        raise HTTPException(status_code=404, detail="修复记录不存在")
    
    db.delete(restoration)
    db.commit()
    return {"message": "删除成功"}
