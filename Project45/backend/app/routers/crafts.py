from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import User, Craft, CraftCategory
from ..schemas import (
    CraftCategoryCreate, CraftCategoryResponse,
    CraftCreate, CraftUpdate, CraftResponse
)
from ..services.auth import get_current_user
from ..services.search import search_service

router = APIRouter(prefix="/crafts", tags=["技艺"])


@router.get("/categories", response_model=List[CraftCategoryResponse], summary="获取技艺分类列表")
def get_categories(db: Session = Depends(get_db)):
    return db.query(CraftCategory).all()


@router.post("/categories", response_model=CraftCategoryResponse, summary="创建技艺分类")
def create_category(
    category_data: CraftCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有管理员可以创建分类"
        )

    category = CraftCategory(**category_data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("", response_model=List[CraftResponse], summary="获取技艺列表")
def get_crafts(
    category_id: Optional[int] = None,
    difficulty_level: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query = db.query(Craft)
    if category_id:
        query = query.filter(Craft.category_id == category_id)
    if difficulty_level:
        query = query.filter(Craft.difficulty_level == difficulty_level)
    return query.order_by(Craft.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=CraftResponse, summary="创建技艺")
def create_craft(
    craft_data: CraftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "instructor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有管理员和讲师可以创建技艺"
        )

    steps_data = craft_data.steps or []
    craft = Craft(**craft_data.model_dump(exclude={"steps"}))
    db.add(craft)
    db.flush()

    from ..models import CraftStep
    for step_data in steps_data:
        step = CraftStep(craft_id=craft.id, **step_data.model_dump())
        db.add(step)

    db.commit()
    db.refresh(craft)

    search_service.index_craft(craft)

    return craft


@router.get("/{craft_id}", response_model=CraftResponse, summary="获取技艺详情")
def get_craft(craft_id: int, db: Session = Depends(get_db)):
    craft = db.query(Craft).filter(Craft.id == craft_id).first()
    if not craft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技艺不存在"
        )
    return craft


@router.put("/{craft_id}", response_model=CraftResponse, summary="更新技艺")
def update_craft(
    craft_id: int,
    craft_data: CraftUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "instructor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有管理员和讲师可以更新技艺"
        )

    craft = db.query(Craft).filter(Craft.id == craft_id).first()
    if not craft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技艺不存在"
        )

    for key, value in craft_data.model_dump(exclude_unset=True).items():
        setattr(craft, key, value)

    db.commit()
    db.refresh(craft)
    search_service.index_craft(craft)

    return craft


@router.get("/{craft_id}/steps", summary="获取技艺步骤拆解")
def get_craft_steps(craft_id: int, db: Session = Depends(get_db)):
    craft = db.query(Craft).filter(Craft.id == craft_id).first()
    if not craft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技艺不存在"
        )

    steps = sorted(craft.steps, key=lambda s: s.step_number)
    return {
        "craft_id": craft.id,
        "craft_title": craft.title,
        "total_steps": len(steps),
        "total_duration": sum(s.duration_seconds or 0 for s in steps),
        "steps": steps
    }
