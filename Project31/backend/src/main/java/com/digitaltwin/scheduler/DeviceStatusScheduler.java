package com.digitaltwin.scheduler;

import com.digitaltwin.service.DeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DeviceStatusScheduler {

    @Autowired
    private DeviceService deviceService;

    @Scheduled(fixedRate = 5000)
    public void simulateDeviceStatus() {
        try {
            deviceService.simulateDeviceStatus();
        } catch (Exception e) {
            System.err.println("Device status simulation error: " + e.getMessage());
        }
    }
}
