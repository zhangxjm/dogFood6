package com.digitaltwin.mq;

import com.digitaltwin.dto.DeviceStatusMessage;
import com.digitaltwin.entity.Alarm;
import com.digitaltwin.entity.Device;
import com.digitaltwin.entity.DeviceHistory;
import com.digitaltwin.repository.AlarmRepository;
import com.digitaltwin.repository.DeviceHistoryRepository;
import com.digitaltwin.repository.DeviceRepository;
import com.digitaltwin.service.TwinWebSocketService;
import com.google.gson.Gson;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RocketMQMessageListener(
        topic = "${digitaltwin.mq.topic.device-status}",
        consumerGroup = "device-status-consumer"
)
public class DeviceStatusConsumer implements RocketMQListener<String> {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private DeviceHistoryRepository deviceHistoryRepository;

    @Autowired
    private AlarmRepository alarmRepository;

    @Autowired
    private TwinWebSocketService twinWebSocketService;

    @Autowired
    private Gson gson;

    @Override
    public void onMessage(String message) {
        try {
            DeviceStatusMessage statusMessage = gson.fromJson(message, DeviceStatusMessage.class);
            processStatusMessage(statusMessage);
        } catch (Exception e) {
            System.err.println("Failed to process device status message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void processStatusMessage(DeviceStatusMessage statusMessage) {
        Device device = deviceRepository.findByDeviceCode(statusMessage.getDeviceCode())
                .orElse(null);

        if (device == null) {
            return;
        }

        device.setTemperature(statusMessage.getTemperature());
        device.setHumidity(statusMessage.getHumidity());
        device.setPressure(statusMessage.getPressure());
        device.setVibration(statusMessage.getVibration());
        device.setRpm(statusMessage.getRpm());
        device.setPowerConsumption(statusMessage.getPowerConsumption());
        device.setEfficiency(statusMessage.getEfficiency());
        device.setStatus(statusMessage.getStatus());
        device.setAlarmLevel(statusMessage.getAlarmLevel());
        device.setAlarmMessage(statusMessage.getAlarmMessage());
        device.setLastUpdateTime(LocalDateTime.now());
        deviceRepository.save(device);

        DeviceHistory history = new DeviceHistory();
        history.setDeviceCode(statusMessage.getDeviceCode());
        history.setTemperature(statusMessage.getTemperature());
        history.setHumidity(statusMessage.getHumidity());
        history.setPressure(statusMessage.getPressure());
        history.setVibration(statusMessage.getVibration());
        history.setRpm(statusMessage.getRpm());
        history.setPowerConsumption(statusMessage.getPowerConsumption());
        history.setEfficiency(statusMessage.getEfficiency());
        history.setAlarmLevel(statusMessage.getAlarmLevel());
        history.setAlarmMessage(statusMessage.getAlarmMessage());
        deviceHistoryRepository.save(history);

        if (!"NORMAL".equals(statusMessage.getAlarmLevel())) {
            Alarm alarm = new Alarm();
            alarm.setDeviceCode(statusMessage.getDeviceCode());
            alarm.setDeviceName(device.getDeviceName());
            alarm.setAlarmLevel(statusMessage.getAlarmLevel());
            alarm.setAlarmType("设备异常");
            alarm.setAlarmMessage(statusMessage.getAlarmMessage());
            alarm.setStatus("ACTIVE");
            alarmRepository.save(alarm);
        }

        twinWebSocketService.broadcastDeviceStatus(statusMessage);
    }
}
