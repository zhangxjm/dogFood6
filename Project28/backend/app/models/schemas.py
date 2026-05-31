from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class SatelliteBase(BaseModel):
    name: str = Field(..., description="卫星名称")
    norad_id: str = Field(..., description="NORAD ID")
    satellite_type: Optional[str] = None
    launch_date: Optional[datetime] = None
    operational: bool = True
    description: Optional[str] = None


class SatelliteCreate(SatelliteBase):
    pass


class Satellite(SatelliteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrbitParametersBase(BaseModel):
    semi_major_axis: float = Field(..., description="半长轴 (km)")
    eccentricity: float = Field(..., description="偏心率")
    inclination: float = Field(..., description="倾角 (度)")
    raan: float = Field(..., description="升交点赤经 (度)")
    arg_of_perigee: float = Field(..., description="近地点幅角 (度)")
    true_anomaly: float = Field(..., description="真近点角 (度)")
    epoch: datetime
    mean_motion: Optional[float] = None
    period: Optional[float] = None


class OrbitParametersCreate(OrbitParametersBase):
    satellite_id: int


class OrbitParameters(OrbitParametersBase):
    id: int
    satellite_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrbitCalculationRequest(BaseModel):
    semi_major_axis: float
    eccentricity: float
    inclination: float
    raan: float
    arg_of_perigee: float
    true_anomaly: float
    time_step: float = 60.0
    duration: float = 3600.0


class OrbitPosition(BaseModel):
    timestamp: datetime
    position_x: float
    position_y: float
    position_z: float
    velocity_x: float
    velocity_y: float
    velocity_z: float


class OrbitCalculationResponse(BaseModel):
    satellite_id: Optional[int] = None
    positions: List[OrbitPosition]
    orbital_period: float
    apoapsis: float
    periapsis: float


class TelemetryBase(BaseModel):
    satellite_id: int
    timestamp: datetime
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    position_z: Optional[float] = None
    velocity_x: Optional[float] = None
    velocity_y: Optional[float] = None
    velocity_z: Optional[float] = None


class TelemetryCreate(TelemetryBase):
    pass


class Telemetry(TelemetryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CollisionAlertBase(BaseModel):
    satellite1_id: int
    satellite2_id: int
    collision_time: datetime
    probability: float
    miss_distance: Optional[float] = None
    relative_velocity: Optional[float] = None
    alert_level: str = "warning"
    resolved: bool = False


class CollisionAlertCreate(CollisionAlertBase):
    pass


class CollisionAlert(CollisionAlertBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CollisionCheckRequest(BaseModel):
    satellite1_id: int
    satellite2_id: int
    time_window: float = 86400.0
    threshold_distance: float = 10.0


class SatelliteDetail(Satellite):
    orbit_params: Optional[OrbitParameters] = None
