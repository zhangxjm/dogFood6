package com.eldercare.service;

import com.eldercare.entity.Elderly;
import com.eldercare.entity.HealthData;
import com.eldercare.entity.WearableDevice;
import com.eldercare.repository.ElderlyRepository;
import com.eldercare.repository.HealthDataRepository;
import com.eldercare.repository.WearableDeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class BluetoothIoTService {
    private final WearableDeviceRepository deviceRepository;
    private final HealthDataRepository healthDataRepository;
    private final ElderlyRepository elderlyRepository;
    private final HealthAlertService alertService;
    private final WebSocketService webSocketService;
    private final DataDesensitizationService desensitizationService;

    private final Random random = new Random();
    private boolean simulationRunning = false;

    @PostConstruct
    public void init() {
        log.info("Bluetooth IoT Service initialized");
    }

    public void startSimulation() {
        simulationRunning = true;
        log.info("Bluetooth IoT simulation started");
    }

    public void stopSimulation() {
        simulationRunning = false;
        log.info("Bluetooth IoT simulation stopped");
    }

    public boolean isSimulationRunning() {
        return simulationRunning;
    }

    @Scheduled(fixedRateString = "${eldercare.bluetooth.data-interval:10000}")
    public void simulateDataCollection() {
        if (!simulationRunning) {
            return;
        }

        List<WearableDevice> devices = deviceRepository.findAll();
        
        for (WearableDevice device : devices) {
            if (device.getElderlyId() == null) continue;
            
            try {
                HealthData healthData = generateSimulatedHealthData(device);
                HealthData saved = healthDataRepository.save(healthData);
                
                updateDeviceStatus(device);
                
                alertService.checkHeartRate(saved.getElderlyId(), saved.getDeviceId(), saved.getHeartRate());
                alertService.checkBloodOxygen(saved.getElderlyId(), saved.getDeviceId(), saved.getBloodOxygen());
                alertService.checkTemperature(saved.getElderlyId(), saved.getDeviceId(), saved.getTemperature());
                
                webSocketService.broadcastHealthData(convertToDTO(saved));
                
                log.debug("Generated health data for device: {}, heart rate: {}, SpO2: {}", 
                        device.getDeviceCode(), saved.getHeartRate(), saved.getBloodOxygen());
                
            } catch (Exception e) {
                log.error("Error generating simulated data for device: {}", device.getDeviceCode(), e);
            }
        }
    }

    private HealthData generateSimulatedHealthData(WearableDevice device) {
        HealthData data = new HealthData();
        data.setElderlyId(device.getElderlyId());
        data.setDeviceId(device.getId());
        
        int baseHeartRate = 75;
        int heartRateVariation = random.nextInt(30) - 10;
        if (random.nextInt(100) < 5) {
            heartRateVariation = random.nextInt(60) + 20;
        }
        data.setHeartRate(baseHeartRate + heartRateVariation);
        
        double baseOxygen = 97.0;
        double oxygenVariation = random.nextDouble() * 3;
        if (random.nextInt(100) < 3) {
            oxygenVariation = random.nextDouble() * 8 + 2;
        }
        data.setBloodOxygen(Math.round((baseOxygen - oxygenVariation) * 10.0) / 10.0);
        
        double baseTemp = 36.5;
        double tempVariation = random.nextDouble() * 1.5 - 0.75;
        data.setTemperature(Math.round((baseTemp + tempVariation) * 10.0) / 10.0);
        
        data.setSystolicPressure(Math.round((120.0 + random.nextDouble() * 20 - 10) * 10.0) / 10.0);
        data.setDiastolicPressure(Math.round((80.0 + random.nextDouble() * 10 - 5) * 10.0) / 10.0);
        
        data.setSteps(random.nextInt(500) + 100);
        
        String[] sleepQualities = {"GOOD", "NORMAL", "POOR"};
        data.setSleepQuality(sleepQualities[random.nextInt(sleepQualities.length)]);
        
        data.setDataTime(LocalDateTime.now());
        data.setStatus(1);
        
        return data;
    }

    private void updateDeviceStatus(WearableDevice device) {
        device.setConnectionStatus("CONNECTED");
        device.setBatteryLevel(String.valueOf(60 + random.nextInt(40)));
        device.setLastHeartbeatTime(LocalDateTime.now());
        deviceRepository.save(device);
    }

    private com.eldercare.dto.HealthDataDTO convertToDTO(HealthData data) {
        com.eldercare.dto.HealthDataDTO dto = new com.eldercare.dto.HealthDataDTO();
        org.springframework.beans.BeanUtils.copyProperties(data, dto);
        elderlyRepository.findById(data.getElderlyId())
                .ifPresent(e -> dto.setElderlyName(e.getName()));
        return desensitizationService.desensitizeHealthData(dto);
    }
}
