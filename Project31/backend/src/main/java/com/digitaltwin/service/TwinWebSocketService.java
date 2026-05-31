package com.digitaltwin.service;

import com.digitaltwin.dto.DeviceStatusMessage;
import com.digitaltwin.entity.DeviceCommand;
import com.google.gson.Gson;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class TwinWebSocketService {

    private final List<DeviceWebSocketHandler> handlers = new CopyOnWriteArrayList<>();

    @Autowired
    private Gson gson;

    public void addHandler(DeviceWebSocketHandler handler) {
        handlers.add(handler);
    }

    public void removeHandler(DeviceWebSocketHandler handler) {
        handlers.remove(handler);
    }

    public void broadcastDeviceStatus(DeviceStatusMessage message) {
        String json = gson.toJson(message);
        for (DeviceWebSocketHandler handler : handlers) {
            try {
                handler.sendMessage("STATUS:" + json);
            } catch (Exception e) {
                handlers.remove(handler);
            }
        }
    }

    public void broadcastCommandResult(DeviceCommand command) {
        String json = gson.toJson(command);
        for (DeviceWebSocketHandler handler : handlers) {
            try {
                handler.sendMessage("COMMAND:" + json);
            } catch (Exception e) {
                handlers.remove(handler);
            }
        }
    }

    public void broadcastAlarmNotification(String message) {
        for (DeviceWebSocketHandler handler : handlers) {
            try {
                handler.sendMessage("ALARM:" + message);
            } catch (Exception e) {
                handlers.remove(handler);
            }
        }
    }
}
