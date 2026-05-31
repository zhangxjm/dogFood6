package com.digitaltwin.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "devices")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String deviceCode;

    @Column(nullable = false)
    private String deviceName;

    private String deviceType;

    private String location;

    private String manufacturer;

    private LocalDateTime installDate;

    @Column(nullable = false)
    private String status = "ONLINE";

    private Double temperature;

    private Double humidity;

    private Double pressure;

    private Double vibration;

    private Double rpm;

    private Double powerConsumption;

    private Double efficiency;

    private String alarmLevel = "NORMAL";

    private String alarmMessage;

    private LocalDateTime lastUpdateTime;

    private LocalDateTime createTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        lastUpdateTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdateTime = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDeviceCode() { return deviceCode; }
    public void setDeviceCode(String deviceCode) { this.deviceCode = deviceCode; }

    public String getDeviceName() { return deviceName; }
    public void setDeviceName(String deviceName) { this.deviceName = deviceName; }

    public String getDeviceType() { return deviceType; }
    public void setDeviceType(String deviceType) { this.deviceType = deviceType; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

    public LocalDateTime getInstallDate() { return installDate; }
    public void setInstallDate(LocalDateTime installDate) { this.installDate = installDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Double getHumidity() { return humidity; }
    public void setHumidity(Double humidity) { this.humidity = humidity; }

    public Double getPressure() { return pressure; }
    public void setPressure(Double pressure) { this.pressure = pressure; }

    public Double getVibration() { return vibration; }
    public void setVibration(Double vibration) { this.vibration = vibration; }

    public Double getRpm() { return rpm; }
    public void setRpm(Double rpm) { this.rpm = rpm; }

    public Double getPowerConsumption() { return powerConsumption; }
    public void setPowerConsumption(Double powerConsumption) { this.powerConsumption = powerConsumption; }

    public Double getEfficiency() { return efficiency; }
    public void setEfficiency(Double efficiency) { this.efficiency = efficiency; }

    public String getAlarmLevel() { return alarmLevel; }
    public void setAlarmLevel(String alarmLevel) { this.alarmLevel = alarmLevel; }

    public String getAlarmMessage() { return alarmMessage; }
    public void setAlarmMessage(String alarmMessage) { this.alarmMessage = alarmMessage; }

    public LocalDateTime getLastUpdateTime() { return lastUpdateTime; }
    public void setLastUpdateTime(LocalDateTime lastUpdateTime) { this.lastUpdateTime = lastUpdateTime; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
}
