package com.inspection.repository;

import com.inspection.entity.Camera;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CameraRepository extends JpaRepository<Camera, Long> {
}
