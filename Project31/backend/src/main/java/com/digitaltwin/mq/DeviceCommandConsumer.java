package com.digitaltwin.mq;

import com.digitaltwin.dto.DeviceCommandRequest;
import com.digitaltwin.entity.DeviceCommand;
import com.digitaltwin.repository.DeviceCommandRepository;
import com.digitaltwin.service.TwinWebSocketService;
import com.google.gson.Gson;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RocketMQMessageListener(
        topic = "${digitaltwin.mq.topic.device-command}",
        consumerGroup = "device-command-consumer"
)
public class DeviceCommandConsumer implements RocketMQListener<String> {

    @Autowired
    private DeviceCommandRepository deviceCommandRepository;

    @Autowired
    private TwinWebSocketService twinWebSocketService;

    @Autowired
    private Gson gson;

    @Override
    public void onMessage(String message) {
        try {
            DeviceCommandRequest commandRequest = gson.fromJson(message, DeviceCommandRequest.class);
            processCommand(commandRequest);
        } catch (Exception e) {
            System.err.println("Failed to process device command: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void processCommand(DeviceCommandRequest commandRequest) {
        DeviceCommand command = new DeviceCommand();
        command.setDeviceCode(commandRequest.getDeviceCode());
        command.setCommandType(commandRequest.getCommandType());
        command.setCommandData(commandRequest.getCommandData());
        command.setOperator(commandRequest.getOperator());
        command.setStatus("EXECUTING");
        command.setExecuteTime(LocalDateTime.now());
        deviceCommandRepository.save(command);

        String result = executeCommand(command);
        command.setStatus("COMPLETED");
        command.setResult(result);
        deviceCommandRepository.save(command);

        twinWebSocketService.broadcastCommandResult(command);
    }

    private String executeCommand(DeviceCommand command) {
        try {
            Thread.sleep(500);
            return "命令执行成功 - " + command.getCommandType();
        } catch (InterruptedException e) {
            return "命令执行失败: " + e.getMessage();
        }
    }
}
