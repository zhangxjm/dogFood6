package com.digitaltwin.service;

import com.digitaltwin.dto.DeviceStatusMessage;
import com.digitaltwin.entity.Device;
import com.digitaltwin.entity.DeviceHistory;
import com.digitaltwin.mq.DeviceStatusProducer;
import com.digitaltwin.repository.DeviceHistoryRepository;
import com.digitaltwin.repository.DeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class DeviceService {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private DeviceHistoryRepository deviceHistoryRepository;

    @Autowired
    private DeviceStatusProducer deviceStatusProducer;

    private final Random random = new Random();

    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    public Device getDeviceByCode(String deviceCode) {
        return deviceRepository.findByDeviceCode(deviceCode).orElse(null);
    }

    public Device saveDevice(Device device) {
        return deviceRepository.save(device);
    }

    public void deleteDevice(Long id) {
        deviceRepository.deleteById(id);
    }

    public List<Device> getDevicesWithAlarms() {
        return deviceRepository.findDevicesWithAlarms();
    }

    public Map<String, Object> getDeviceStats() {
        long total = deviceRepository.count();
        Long onlineCount = deviceRepository.countOnlineDevices();
        Long alarmCount = deviceRepository.countAlarmDevices();
        return Map.of(
                "total", total,
                "online", onlineCount != null ? onlineCount : 0,
                "offline", total - (onlineCount != null ? onlineCount : 0),
                "alarm", alarmCount != null ? alarmCount : 0
        );
    }

    public List<DeviceHistory> getDeviceHistory(String deviceCode, int limit) {
        return deviceHistoryRepository.findLatestByDeviceCode(deviceCode, limit);
    }

    public List<DeviceHistory> getDeviceHistoryByTimeRange(String deviceCode, LocalDateTime startTime, LocalDateTime endTime) {
        return deviceHistoryRepository.findByDeviceCodeAndTimeRange(deviceCode, startTime, endTime);
    }

    public void simulateDeviceStatus() {
        List<Device> devices = deviceRepository.findAll();
        for (Device device : devices) {
            DeviceStatusMessage message = new DeviceStatusMessage();
            message.setDeviceCode(device.getDeviceCode());
            message.setDeviceName(device.getDeviceName());
            message.setStatus("ONLINE");
            message.setTemperature(20 + random.nextDouble() * 60);
            message.setHumidity(30 + random.nextDouble() * 50);
            message.setPressure(0.8 + random.nextDouble() * 0.4);
            message.setVibration(random.nextDouble() * 5);
            message.setRpm(1000 + random.nextDouble() * 2000);
            message.setPowerConsumption(50 + random.nextDouble() * 100);
            message.setEfficiency(70 + random.nextDouble() * 30);
            message.setTimestamp(LocalDateTime.now());

            if (message.getTemperature() > 70) {
                message.setAlarmLevel("CRITICAL");
                message.setAlarmMessage("设备温度过高: " + String.format("%.1f", message.getTemperature()) + "°C");
            } else if (message.getTemperature() > 60) {
                message.setAlarmLevel("WARNING");
                message.setAlarmMessage("设备温度偏高: " + String.format("%.1f", message.getTemperature()) + "°C");
            } else if (message.getVibration() > 4) {
                message.setAlarmLevel("WARNING");
                message.setAlarmMessage("设备振动异常: " + String.format("%.2f", message.getVibration()) + "mm/s");
            } else {
                message.setAlarmLevel("NORMAL");
                message.setAlarmMessage("");
            }

            deviceStatusProducer.sendDeviceStatus(message);
        }
    }
}
