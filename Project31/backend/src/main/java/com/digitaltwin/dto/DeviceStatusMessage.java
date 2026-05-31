package com.digitaltwin.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

public class DeviceStatusMessage implements Serializable {

    private String deviceCode;
    private String deviceName;
    private String status;
    private Double temperature;
    private Double humidity;
    private Double pressure;
    private Double vibration;
    private Double rpm;
    private Double powerConsumption;
    private Double efficiency;
    private String alarmLevel;
    private String alarmMessage;
    private LocalDateTime timestamp;

    public String getDeviceCode() { return deviceCode; }
    public void setDeviceCode(String deviceCode) { this.deviceCode = deviceCode; }

    public String getDeviceName() { return deviceName; }
    public void setDeviceName(String deviceName) { this.deviceName = deviceName; }

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

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
