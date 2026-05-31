package com.inspection.repository;

import com.inspection.entity.InspectionRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionRecordRepository extends JpaRepository<InspectionRecord, Long> {
}
