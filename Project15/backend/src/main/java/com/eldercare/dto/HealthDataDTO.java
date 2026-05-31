package com.eldercare.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HealthDataDTO {
    private Long id;
    private Long elderlyId;
    private Long deviceId;
    private String elderlyName;
    private Integer heartRate;
    private Double bloodOxygen;
    private Double temperature;
    private Double systolicPressure;
    private Double diastolicPressure;
    private Integer steps;
    private String sleepQuality;
    private LocalDateTime dataTime;
    private Integer status;
    private LocalDateTime createTime;
}
