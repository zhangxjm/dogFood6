import numpy as np
from scipy.integrate import ode
from datetime import datetime, timedelta
from typing import List, Tuple
import math

from app.models.schemas import OrbitPosition


class OrbitPhysics:
    MU = 398600.4418
    J2 = 1.08263e-3
    R_EARTH = 6378.137

    @staticmethod
    def keplerian_to_cartesian(a: float, e: float, i: float, raan: float, argp: float, nu: float) -> Tuple[np.ndarray, np.ndarray]:
        i_rad = math.radians(i)
        raan_rad = math.radians(raan)
        argp_rad = math.radians(argp)
        nu_rad = math.radians(nu)

        p = a * (1 - e ** 2)
        r = p / (1 + e * math.cos(nu_rad))

        r_pqw = np.array([
            r * math.cos(nu_rad),
            r * math.sin(nu_rad),
            0.0
        ])

        v_pqw = np.array([
            -math.sqrt(OrbitPhysics.MU / p) * math.sin(nu_rad),
            math.sqrt(OrbitPhysics.MU / p) * (e + math.cos(nu_rad)),
            0.0
        ])

        R3_raan = np.array([
            [math.cos(raan_rad), -math.sin(raan_rad), 0],
            [math.sin(raan_rad), math.cos(raan_rad), 0],
            [0, 0, 1]
        ])

        R1_i = np.array([
            [1, 0, 0],
            [0, math.cos(i_rad), -math.sin(i_rad)],
            [0, math.sin(i_rad), math.cos(i_rad)]
        ])

        R3_argp = np.array([
            [math.cos(argp_rad), -math.sin(argp_rad), 0],
            [math.sin(argp_rad), math.cos(argp_rad), 0],
            [0, 0, 1]
        ])

        R = R3_raan @ R1_i @ R3_argp

        r_eci = R @ r_pqw
        v_eci = R @ v_pqw

        return r_eci, v_eci

    @staticmethod
    def cartesian_to_keplerian(r: np.ndarray, v: np.ndarray) -> Tuple[float, float, float, float, float, float]:
        h = np.cross(r, v)
        n = np.cross(np.array([0, 0, 1]), h)

        r_mag = np.linalg.norm(r)
        v_mag = np.linalg.norm(v)
        h_mag = np.linalg.norm(h)
        n_mag = np.linalg.norm(n)

        e_vec = (v_mag ** 2 - OrbitPhysics.MU / r_mag) * r / OrbitPhysics.MU - np.dot(r, v) * v / OrbitPhysics.MU
        e = np.linalg.norm(e_vec)

        a = 1 / (2 / r_mag - v_mag ** 2 / OrbitPhysics.MU)

        i = math.degrees(math.acos(h[2] / h_mag))

        raan = math.degrees(math.acos(n[0] / n_mag))
        if n[1] < 0:
            raan = 360 - raan

        argp = math.degrees(math.acos(np.dot(n, e_vec) / (n_mag * e)))
        if e_vec[2] < 0:
            argp = 360 - argp

        nu = math.degrees(math.acos(np.dot(e_vec, r) / (e * r_mag)))
        if np.dot(r, v) < 0:
            nu = 360 - nu

        return a, e, i, raan, argp, nu

    @staticmethod
    def orbit_dynamics(t: float, y: np.ndarray, use_j2: bool = True) -> np.ndarray:
        r = y[:3]
        v = y[3:]

        r_mag = np.linalg.norm(r)

        a = -OrbitPhysics.MU * r / (r_mag ** 3)

        if use_j2:
            x, y, z = r
            r5 = r_mag ** 5
            z2 = z * z
            r2 = r_mag * r_mag

            j2_factor = (3 * OrbitPhysics.MU * OrbitPhysics.J2 * OrbitPhysics.R_EARTH ** 2) / (2 * r5)
            j2_x = j2_factor * x * (5 * z2 / r2 - 1)
            j2_y = j2_factor * y * (5 * z2 / r2 - 1)
            j2_z = j2_factor * z * (5 * z2 / r2 - 3)

            a += np.array([j2_x, j2_y, j2_z])

        return np.concatenate([v, a])

    @staticmethod
    def propagate_orbit(r0: np.ndarray, v0: np.ndarray, time_step: float, duration: float, use_j2: bool = True) -> List[Tuple[float, np.ndarray, np.ndarray]]:
        y0 = np.concatenate([r0, v0])

        solver = ode(OrbitPhysics.orbit_dynamics)
        solver.set_integrator('dopri5', rtol=1e-9, atol=1e-12)
        solver.set_initial_value(y0, 0.0)
        solver.set_f_params(use_j2)

        results = []
        num_steps = int(duration / time_step) + 1

        for step in range(num_steps):
            t = step * time_step
            if step > 0:
                solver.integrate(t)

            if solver.successful():
                r = solver.y[:3]
                v = solver.y[3:]
                results.append((t, r, v))
            else:
                break

        return results

    @staticmethod
    def calculate_orbital_period(a: float) -> float:
        return 2 * math.pi * math.sqrt(a ** 3 / OrbitPhysics.MU)

    @staticmethod
    def calculate_apoapsis(a: float, e: float) -> float:
        return a * (1 + e)

    @staticmethod
    def calculate_periapsis(a: float, e: float) -> float:
        return a * (1 - e)


class OrbitCalculator:
    def __init__(self):
        self.physics = OrbitPhysics()

    def calculate_orbit(self, a: float, e: float, i: float, raan: float, argp: float, nu: float, time_step: float = 60.0, duration: float = 3600.0) -> dict:
        r0, v0 = self.physics.keplerian_to_cartesian(a, e, i, raan, argp, nu)

        results = self.physics.propagate_orbit(r0, v0, time_step, duration, use_j2=True)

        start_time = datetime.utcnow()
        positions = []
        for t, r, v in results:
            timestamp = start_time + timedelta(seconds=t)
            positions.append(OrbitPosition(
                timestamp=timestamp,
                position_x=float(r[0]),
                position_y=float(r[1]),
                position_z=float(r[2]),
                velocity_x=float(v[0]),
                velocity_y=float(v[1]),
                velocity_z=float(v[2])
            ))

        period = self.physics.calculate_orbital_period(a)
        apoapsis = self.physics.calculate_apoapsis(a, e)
        periapsis = self.physics.calculate_periapsis(a, e)

        return {
            'positions': positions,
            'orbital_period': period,
            'apoapsis': apoapsis,
            'periapsis': periapsis
        }

    def get_position_at_time(self, a: float, e: float, i: float, raan: float, argp: float, nu: float, elapsed_seconds: float) -> Tuple[np.ndarray, np.ndarray]:
        r0, v0 = self.physics.keplerian_to_cartesian(a, e, i, raan, argp, nu)

        if elapsed_seconds == 0:
            return r0, v0

        results = self.physics.propagate_orbit(r0, v0, elapsed_seconds, elapsed_seconds, use_j2=True)
        if results:
            return results[-1][1], results[-1][2]
        return r0, v0
