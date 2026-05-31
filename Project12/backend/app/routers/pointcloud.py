from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import PointCloudTask, HeritageModel
from app.models.schemas import PointCloudTaskCreate, PointCloudTaskResponse
from datetime import datetime
import random
import time

router = APIRouter(prefix="/pointcloud", tags=["点云处理"])


@router.get("/", response_model=List[PointCloudTaskResponse])
def list_pointcloud_tasks(
    heritage_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(PointCloudTask)
    if heritage_id:
        query = query.filter(PointCloudTask.heritage_id == heritage_id)
    if status:
        query = query.filter(PointCloudTask.status == status)
    
    return query.order_by(PointCloudTask.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{task_id}", response_model=PointCloudTaskResponse)
def get_pointcloud_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(PointCloudTask).filter(PointCloudTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task


@router.post("/", response_model=PointCloudTaskResponse)
def create_pointcloud_task(task: PointCloudTaskCreate, db: Session = Depends(get_db)):
    heritage = db.query(HeritageModel).filter(HeritageModel.id == task.heritage_id).first()
    if not heritage:
        raise HTTPException(status_code=404, detail="关联文物不存在")
    
    db_task = PointCloudTask(
        heritage_id=task.heritage_id,
        task_name=task.task_name,
        algorithm=task.algorithm or "泊松表面重建",
        parameters=task.parameters,
        status="pending",
        progress=0.0
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.post("/{task_id}/start")
def start_pointcloud_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(PointCloudTask).filter(PointCloudTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    if task.status not in ["pending", "failed"]:
        raise HTTPException(status_code=400, detail="任务已在处理或已完成")
    
    task.status = "processing"
    task.started_at = datetime.now()
    task.progress = 0.0
    db.commit()
    
    return {"message": "任务已启动", "task_id": task_id}


@router.post("/{task_id}/simulate-progress")
def simulate_pointcloud_progress(task_id: int, db: Session = Depends(get_db)):
    task = db.query(PointCloudTask).filter(PointCloudTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    if task.status != "processing":
        raise HTTPException(status_code=400, detail="任务未在处理中")
    
    increment = random.uniform(5.0, 15.0)
    task.progress = min(task.progress + increment, 99.0)
    
    if task.progress >= 99.0:
        task.progress = 100.0
        task.status = "completed"
        task.completed_at = datetime.now()
        if not task.point_count:
            task.point_count = random.randint(1000000, 10000000)
    
    db.commit()
    
    return {
        "task_id": task_id,
        "progress": task.progress,
        "status": task.status
    }


@router.post("/{task_id}/complete")
def complete_pointcloud_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(PointCloudTask).filter(PointCloudTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task.progress = 100.0
    task.status = "completed"
    task.completed_at = datetime.now()
    if not task.point_count:
        task.point_count = random.randint(1000000, 10000000)
    
    db.commit()
    
    return {"message": "任务已完成", "task_id": task_id}


@router.delete("/{task_id}")
def delete_pointcloud_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(PointCloudTask).filter(PointCloudTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    db.delete(task)
    db.commit()
    return {"message": "删除成功"}


@router.post("/process-sample")
def process_sample_data(db: Session = Depends(get_db)):
    tasks = db.query(PointCloudTask).filter(PointCloudTask.status == "pending").all()
    
    results = []
    for task in tasks:
        task.status = "completed"
        task.progress = 100.0
        task.started_at = datetime.now()
        task.completed_at = datetime.now()
        if not task.point_count:
            task.point_count = random.randint(500000, 5000000)
        results.append({"task_id": task.id, "status": "completed"})
    
    db.commit()
    
    return {"message": "批量处理完成", "processed_count": len(results), "results": results}
