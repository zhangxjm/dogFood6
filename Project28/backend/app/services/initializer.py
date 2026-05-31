from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Satellite, OrbitParameters, CollisionAlert
from app.models.schemas import SatelliteCreate, OrbitParametersCreate, CollisionAlertCreate


def init_database():
    db = SessionLocal()
    try:
        satellite_count = db.query(Satellite).count()
        if satellite_count == 0:
            print("Initializing database with sample data...")
            create_sample_satellites(db)
            print("Database initialization complete.")
        else:
            print(f"Database already contains {satellite_count} satellites.")
    finally:
        db.close()


def create_sample_satellites(db: Session):
    sample_satellites = [
        {
            "satellite": SatelliteCreate(
                name="天宫空间站",
                norad_id="48274",
                satellite_type="空间站",
                launch_date=datetime(2021, 4, 29),
                operational=True,
                description="中国空间站核心舱"
            ),
            "orbit": OrbitParametersCreate(
                satellite_id=0,
                semi_major_axis=6780.0,
                eccentricity=0.0005,
                inclination=41.5,
                raan=100.0,
                arg_of_perigee=90.0,
                true_anomaly=0.0,
                epoch=datetime.utcnow(),
                mean_motion=15.5,
                period=92.8
            )
        },
        {
            "satellite": SatelliteCreate(
                name="北斗三号G1",
                norad_id="44231",
                satellite_type="导航卫星",
                launch_date=datetime(2018, 1, 12),
                operational=True,
                description="北斗导航系统卫星"
            ),
            "orbit": OrbitParametersCreate(
                satellite_id=0,
                semi_major_axis=27912.0,
                eccentricity=0.002,
                inclination=55.0,
                raan=110.0,
                arg_of_perigee=0.0,
                true_anomaly=45.0,
                epoch=datetime.utcnow(),
                mean_motion=2.0,
                period=720.0
            )
        },
        {
            "satellite": SatelliteCreate(
                name="风云四号A",
                norad_id="41882",
                satellite_type="气象卫星",
                launch_date=datetime(2016, 12, 11),
                operational=True,
                description="地球静止轨道气象卫星"
            ),
            "orbit": OrbitParametersCreate(
                satellite_id=0,
                semi_major_axis=42164.0,
                eccentricity=0.0001,
                inclination=0.1,
                raan=105.0,
                arg_of_perigee=0.0,
                true_anomaly=0.0,
                epoch=datetime.utcnow(),
                mean_motion=1.0,
                period=1440.0
            )
        },
        {
            "satellite": SatelliteCreate(
                name="高分四号",
                norad_id="41194",
                satellite_type="遥感卫星",
                launch_date=datetime(2015, 12, 29),
                operational=True,
                description="高分辨率对地观测卫星"
            ),
            "orbit": OrbitParametersCreate(
                satellite_id=0,
                semi_major_axis=35786.0 + 6378.0,
                eccentricity=0.001,
                inclination=0.1,
                raan=110.5,
                arg_of_perigee=0.0,
                true_anomaly=180.0,
                epoch=datetime.utcnow(),
                mean_motion=1.0,
                period=1440.0
            )
        },
        {
            "satellite": SatelliteCreate(
                name="墨子号",
                norad_id="41731",
                satellite_type="科学实验卫星",
                launch_date=datetime(2016, 8, 16),
                operational=True,
                description="量子科学实验卫星"
            ),
            "orbit": OrbitParametersCreate(
                satellite_id=0,
                semi_major_axis=6878.0,
                eccentricity=0.001,
                inclination=97.3,
                raan=200.0,
                arg_of_perigee=90.0,
                true_anomaly=0.0,
                epoch=datetime.utcnow(),
                mean_motion=14.9,
                period=96.6
            )
        },
        {
            "satellite": SatelliteCreate(
                name="测试卫星A",
                norad_id="TEST001",
                satellite_type="测试",
                launch_date=datetime(2023, 1, 1),
                operational=True,
                description="用于碰撞测试的卫星"
            ),
            "orbit": OrbitParametersCreate(
                satellite_id=0,
                semi_major_axis=6780.5,
                eccentricity=0.0006,
                inclination=41.6,
                raan=100.1,
                arg_of_perigee=90.0,
                true_anomaly=180.0,
                epoch=datetime.utcnow(),
                mean_motion=15.5,
                period=92.8
            )
        }
    ]

    for data in sample_satellites:
        db_satellite = Satellite(**data["satellite"].model_dump())
        db.add(db_satellite)
        db.flush()

        orbit_data = data["orbit"].model_dump()
        orbit_data["satellite_id"] = db_satellite.id
        db_orbit = OrbitParameters(**orbit_data)
        db.add(db_orbit)

    db.commit()
