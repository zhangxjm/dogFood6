package com.aerospace.groundstation.repository;

import com.aerospace.groundstation.entity.DataStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DataStatisticsRepository extends JpaRepository<DataStatistics, Long> {

    List<DataStatistics> findByTimestampBetweenOrderByTimestampAsc(LocalDateTime startTime, LocalDateTime endTime);

    Optional<DataStatistics> findFirstByOrderByTimestampDesc();

    @Query("SELECT ds FROM DataStatistics ds WHERE ds.timestamp >= :startTime ORDER BY ds.timestamp ASC")
    List<DataStatistics> findRecentStatistics(@Param("startTime") LocalDateTime startTime);

    @Query("SELECT SUM(ds.receivedCount) FROM DataStatistics ds WHERE ds.timestamp BETWEEN :startTime AND :endTime")
    Long sumReceivedCountByTimestampBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    @Query("SELECT SUM(ds.processedCount) FROM DataStatistics ds WHERE ds.timestamp BETWEEN :startTime AND :endTime")
    Long sumProcessedCountByTimestampBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    @Query("SELECT SUM(ds.errorCount) FROM DataStatistics ds WHERE ds.timestamp BETWEEN :startTime AND :endTime")
    Long sumErrorCountByTimestampBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}
