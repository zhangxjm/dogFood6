package com.inspection.repository;

import com.inspection.entity.DefectType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DefectTypeRepository extends JpaRepository<DefectType, Long> {
}
