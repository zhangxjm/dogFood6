package com.aerospace.groundstation.repository;

import com.aerospace.groundstation.entity.SatelliteData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SatelliteDataRepository extends JpaRepository<SatelliteData, Long> {

    List<SatelliteData> findTop10ByOrderByReceivedTimeDesc();

    Page<SatelliteData> findBySatelliteId(String satelliteId, Pageable pageable);

    Page<SatelliteData> findByDataType(String dataType, Pageable pageable);

    Page<SatelliteData> findByStatus(SatelliteData.DataStatus status, Pageable pageable);

    Page<SatelliteData> findByReceivedTimeBetween(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);

    @Query("SELECT s FROM SatelliteData s WHERE " +
           "(:satelliteId IS NULL OR s.satelliteId = :satelliteId) AND " +
           "(:dataType IS NULL OR s.dataType = :dataType) AND " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:startTime IS NULL OR s.receivedTime >= :startTime) AND " +
           "(:endTime IS NULL OR s.receivedTime <= :endTime) " +
           "ORDER BY s.receivedTime DESC")
    Page<SatelliteData> findByFilters(
            @Param("satelliteId") String satelliteId,
            @Param("dataType") String dataType,
            @Param("status") SatelliteData.DataStatus status,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable);

    long countByStatus(SatelliteData.DataStatus status);

    @Query("SELECT COUNT(s) FROM SatelliteData s WHERE s.receivedTime >= :startOfDay")
    long countTodayRecords(@Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COUNT(s) FROM SatelliteData s WHERE s.receivedTime BETWEEN :startTime AND :endTime")
    long countByReceivedTimeBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}
