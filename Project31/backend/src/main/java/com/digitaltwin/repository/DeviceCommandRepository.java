package com.digitaltwin.repository;

import com.digitaltwin.entity.DeviceCommand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceCommandRepository extends JpaRepository<DeviceCommand, Long> {

    List<DeviceCommand> findByDeviceCodeOrderByCreateTimeDesc(String deviceCode);

    List<DeviceCommand> findByStatus(String status);

    List<DeviceCommand> findByDeviceCodeAndStatus(String deviceCode, String status);
}
