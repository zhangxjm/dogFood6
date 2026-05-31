package com.eldercare.repository;

import com.eldercare.entity.HealthData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HealthDataRepository extends JpaRepository<HealthData, Long> {
    List<HealthData> findByElderlyIdOrderByDataTimeDesc(Long elderlyId);
    
    @Query("SELECT h FROM HealthData h WHERE h.elderlyId = :elderlyId AND h.dataTime BETWEEN :startTime AND :endTime ORDER BY h.dataTime DESC")
    List<HealthData> findByElderlyIdAndDataTimeBetween(
            @Param("elderlyId") Long elderlyId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
    
    HealthData findTopByElderlyIdOrderByDataTimeDesc(Long elderlyId);
}
