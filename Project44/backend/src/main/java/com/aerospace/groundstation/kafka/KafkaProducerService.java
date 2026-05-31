package com.aerospace.groundstation.kafka;

import com.aerospace.groundstation.dto.SatelliteMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    private final KafkaTemplate<String, byte[]> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.kafka.topic:satellite-data}")
    private String topic;

    public void send(SatelliteMessage message) {
        try {
            String json = objectMapper.writeValueAsString(message);
            byte[] payload = json.getBytes(StandardCharsets.UTF_8);
            CompletableFuture<SendResult<String, byte[]>> future =
                    kafkaTemplate.send(topic, message.getSatelliteId(), payload);

            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.trace("Message sent to topic={}, partition={}, offset={}",
                            topic,
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset());
                } else {
                    log.error("Failed to send message to topic={}", topic, ex);
                }
            });
        } catch (Exception e) {
            log.error("Error serializing message for satellite: {}", message.getSatelliteId(), e);
        }
    }

    public void sendAsync(SatelliteMessage message) {
        send(message);
    }
}
