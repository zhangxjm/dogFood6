from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CollisionAlert as CollisionAlertModel
from app.models.schemas import CollisionAlert, CollisionAlertCreate, CollisionCheckRequest
from app.services.collision_detection import CollisionDetector

router = APIRouter()


@router.post("/collision/check", response_model=CollisionAlert)
def check_collision(request: CollisionCheckRequest, db: Session = Depends(get_db)):
    try:
        detector = CollisionDetector(db)
        alert = detector.check_collision(
            sat1_id=request.satellite1_id,
            sat2_id=request.satellite2_id,
            time_window=request.time_window,
            threshold_distance=request.threshold_distance
        )

        if alert is None:
            raise HTTPException(status_code=404, detail="No collision risk detected within threshold")

        db_alert = CollisionAlertModel(**alert.model_dump())
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)

        return db_alert
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Collision check error: {str(e)}")


@router.get("/collision/alerts", response_model=List[CollisionAlert])
def get_collision_alerts(skip: int = 0, limit: int = 100, resolved: bool = None, db: Session = Depends(get_db)):
    query = db.query(CollisionAlertModel)
    if resolved is not None:
        query = query.filter(CollisionAlertModel.resolved == resolved)

    alerts = query.order_by(CollisionAlertModel.created_at.desc()).offset(skip).limit(limit).all()
    return alerts


@router.post("/collision/scan")
def scan_all_collisions(time_window: float = 86400.0, threshold_distance: float = 10.0, db: Session = Depends(get_db)):
    try:
        detector = CollisionDetector(db)
        alerts = detector.scan_all_collisions(time_window, threshold_distance)

        created_alerts = []
        for alert in alerts:
            db_alert = CollisionAlertModel(**alert.model_dump())
            db.add(db_alert)
            db.flush()
            db.refresh(db_alert)
            created_alerts.append(db_alert)

        db.commit()

        return {
            "message": f"Scan complete. Found {len(created_alerts)} potential collision risks.",
            "alerts": created_alerts
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Collision scan error: {str(e)}")


@router.put("/collision/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(CollisionAlertModel).filter(CollisionAlertModel.id == alert_id).first()
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.resolved = True
    db.commit()
    db.refresh(alert)

    return {"message": "Alert resolved successfully", "alert": alert}
