package com.eldercare.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "wearable_device")
public class WearableDevice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "elderly_id")
    private Long elderlyId;

    @Column(nullable = false, unique = true, length = 50)
    private String deviceCode;

    @Column(length = 50)
    private String deviceType;

    @Column(length = 100)
    private String deviceName;

    @Column(length = 50)
    private String bluetoothMac;

    @Column(length = 20)
    private String connectionStatus;

    @Column(length = 20)
    private String batteryLevel;

    private LocalDateTime lastHeartbeatTime;

    @Column(nullable = false)
    private Integer status = 1;

    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
}
