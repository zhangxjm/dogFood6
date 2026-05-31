from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Satellite, OrbitParameters
from app.models.schemas import SatelliteCreate, Satellite as SatelliteSchema, SatelliteDetail, OrbitParametersCreate, OrbitParameters as OrbitSchema

router = APIRouter()


@router.get("/satellites", response_model=List[SatelliteSchema])
def get_satellites(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    satellites = db.query(Satellite).offset(skip).limit(limit).all()
    return satellites


@router.get("/satellites/{satellite_id}", response_model=SatelliteDetail)
def get_satellite(satellite_id: int, db: Session = Depends(get_db)):
    satellite = db.query(Satellite).filter(Satellite.id == satellite_id).first()
    if satellite is None:
        raise HTTPException(status_code=404, detail="Satellite not found")
    return satellite


@router.post("/satellites", response_model=SatelliteSchema)
def create_satellite(satellite: SatelliteCreate, db: Session = Depends(get_db)):
    db_satellite = Satellite(**satellite.model_dump())
    db.add(db_satellite)
    db.commit()
    db.refresh(db_satellite)
    return db_satellite


@router.put("/satellites/{satellite_id}", response_model=SatelliteSchema)
def update_satellite(satellite_id: int, satellite_data: SatelliteCreate, db: Session = Depends(get_db)):
    db_satellite = db.query(Satellite).filter(Satellite.id == satellite_id).first()
    if db_satellite is None:
        raise HTTPException(status_code=404, detail="Satellite not found")

    for key, value in satellite_data.model_dump().items():
        setattr(db_satellite, key, value)

    db.commit()
    db.refresh(db_satellite)
    return db_satellite


@router.delete("/satellites/{satellite_id}")
def delete_satellite(satellite_id: int, db: Session = Depends(get_db)):
    db_satellite = db.query(Satellite).filter(Satellite.id == satellite_id).first()
    if db_satellite is None:
        raise HTTPException(status_code=404, detail="Satellite not found")

    db.delete(db_satellite)
    db.commit()
    return {"message": "Satellite deleted successfully"}


@router.post("/satellites/{satellite_id}/orbit", response_model=OrbitSchema)
def create_orbit_parameters(satellite_id: int, orbit: OrbitParametersCreate, db: Session = Depends(get_db)):
    satellite = db.query(Satellite).filter(Satellite.id == satellite_id).first()
    if satellite is None:
        raise HTTPException(status_code=404, detail="Satellite not found")

    existing_orbit = db.query(OrbitParameters).filter(OrbitParameters.satellite_id == satellite_id).first()
    if existing_orbit:
        for key, value in orbit.model_dump(exclude={'satellite_id'}).items():
            setattr(existing_orbit, key, value)
        db.commit()
        db.refresh(existing_orbit)
        return existing_orbit

    db_orbit = OrbitParameters(**orbit.model_dump())
    db.add(db_orbit)
    db.commit()
    db.refresh(db_orbit)
    return db_orbit


@router.get("/satellites/{satellite_id}/orbit", response_model=OrbitSchema)
def get_orbit_parameters(satellite_id: int, db: Session = Depends(get_db)):
    orbit = db.query(OrbitParameters).filter(OrbitParameters.satellite_id == satellite_id).first()
    if orbit is None:
        raise HTTPException(status_code=404, detail="Orbit parameters not found")
    return orbit
