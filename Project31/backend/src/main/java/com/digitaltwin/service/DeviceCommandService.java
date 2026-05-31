package com.digitaltwin.service;

import com.digitaltwin.dto.DeviceCommandRequest;
import com.digitaltwin.entity.DeviceCommand;
import com.digitaltwin.repository.DeviceCommandRepository;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DeviceCommandService {

    @Autowired
    private DeviceCommandRepository deviceCommandRepository;

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    @Value("${digitaltwin.mq.topic.device-command}")
    private String deviceCommandTopic;

    @Autowired
    private Gson gson;

    public List<DeviceCommand> getAllCommands() {
        return deviceCommandRepository.findAll();
    }

    public List<DeviceCommand> getCommandsByDevice(String deviceCode) {
        return deviceCommandRepository.findByDeviceCodeOrderByCreateTimeDesc(deviceCode);
    }

    public List<DeviceCommand> getCommandsByStatus(String status) {
        return deviceCommandRepository.findByStatus(status);
    }

    public DeviceCommand sendCommand(DeviceCommandRequest request) {
        DeviceCommand command = new DeviceCommand();
        command.setDeviceCode(request.getDeviceCode());
        command.setCommandType(request.getCommandType());
        command.setCommandData(request.getCommandData());
        command.setOperator(request.getOperator());
        command.setStatus("PENDING");
        command.setCreateTime(LocalDateTime.now());

        DeviceCommand saved = deviceCommandRepository.save(command);

        try {
            String json = gson.toJson(request);
            Message<String> message = MessageBuilder.withPayload(json).build();
            rocketMQTemplate.send(deviceCommandTopic, message);
        } catch (Exception e) {
            command.setStatus("FAILED");
            command.setResult("命令发送失败: " + e.getMessage());
            deviceCommandRepository.save(command);
        }

        return saved;
    }
}
