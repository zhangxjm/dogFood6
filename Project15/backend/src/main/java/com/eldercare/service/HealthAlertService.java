package com.eldercare.service;

import com.eldercare.dto.AlertDTO;
import com.eldercare.entity.HealthAlert;
import com.eldercare.entity.Elderly;
import com.eldercare.repository.ElderlyRepository;
import com.eldercare.repository.HealthAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HealthAlertService {
    private final HealthAlertRepository alertRepository;
    private final ElderlyRepository elderlyRepository;
    private final DataDesensitizationService desensitizationService;
    private final WebSocketService webSocketService;

    @Value("${eldercare.health.heart-rate.min-normal:60}")
    private int heartRateMinNormal;

    @Value("${eldercare.health.heart-rate.max-normal:100}")
    private int heartRateMaxNormal;

    @Value("${eldercare.health.heart-rate.critical-low:40}")
    private int heartRateCriticalLow;

    @Value("${eldercare.health.heart-rate.critical-high:140}")
    private int heartRateCriticalHigh;

    @Value("${eldercare.health.blood-oxygen.min-normal:95}")
    private double bloodOxygenMinNormal;

    @Value("${eldercare.health.blood-oxygen.critical-low:90}")
    private double bloodOxygenCriticalLow;

    @Value("${eldercare.health.temperature.min-normal:36.0}")
    private double temperatureMinNormal;

    @Value("${eldercare.health.temperature.max-normal:37.5}")
    private double temperatureMaxNormal;

    @Value("${eldercare.health.temperature.critical-low:35.0}")
    private double temperatureCriticalLow;

    @Value("${eldercare.health.temperature.critical-high:39.0}")
    private double temperatureCriticalHigh;

    public List<AlertDTO> listByElderly(Long elderlyId) {
        return alertRepository.findByElderlyIdOrderByAlertTimeDesc(elderlyId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AlertDTO> listPending() {
        return alertRepository.findByAlertStatusOrderByAlertTimeDesc("PENDING").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AlertDTO> listAll() {
        return alertRepository.findAllByOrderByAlertTimeDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AlertDTO> listHandled() {
        return alertRepository.findByAlertStatusOrderByAlertTimeDesc("HANDLED").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AlertDTO handleAlert(Long id, String handleResult) {
        return alertRepository.findById(id)
                .map(alert -> {
                    alert.setAlertStatus("HANDLED");
                    alert.setHandleTime(LocalDateTime.now());
                    alert.setHandleResult(handleResult);
                    return convertToDTO(alertRepository.save(alert));
                })
                .orElse(null);
    }

    public HealthAlert createAlert(Long elderlyId, Long deviceId, String alertType,
                                    String alertContent, String alertLevel, String alertValue) {
        HealthAlert alert = new HealthAlert();
        alert.setElderlyId(elderlyId);
        alert.setDeviceId(deviceId);
        alert.setAlertType(alertType);
        alert.setAlertContent(alertContent);
        alert.setAlertLevel(alertLevel);
        alert.setAlertStatus("PENDING");
        alert.setAlertValue(alertValue);
        alert.setAlertTime(LocalDateTime.now());
        
        HealthAlert saved = alertRepository.save(alert);
        
        AlertDTO alertDTO = convertToDTO(saved);
        webSocketService.broadcastAlert(alertDTO);
        
        return saved;
    }

    public void checkHeartRate(Long elderlyId, Long deviceId, int heartRate) {
        if (heartRate < heartRateCriticalLow) {
            createAlert(elderlyId, deviceId, "HEART_RATE",
                    "心率过低警告: " + heartRate + "次/分", "CRITICAL", String.valueOf(heartRate));
        } else if (heartRate > heartRateCriticalHigh) {
            createAlert(elderlyId, deviceId, "HEART_RATE",
                    "心率过高警告: " + heartRate + "次/分", "CRITICAL", String.valueOf(heartRate));
        } else if (heartRate < heartRateMinNormal) {
            createAlert(elderlyId, deviceId, "HEART_RATE",
                    "心率偏低提醒: " + heartRate + "次/分", "WARNING", String.valueOf(heartRate));
        } else if (heartRate > heartRateMaxNormal) {
            createAlert(elderlyId, deviceId, "HEART_RATE",
                    "心率偏高提醒: " + heartRate + "次/分", "WARNING", String.valueOf(heartRate));
        }
    }

    public void checkBloodOxygen(Long elderlyId, Long deviceId, double bloodOxygen) {
        if (bloodOxygen < bloodOxygenCriticalLow) {
            createAlert(elderlyId, deviceId, "BLOOD_OXYGEN",
                    "血氧过低警告: " + bloodOxygen + "%", "CRITICAL", String.valueOf(bloodOxygen));
        } else if (bloodOxygen < bloodOxygenMinNormal) {
            createAlert(elderlyId, deviceId, "BLOOD_OXYGEN",
                    "血氧偏低提醒: " + bloodOxygen + "%", "WARNING", String.valueOf(bloodOxygen));
        }
    }

    public void checkTemperature(Long elderlyId, Long deviceId, double temperature) {
        if (temperature < temperatureCriticalLow) {
            createAlert(elderlyId, deviceId, "TEMPERATURE",
                    "体温过低警告: " + temperature + "℃", "CRITICAL", String.valueOf(temperature));
        } else if (temperature > temperatureCriticalHigh) {
            createAlert(elderlyId, deviceId, "TEMPERATURE",
                    "体温过高警告: " + temperature + "℃", "CRITICAL", String.valueOf(temperature));
        } else if (temperature < temperatureMinNormal) {
            createAlert(elderlyId, deviceId, "TEMPERATURE",
                    "体温偏低提醒: " + temperature + "℃", "WARNING", String.valueOf(temperature));
        } else if (temperature > temperatureMaxNormal) {
            createAlert(elderlyId, deviceId, "TEMPERATURE",
                    "体温偏高提醒: " + temperature + "℃", "WARNING", String.valueOf(temperature));
        }
    }

    private AlertDTO convertToDTO(HealthAlert alert) {
        AlertDTO dto = new AlertDTO();
        BeanUtils.copyProperties(alert, dto);
        elderlyRepository.findById(alert.getElderlyId())
                .ifPresent(e -> dto.setElderlyName(e.getName()));
        return desensitizationService.desensitizeAlert(dto);
    }
}
