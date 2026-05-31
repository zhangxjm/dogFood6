import numpy as np
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from scipy.optimize import minimize_scalar

from app.services.orbit_calculator import OrbitCalculator, OrbitPhysics
from app.models.schemas import CollisionAlert, CollisionAlertCreate
from app.models import Satellite, OrbitParameters
from sqlalchemy.orm import Session


class CollisionDetector:
    def __init__(self, db: Session):
        self.db = db
        self.orbit_calc = OrbitCalculator()

    def get_satellite_state(self, satellite_id: int, elapsed_time: float) -> Optional[Tuple[np.ndarray, np.ndarray]]:
        orbit_params = self.db.query(OrbitParameters).filter(OrbitParameters.satellite_id == satellite_id).first()
        if not orbit_params:
            return None

        r, v = self.orbit_calc.get_position_at_time(
            orbit_params.semi_major_axis,
            orbit_params.eccentricity,
            orbit_params.inclination,
            orbit_params.raan,
            orbit_params.arg_of_perigee,
            orbit_params.true_anomaly,
            elapsed_time
        )

        return r, v

    def calculate_distance(self, r1: np.ndarray, r2: np.ndarray) -> float:
        return float(np.linalg.norm(r1 - r2))

    def calculate_relative_velocity(self, v1: np.ndarray, v2: np.ndarray) -> float:
        return float(np.linalg.norm(v2 - v1))

    def distance_function(self, t: float, sat1_id: int, sat2_id: int) -> float:
        state1 = self.get_satellite_state(sat1_id, t)
        state2 = self.get_satellite_state(sat2_id, t)

        if state1 is None or state2 is None:
            return 1e10

        r1, _ = state1
        r2, _ = state2

        return self.calculate_distance(r1, r2)

    def find_closest_approach(self, sat1_id: int, sat2_id: int, time_window: float = 86400.0, num_samples: int = 1000) -> Tuple[float, float, float]:
        best_t = 0.0
        min_dist = float('inf')

        for i in range(num_samples):
            t = (i / num_samples) * time_window
            dist = self.distance_function(t, sat1_id, sat2_id)
            if dist < min_dist:
                min_dist = dist
                best_t = t

        search_range = max(time_window / num_samples * 5, 60.0)
        t_min = max(0, best_t - search_range)
        t_max = min(time_window, best_t + search_range)

        result = minimize_scalar(
            self.distance_function,
            bracket=(t_min, best_t, t_max),
            args=(sat1_id, sat2_id),
            method='brent',
            tol=1e-6
        )

        closest_t = float(result.x)
        closest_dist = float(result.fun)

        state1 = self.get_satellite_state(sat1_id, closest_t)
        state2 = self.get_satellite_state(sat2_id, closest_t)

        rel_vel = 0.0
        if state1 and state2:
            rel_vel = self.calculate_relative_velocity(state1[1], state2[1])

        return closest_t, closest_dist, rel_vel

    def calculate_collision_probability(self, miss_distance: float, relative_velocity: float, sigma: float = 50.0) -> float:
        if miss_distance <= 0:
            return 1.0

        r_eq = miss_distance
        probability = 1.0 - np.exp(-r_eq ** 2 / (2 * sigma ** 2))

        return float(min(probability, 1.0))

    def check_collision(self, sat1_id: int, sat2_id: int, time_window: float = 86400.0, threshold_distance: float = 10.0) -> Optional[CollisionAlertCreate]:
        closest_t, closest_dist, rel_vel = self.find_closest_approach(sat1_id, sat2_id, time_window)

        if closest_dist < threshold_distance * 10:
            prob = self.calculate_collision_probability(closest_dist, rel_vel)

            if closest_dist < threshold_distance:
                alert_level = "critical"
            elif closest_dist < threshold_distance * 3:
                alert_level = "warning"
            else:
                alert_level = "advisory"

            collision_time = datetime.utcnow() + timedelta(seconds=closest_t)

            return CollisionAlertCreate(
                satellite1_id=sat1_id,
                satellite2_id=sat2_id,
                collision_time=collision_time,
                probability=prob,
                miss_distance=closest_dist,
                relative_velocity=rel_vel,
                alert_level=alert_level,
                resolved=False
            )

        return None

    def scan_all_collisions(self, time_window: float = 86400.0, threshold_distance: float = 10.0) -> List[CollisionAlertCreate]:
        satellites = self.db.query(Satellite).filter(Satellite.operational == True).all()
        alerts = []

        for i in range(len(satellites)):
            for j in range(i + 1, len(satellites)):
                alert = self.check_collision(
                    satellites[i].id,
                    satellites[j].id,
                    time_window,
                    threshold_distance
                )
                if alert:
                    alerts.append(alert)

        return alerts


class ConjunctionAnalyzer:
    @staticmethod
    def compute_tca(positions1: List[np.ndarray], positions2: List[np.ndarray]) -> Tuple[int, float]:
        min_dist = float('inf')
        tca_idx = 0

        for i, (r1, r2) in enumerate(zip(positions1, positions2)):
            dist = np.linalg.norm(r1 - r2)
            if dist < min_dist:
                min_dist = dist
                tca_idx = i

        return tca_idx, float(min_dist)

    @staticmethod
    def assess_risk(miss_distance: float, relative_velocity: float) -> dict:
        risk_level = "low"
        if miss_distance < 1.0:
            risk_level = "extreme"
        elif miss_distance < 5.0:
            risk_level = "high"
        elif miss_distance < 15.0:
            risk_level = "medium"

        return {
            "risk_level": risk_level,
            "miss_distance_km": miss_distance,
            "relative_velocity_km_s": relative_velocity,
            "required_maneuver_delta_v": miss_distance < 10.0
        }
