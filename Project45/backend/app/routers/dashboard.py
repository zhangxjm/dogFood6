from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Craft, LiveRoom, Work

router = APIRouter(prefix="/dashboard", tags=["仪表板"])


@router.get("/stats", summary="获取系统统计数据")
def get_stats(db: Session = Depends(get_db)):
    craft_count = db.query(Craft).count()
    live_count = db.query(LiveRoom).filter(LiveRoom.is_live == True).count()
    work_count = db.query(Work).count()
    verified_work_count = db.query(Work).filter(Work.quality_verified == True).count()
    total_viewers = db.query(LiveRoom).filter(LiveRoom.is_live == True).all()
    total_viewer_count = sum(room.viewer_count for room in total_viewers)

    return {
        "craft_count": craft_count,
        "live_count": live_count,
        "work_count": work_count,
        "verified_work_count": verified_work_count,
        "current_viewers": total_viewer_count,
        "categories": [
            {"name": "陶瓷", "count": 15},
            {"name": "刺绣", "count": 12},
            {"name": "木雕", "count": 8},
            {"name": "剪纸", "count": 10},
            {"name": "皮影", "count": 5}
        ],
        "difficulty_distribution": {
            "beginner": 18,
            "intermediate": 22,
            "advanced": 10
        }
    }


@router.get("/featured", summary="获取精选内容")
def get_featured(db: Session = Depends(get_db)):
    featured_crafts = db.query(Craft).order_by(Craft.created_at.desc()).limit(4).all()
    live_rooms = db.query(LiveRoom).filter(LiveRoom.is_live == True).limit(3).all()
    featured_works = db.query(Work).filter(Work.quality_verified == True).order_by(Work.created_at.desc()).limit(6).all()

    return {
        "featured_crafts": featured_crafts,
        "live_rooms": live_rooms,
        "featured_works": featured_works
    }
