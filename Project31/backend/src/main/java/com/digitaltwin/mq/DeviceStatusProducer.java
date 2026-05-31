package com.digitaltwin.mq;

import com.digitaltwin.dto.DeviceStatusMessage;
import com.google.gson.Gson;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

@Component
public class DeviceStatusProducer {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    @Autowired
    private Gson gson;

    @Value("${digitaltwin.mq.topic.device-status}")
    private String deviceStatusTopic;

    @Value("${digitaltwin.mq.topic.device-alarm}")
    private String deviceAlarmTopic;

    public void sendDeviceStatus(DeviceStatusMessage message) {
        try {
            String json = gson.toJson(message);
            Message<String> mqMessage = MessageBuilder.withPayload(json).build();
            rocketMQTemplate.send(deviceStatusTopic, mqMessage);
        } catch (Exception e) {
            System.err.println("Failed to send device status message: " + e.getMessage());
        }
    }

    public void sendDeviceAlarm(DeviceStatusMessage message) {
        try {
            String json = gson.toJson(message);
            Message<String> mqMessage = MessageBuilder.withPayload(json).build();
            rocketMQTemplate.send(deviceAlarmTopic, mqMessage);
        } catch (Exception e) {
            System.err.println("Failed to send device alarm message: " + e.getMessage());
        }
    }
}
