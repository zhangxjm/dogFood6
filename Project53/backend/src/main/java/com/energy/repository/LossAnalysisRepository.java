package com.energy.repository;

import com.energy.entity.LossAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LossAnalysisRepository extends JpaRepository<LossAnalysis, Long> {

    List<LossAnalysis> findByEquipmentId(Long equipmentId);

    List<LossAnalysis> findBySeverity(String severity);

    List<LossAnalysis> findByLossType(String lossType);

    @Query("SELECT l FROM LossAnalysis l WHERE l.analysisTime BETWEEN :start AND :end")
    List<LossAnalysis> findByAnalysisTimeBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT SUM(l.lossValue) FROM LossAnalysis l WHERE l.equipmentId = :equipmentId AND l.analysisTime BETWEEN :start AND :end")
    Double sumLossValueByEquipmentIdAndTime(@Param("equipmentId") Long equipmentId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
