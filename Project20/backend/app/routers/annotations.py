from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Annotation as AnnotationModel
from ..schemas import Annotation, AnnotationCreate

router = APIRouter(prefix="/annotations", tags=["annotations"])


@router.get("/", response_model=List[Annotation])
def get_annotations(
    image_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(AnnotationModel)
    if image_id:
        query = query.filter(AnnotationModel.image_id == image_id)
    return query.offset(skip).limit(limit).all()


@router.get("/{annotation_id}", response_model=Annotation)
def get_annotation(annotation_id: int, db: Session = Depends(get_db)):
    annotation = db.query(AnnotationModel).filter(AnnotationModel.id == annotation_id).first()
    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")
    return annotation


@router.post("/", response_model=Annotation)
def create_annotation(annotation: AnnotationCreate, db: Session = Depends(get_db)):
    db_annotation = AnnotationModel(**annotation.model_dump())
    db.add(db_annotation)
    db.commit()
    db.refresh(db_annotation)
    return db_annotation


@router.put("/{annotation_id}", response_model=Annotation)
def update_annotation(
    annotation_id: int,
    annotation: AnnotationCreate,
    db: Session = Depends(get_db)
):
    db_annotation = db.query(AnnotationModel).filter(AnnotationModel.id == annotation_id).first()
    if not db_annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")
    
    for key, value in annotation.model_dump().items():
        setattr(db_annotation, key, value)
    
    db.commit()
    db.refresh(db_annotation)
    return db_annotation


@router.delete("/{annotation_id}")
def delete_annotation(annotation_id: int, db: Session = Depends(get_db)):
    annotation = db.query(AnnotationModel).filter(AnnotationModel.id == annotation_id).first()
    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")
    
    db.delete(annotation)
    db.commit()
    return {"message": "Annotation deleted successfully"}
