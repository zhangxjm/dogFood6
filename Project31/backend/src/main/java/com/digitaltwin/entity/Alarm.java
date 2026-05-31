package com.digitaltwin.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "alarms")
public class Alarm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String deviceCode;

    private String deviceName;

    @Column(nullable = false)
    private String alarmLevel;

    private String alarmType;

    @Column(nullable = false)
    private String alarmMessage;

    private String status = "ACTIVE";

    private LocalDateTime alarmTime;

    private LocalDateTime resolveTime;

    private String resolveNote;

    @PrePersist
    protected void onCreate() {
        alarmTime = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDeviceCode() { return deviceCode; }
    public void setDeviceCode(String deviceCode) { this.deviceCode = deviceCode; }

    public String getDeviceName() { return deviceName; }
    public void setDeviceName(String deviceName) { this.deviceName = deviceName; }

    public String getAlarmLevel() { return alarmLevel; }
    public void setAlarmLevel(String alarmLevel) { this.alarmLevel = alarmLevel; }

    public String getAlarmType() { return alarmType; }
    public void setAlarmType(String alarmType) { this.alarmType = alarmType; }

    public String getAlarmMessage() { return alarmMessage; }
    public void setAlarmMessage(String alarmMessage) { this.alarmMessage = alarmMessage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getAlarmTime() { return alarmTime; }
    public void setAlarmTime(LocalDateTime alarmTime) { this.alarmTime = alarmTime; }

    public LocalDateTime getResolveTime() { return resolveTime; }
    public void setResolveTime(LocalDateTime resolveTime) { this.resolveTime = resolveTime; }

    public String getResolveNote() { return resolveNote; }
    public void setResolveNote(String resolveNote) { this.resolveNote = resolveNote; }
}
