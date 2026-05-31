package com.eldercare.repository;

import com.eldercare.entity.WearableDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WearableDeviceRepository extends JpaRepository<WearableDevice, Long> {
    Optional<WearableDevice> findByDeviceCode(String deviceCode);
    Optional<WearableDevice> findByBluetoothMac(String bluetoothMac);
    List<WearableDevice> findByElderlyId(Long elderlyId);
    List<WearableDevice> findByElderlyIdAndStatus(Long elderlyId, Integer status);
    List<WearableDevice> findByStatus(Integer status);
}
