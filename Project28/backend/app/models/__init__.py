from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Satellite(Base):
    __tablename__ = "satellites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    norad_id = Column(String(50), unique=True, index=True)
    satellite_type = Column(String(50))
    launch_date = Column(DateTime)
    operational = Column(Boolean, default=True)
    description = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    orbit_params = relationship("OrbitParameters", back_populates="satellite", uselist=False)
    telemetry = relationship("Telemetry", back_populates="satellite")


class OrbitParameters(Base):
    __tablename__ = "orbit_parameters"

    id = Column(Integer, primary_key=True, index=True)
    satellite_id = Column(Integer, ForeignKey("satellites.id"), unique=True)
    semi_major_axis = Column(Float, nullable=False)
    eccentricity = Column(Float, nullable=False)
    inclination = Column(Float, nullable=False)
    raan = Column(Float, nullable=False)
    arg_of_perigee = Column(Float, nullable=False)
    true_anomaly = Column(Float, nullable=False)
    epoch = Column(DateTime, nullable=False)
    mean_motion = Column(Float)
    period = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    satellite = relationship("Satellite", back_populates="orbit_params")


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    satellite_id = Column(Integer, ForeignKey("satellites.id"))
    timestamp = Column(DateTime, nullable=False)
    position_x = Column(Float)
    position_y = Column(Float)
    position_z = Column(Float)
    velocity_x = Column(Float)
    velocity_y = Column(Float)
    velocity_z = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    satellite = relationship("Satellite", back_populates="telemetry")


class CollisionAlert(Base):
    __tablename__ = "collision_alerts"

    id = Column(Integer, primary_key=True, index=True)
    satellite1_id = Column(Integer, ForeignKey("satellites.id"))
    satellite2_id = Column(Integer, ForeignKey("satellites.id"))
    collision_time = Column(DateTime, nullable=False)
    probability = Column(Float, nullable=False)
    miss_distance = Column(Float)
    relative_velocity = Column(Float)
    alert_level = Column(String(20))
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
