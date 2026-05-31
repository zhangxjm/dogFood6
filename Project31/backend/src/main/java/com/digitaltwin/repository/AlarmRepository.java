package com.digitaltwin.repository;

import com.digitaltwin.entity.Alarm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlarmRepository extends JpaRepository<Alarm, Long> {

    List<Alarm> findByStatus(String status);

    List<Alarm> findByDeviceCodeOrderByAlarmTimeDesc(String deviceCode);

    @Query("SELECT a FROM Alarm a WHERE a.status = 'ACTIVE' ORDER BY a.alarmTime DESC")
    List<Alarm> findActiveAlarms();

    @Query("SELECT COUNT(a) FROM Alarm a WHERE a.status = 'ACTIVE'")
    Long countActiveAlarms();
}
