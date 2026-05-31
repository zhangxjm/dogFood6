package com.digitaltwin.repository;

import com.digitaltwin.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {

    Optional<Device> findByDeviceCode(String deviceCode);

    List<Device> findByStatus(String status);

    List<Device> findByAlarmLevelNot(String alarmLevel);

    @Query("SELECT d FROM Device d WHERE d.alarmLevel <> 'NORMAL'")
    List<Device> findDevicesWithAlarms();

    @Query("SELECT COUNT(d) FROM Device d WHERE d.status = 'ONLINE'")
    Long countOnlineDevices();

    @Query("SELECT COUNT(d) FROM Device d WHERE d.alarmLevel <> 'NORMAL'")
    Long countAlarmDevices();
}
