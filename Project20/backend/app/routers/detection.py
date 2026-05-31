from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json
import os
import uuid

from ..database import get_db
from ..models import SatelliteImage, DetectionResult as DetectionResultModel, ChangeDetection as ChangeDetectionModel
from ..schemas import DetectionResult, DetectionRequest, ChangeDetectionRequest, ChangeDetection
from ..config import settings
from ..image_processor import image_processor

router = APIRouter(prefix="/detection", tags=["detection"])

CHANGE_MASK_DIR = "./change_masks"
os.makedirs(CHANGE_MASK_DIR, exist_ok=True)


@router.post("/objects", response_model=List[DetectionResult])
def detect_objects(request: DetectionRequest, db: Session = Depends(get_db)):
    image = db.query(SatelliteImage).filter(SatelliteImage.id == request.image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    if not os.path.exists(image.file_path):
        raise HTTPException(status_code=404, detail="Image file not found")
    
    img = image_processor.read_image(image.file_path)
    objects = image_processor.detect_objects(img)
    
    results = []
    for obj in objects:
        db_result = DetectionResultModel(
            image_id=image.id,
            detection_type="opencv_contour",
            label=obj["label"],
            confidence=obj["confidence"],
            bbox_x=obj["bbox_x"],
            bbox_y=obj["bbox_y"],
            bbox_width=obj["bbox_width"],
            bbox_height=obj["bbox_height"]
        )
        db.add(db_result)
        db.commit()
        db.refresh(db_result)
        results.append(db_result)
    
    return results


@router.get("/results/{image_id}", response_model=List[DetectionResult])
def get_detection_results(image_id: int, db: Session = Depends(get_db)):
    return db.query(DetectionResultModel).filter(
        DetectionResultModel.image_id == image_id
    ).all()


@router.delete("/results/{result_id}")
def delete_detection_result(result_id: int, db: Session = Depends(get_db)):
    result = db.query(DetectionResultModel).filter(DetectionResultModel.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Detection result not found")
    db.delete(result)
    db.commit()
    return {"message": "Detection result deleted successfully"}


@router.post("/change-detection", response_model=ChangeDetection)
def detect_changes(request: ChangeDetectionRequest, db: Session = Depends(get_db)):
    image1 = db.query(SatelliteImage).filter(SatelliteImage.id == request.image1_id).first()
    image2 = db.query(SatelliteImage).filter(SatelliteImage.id == request.image2_id).first()
    
    if not image1 or not image2:
        raise HTTPException(status_code=404, detail="One or both images not found")
    
    if not os.path.exists(image1.file_path) or not os.path.exists(image2.file_path):
        raise HTTPException(status_code=404, detail="One or both image files not found")
    
    mask_filename = f"change_{uuid.uuid4()}.png"
    mask_path = os.path.join(CHANGE_MASK_DIR, mask_filename)
    
    change_result = image_processor.detect_changes(
        image1.file_path,
        image2.file_path,
        mask_path
    )
    
    db_change = ChangeDetectionModel(
        image1_id=request.image1_id,
        image2_id=request.image2_id,
        change_mask_path=mask_path,
        change_percentage=change_result["change_percentage"],
        change_areas=json.dumps(change_result["change_areas"])
    )
    
    db.add(db_change)
    db.commit()
    db.refresh(db_change)
    
    return db_change


@router.get("/change-detection/{cd_id}", response_model=ChangeDetection)
def get_change_detection(cd_id: int, db: Session = Depends(get_db)):
    change_detection = db.query(ChangeDetectionModel).filter(ChangeDetectionModel.id == cd_id).first()
    if not change_detection:
        raise HTTPException(status_code=404, detail="Change detection not found")
    return change_detection


@router.get("/change-detection/mask/{cd_id}")
def get_change_mask(cd_id: int, db: Session = Depends(get_db)):
    from fastapi.responses import FileResponse
    
    change_detection = db.query(ChangeDetectionModel).filter(ChangeDetectionModel.id == cd_id).first()
    if not change_detection:
        raise HTTPException(status_code=404, detail="Change detection not found")
    
    if not os.path.exists(change_detection.change_mask_path):
        raise HTTPException(status_code=404, detail="Change mask not found")
    
    return FileResponse(change_detection.change_mask_path)


@router.get("/change-detection", response_model=List[ChangeDetection])
def get_change_detections(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(ChangeDetectionModel).order_by(
        ChangeDetectionModel.created_at.desc()
    ).offset(skip).limit(limit).all()


@router.post("/enhance/{image_id}")
def enhance_image(image_id: int, db: Session = Depends(get_db)):
    from fastapi.responses import FileResponse
    import tempfile
    
    image = db.query(SatelliteImage).filter(SatelliteImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    if not os.path.exists(image.file_path):
        raise HTTPException(status_code=404, detail="Image file not found")
    
    img = image_processor.read_image(image.file_path)
    enhanced = image_processor.enhance_image(img)
    
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
    image_processor.save_image(enhanced, temp_file.name)
    
    return FileResponse(temp_file.name)
