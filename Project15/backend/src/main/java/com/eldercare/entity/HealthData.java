package com.eldercare.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "health_data")
public class HealthData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "elderly_id")
    private Long elderlyId;

    @Column(name = "device_id")
    private Long deviceId;

    private Integer heartRate;

    private Double bloodOxygen;

    private Double temperature;

    private Double systolicPressure;

    private Double diastolicPressure;

    private Integer steps;

    @Column(length = 20)
    private String sleepQuality;

    private LocalDateTime dataTime;

    @Column(nullable = false)
    private Integer status = 1;

    private LocalDateTime createTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        if (dataTime == null) {
            dataTime = LocalDateTime.now();
        }
    }
}
