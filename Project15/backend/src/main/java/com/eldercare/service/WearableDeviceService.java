package com.eldercare.service;

import com.eldercare.entity.WearableDevice;
import com.eldercare.repository.WearableDeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class WearableDeviceService {
    private final WearableDeviceRepository deviceRepository;

    public List<WearableDevice> list() {
        return deviceRepository.findByStatus(1);
    }

    public Optional<WearableDevice> getById(Long id) {
        return deviceRepository.findById(id);
    }

    public Optional<WearableDevice> getByDeviceCode(String deviceCode) {
        return deviceRepository.findByDeviceCode(deviceCode);
    }

    public List<WearableDevice> listByElderly(Long elderlyId) {
        return deviceRepository.findByElderlyIdAndStatus(elderlyId, 1);
    }

    public WearableDevice create(WearableDevice device) {
        return deviceRepository.save(device);
    }

    public WearableDevice update(Long id, WearableDevice device) {
        return deviceRepository.findById(id)
                .map(existing -> {
                    if (device.getDeviceName() != null) existing.setDeviceName(device.getDeviceName());
                    if (device.getDeviceType() != null) existing.setDeviceType(device.getDeviceType());
                    if (device.getBluetoothMac() != null) existing.setBluetoothMac(device.getBluetoothMac());
                    if (device.getElderlyId() != null) existing.setElderlyId(device.getElderlyId());
                    return deviceRepository.save(existing);
                })
                .orElse(null);
    }

    public void delete(Long id) {
        deviceRepository.findById(id).ifPresent(device -> {
            device.setStatus(0);
            deviceRepository.save(device);
        });
    }
}
