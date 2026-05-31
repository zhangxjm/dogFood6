package com.eldercare.service;

import com.eldercare.dto.AlertDTO;
import com.eldercare.dto.HealthDataDTO;
import com.eldercare.entity.EmergencyCall;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketService {
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public void broadcastHealthData(HealthDataDTO data) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "HEALTH_DATA");
            message.put("data", data);
            String json = objectMapper.writeValueAsString(message);
            messagingTemplate.convertAndSend("/topic/health", json);
            log.info("Broadcast health data for elderly: {}", data.getElderlyId());
        } catch (JsonProcessingException e) {
            log.error("Error broadcasting health data", e);
        }
    }

    public void broadcastAlert(AlertDTO alert) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "ALERT");
            message.put("data", alert);
            String json = objectMapper.writeValueAsString(message);
            messagingTemplate.convertAndSend("/topic/alerts", json);
            log.info("Broadcast alert: {} for elderly: {}", alert.getAlertType(), alert.getElderlyId());
        } catch (JsonProcessingException e) {
            log.error("Error broadcasting alert", e);
        }
    }

    public void broadcastEmergencyCall(EmergencyCall call) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "EMERGENCY_CALL");
            message.put("data", call);
            String json = objectMapper.writeValueAsString(message);
            messagingTemplate.convertAndSend("/topic/emergency", json);
            log.info("Broadcast emergency call for elderly: {}", call.getElderlyId());
        } catch (JsonProcessingException e) {
            log.error("Error broadcasting emergency call", e);
        }
    }

    public void broadcastDeviceStatus(Long deviceId, String status, String batteryLevel) {
        try {
            Map<String, Object> deviceStatus = new HashMap<>();
            deviceStatus.put("deviceId", deviceId);
            deviceStatus.put("status", status);
            deviceStatus.put("batteryLevel", batteryLevel);
            
            Map<String, Object> message = new HashMap<>();
            message.put("type", "DEVICE_STATUS");
            message.put("data", deviceStatus);
            
            String json = objectMapper.writeValueAsString(message);
            messagingTemplate.convertAndSend("/topic/devices", json);
            log.info("Broadcast device status for device: {}", deviceId);
        } catch (JsonProcessingException e) {
            log.error("Error broadcasting device status", e);
        }
    }
}
