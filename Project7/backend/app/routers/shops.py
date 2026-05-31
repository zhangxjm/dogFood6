from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import crud, schemas

router = APIRouter(prefix="/api/shops", tags=["商铺管理"])


@router.get("/", response_model=List[schemas.Shop])
def read_shops(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    shops = crud.get_shops(db, skip=skip, limit=limit, is_active=is_active)
    return shops


@router.get("/{shop_id}", response_model=schemas.Shop)
def read_shop(shop_id: int, db: Session = Depends(get_db)):
    db_shop = crud.get_shop(db, shop_id=shop_id)
    if db_shop is None:
        raise HTTPException(status_code=404, detail="商铺不存在")
    return db_shop


@router.post("/", response_model=schemas.Shop)
def create_shop(shop: schemas.ShopCreate, db: Session = Depends(get_db)):
    db_shop = crud.get_shop_by_number(db, shop_number=shop.shop_number)
    if db_shop:
        raise HTTPException(status_code=400, detail="商铺编号已存在")
    return crud.create_shop(db=db, shop=shop)


@router.put("/{shop_id}", response_model=schemas.Shop)
def update_shop(shop_id: int, shop: schemas.ShopUpdate, db: Session = Depends(get_db)):
    db_shop = crud.get_shop(db, shop_id=shop_id)
    if db_shop is None:
        raise HTTPException(status_code=404, detail="商铺不存在")
    return crud.update_shop(db=db, shop_id=shop_id, shop=shop)


@router.delete("/{shop_id}", response_model=schemas.Shop)
def delete_shop(shop_id: int, db: Session = Depends(get_db)):
    db_shop = crud.get_shop(db, shop_id=shop_id)
    if db_shop is None:
        raise HTTPException(status_code=404, detail="商铺不存在")
    return crud.delete_shop(db=db, shop_id=shop_id)
