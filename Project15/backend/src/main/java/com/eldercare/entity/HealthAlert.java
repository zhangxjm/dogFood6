package com.eldercare.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "health_alert")
public class HealthAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "elderly_id")
    private Long elderlyId;

    @Column(name = "device_id")
    private Long deviceId;

    @Column(length = 50)
    private String alertType;

    @Column(length = 500)
    private String alertContent;

    @Column(length = 20)
    private String alertLevel;

    @Column(length = 20)
    private String alertStatus;

    @Column(length = 200)
    private String alertValue;

    private LocalDateTime alertTime;

    private LocalDateTime handleTime;

    @Column(length = 200)
    private String handleResult;

    private LocalDateTime createTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        if (alertTime == null) {
            alertTime = LocalDateTime.now();
        }
        if (alertStatus == null) {
            alertStatus = "PENDING";
        }
    }
}
