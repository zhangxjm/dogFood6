from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import User, Work
from ..schemas import (
    WorkCreate, WorkResponse,
    TraceRecordCreate, TraceRecordResponse
)
from ..services.auth import get_current_user
from ..services.traceability import traceability_service
from ..services.search import search_service

router = APIRouter(prefix="/works", tags=["作品溯源"])


@router.get("", response_model=List[WorkResponse], summary="获取作品列表")
def get_works(
    craft_id: Optional[int] = None,
    creator_id: Optional[int] = None,
    quality_verified: Optional[bool] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query = db.query(Work)
    if craft_id:
        query = query.filter(Work.craft_id == craft_id)
    if creator_id:
        query = query.filter(Work.creator_id == creator_id)
    if quality_verified is not None:
        query = query.filter(Work.quality_verified == quality_verified)
    return query.order_by(Work.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=WorkResponse, summary="创建作品")
def create_work(
    work_data: WorkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    work = traceability_service.create_work_with_trace(
        db=db,
        work_data=work_data,
        creator_id=current_user.id
    )

    search_service.index_work(work)

    return work


@router.get("/{work_id}", response_model=WorkResponse, summary="获取作品详情")
def get_work(work_id: int, db: Session = Depends(get_db)):
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="作品不存在"
        )
    return work


@router.get("/trace/{traceability_code}", summary="通过溯源码查询作品溯源")
def get_work_by_traceability_code(traceability_code: str, db: Session = Depends(get_db)):
    result = traceability_service.get_trace_history(db, traceability_code)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="溯源码无效，未找到对应作品"
        )

    return {
        "work": {
            "id": result["work"].id,
            "title": result["work"].title,
            "description": result["work"].description,
            "image_url": result["work"].image_url,
            "creator": {
                "id": result["work"].creator.id,
                "username": result["work"].creator.username,
                "full_name": result["work"].creator.full_name,
                "avatar": result["work"].creator.avatar
            } if result["work"].creator else None,
            "craft": {
                "id": result["work"].craft.id,
                "title": result["work"].craft.title
            } if result["work"].craft else None,
            "traceability_code": result["work"].traceability_code,
            "quality_verified": result["work"].quality_verified,
            "material_sources": result["work"].material_sources,
            "creation_process": result["work"].creation_process,
            "created_at": result["work"].created_at
        },
        "trace_records": [
            {
                "id": record.id,
                "step_number": record.step_number,
                "action": record.action,
                "description": record.description,
                "operator": record.operator,
                "location": record.location,
                "temperature": record.temperature,
                "humidity": record.humidity,
                "timestamp": record.timestamp
            }
            for record in result["trace_records"]
        ],
        "integrity": {
            "is_verified": result["is_verified"],
            "record_count": result["record_count"],
            "integrity_score": result["integrity_score"],
            "status": "优秀" if result["integrity_score"] >= 90 else "良好" if result["integrity_score"] >= 70 else "需完善"
        }
    }


@router.post("/{work_id}/trace", response_model=TraceRecordResponse, summary="添加溯源记录")
def add_trace_record(
    work_id: int,
    record_data: TraceRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="作品不存在"
        )

    if work.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有作者或管理员可以添加溯源记录"
        )

    record = traceability_service.add_trace_record(db, work_id, record_data)
    return record


@router.post("/{work_id}/verify", summary="认证作品品质")
def verify_work(
    work_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有管理员可以认证作品品质"
        )

    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="作品不存在"
        )

    success = traceability_service.verify_work(db, work_id)

    return {
        "success": success,
        "message": "作品品质认证成功" if success else "认证失败",
        "traceability_code": work.traceability_code
    }


@router.get("/{work_id}/integrity", summary="检查作品溯源完整性")
def check_integrity(work_id: int, db: Session = Depends(get_db)):
    result = traceability_service.verify_integrity(db, work_id)
    return result


@router.get("/{work_id}/trace-records", response_model=List[TraceRecordResponse], summary="获取作品溯源记录")
def get_trace_records(work_id: int, db: Session = Depends(get_db)):
    from ..models import TraceRecord
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="作品不存在"
        )

    records = db.query(TraceRecord).filter(
        TraceRecord.work_id == work_id
    ).order_by(TraceRecord.step_number).all()
    return records
