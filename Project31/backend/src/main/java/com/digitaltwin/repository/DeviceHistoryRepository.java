package com.digitaltwin.repository;

import com.digitaltwin.entity.DeviceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DeviceHistoryRepository extends JpaRepository<DeviceHistory, Long> {

    List<DeviceHistory> findByDeviceCodeOrderByRecordTimeDesc(String deviceCode);

    @Query("SELECT h FROM DeviceHistory h WHERE h.deviceCode = :deviceCode AND h.recordTime BETWEEN :startTime AND :endTime ORDER BY h.recordTime ASC")
    List<DeviceHistory> findByDeviceCodeAndTimeRange(
            @Param("deviceCode") String deviceCode,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT h FROM DeviceHistory h WHERE h.deviceCode = :deviceCode ORDER BY h.recordTime DESC LIMIT :limit")
    List<DeviceHistory> findLatestByDeviceCode(@Param("deviceCode") String deviceCode, @Param("limit") int limit);
}
