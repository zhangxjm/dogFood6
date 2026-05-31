from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import OrbitCalculationRequest, OrbitCalculationResponse
from app.services.orbit_calculator import OrbitCalculator

router = APIRouter()
orbit_calculator = OrbitCalculator()


@router.post("/orbit/calculate", response_model=OrbitCalculationResponse)
def calculate_orbit(request: OrbitCalculationRequest):
    try:
        result = orbit_calculator.calculate_orbit(
            a=request.semi_major_axis,
            e=request.eccentricity,
            i=request.inclination,
            raan=request.raan,
            argp=request.arg_of_perigee,
            nu=request.true_anomaly,
            time_step=request.time_step,
            duration=request.duration
        )
        return OrbitCalculationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Orbit calculation error: {str(e)}")


@router.get("/orbit/elements")
def get_orbit_elements(semi_major_axis: float, eccentricity: float):
    try:
        from app.services.orbit_calculator import OrbitPhysics
        period = OrbitPhysics.calculate_orbital_period(semi_major_axis)
        apoapsis = OrbitPhysics.calculate_apoapsis(semi_major_axis, eccentricity)
        periapsis = OrbitPhysics.calculate_periapsis(semi_major_axis, eccentricity)

        return {
            "orbital_period_seconds": period,
            "orbital_period_minutes": period / 60,
            "apoapsis_altitude_km": apoapsis - OrbitPhysics.R_EARTH,
            "periapsis_altitude_km": periapsis - OrbitPhysics.R_EARTH,
            "apoapsis_radius_km": apoapsis,
            "periapsis_radius_km": periapsis
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")


@router.post("/orbit/keplerian-to-cartesian")
def keplerian_to_cartesian(request: OrbitCalculationRequest):
    try:
        from app.services.orbit_calculator import OrbitPhysics
        import numpy as np

        r, v = OrbitPhysics.keplerian_to_cartesian(
            a=request.semi_major_axis,
            e=request.eccentricity,
            i=request.inclination,
            raan=request.raan,
            argp=request.arg_of_perigee,
            nu=request.true_anomaly
        )

        return {
            "position": {
                "x": float(r[0]),
                "y": float(r[1]),
                "z": float(r[2])
            },
            "velocity": {
                "x": float(v[0]),
                "y": float(v[1]),
                "z": float(v[2])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Conversion error: {str(e)}")
