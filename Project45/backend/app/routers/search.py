from fastapi import APIRouter, Depends, Query
from typing import Optional

from ..services.search import search_service
from ..schemas import SearchResponse

router = APIRouter(prefix="/search", tags=["搜索"])


@router.get("", response_model=SearchResponse, summary="全文搜索")
def search(
    q: str = Query(..., description="搜索关键词"),
    type: Optional[str] = Query(None, description="内容类型: craft/work"),
    category: Optional[str] = Query(None, description="分类"),
    difficulty: Optional[str] = Query(None, description="难度级别"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量")
):
    result = search_service.search(
        query=q,
        content_type=type,
        category=category,
        difficulty_level=difficulty,
        page=page,
        page_size=page_size
    )
    return SearchResponse(**result)


@router.get("/suggest", summary="搜索建议")
def get_search_suggestions(prefix: str = Query(..., description="输入前缀")):
    suggestions = search_service.get_suggestions(prefix)
    return {"suggestions": suggestions, "prefix": prefix}


@router.post("/reindex", summary="重建搜索索引")
def rebuild_index():
    from ..database import SessionLocal
    from ..models import Craft, Work

    db = SessionLocal()
    try:
        crafts = db.query(Craft).all()
        works = db.query(Work).all()

        count = search_service.bulk_index(crafts=crafts, works=works)

        return {
            "message": "索引重建完成",
            "indexed_count": count,
            "total_crafts": len(crafts),
            "total_works": len(works)
        }
    finally:
        db.close()


@router.get("/health", summary="搜索服务健康检查")
def search_health():
    is_connected = search_service.connect()
    return {
        "elasticsearch_connected": is_connected,
        "using_fallback": not is_connected,
        "index_name": search_service.index_name
    }
