package com.aerospace.groundstation.kafka;

import com.aerospace.groundstation.dto.SatelliteMessage;
import com.aerospace.groundstation.service.DataProcessingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaConsumerService {

    private final ObjectMapper objectMapper;
    private final DataProcessingService dataProcessingService;

    private final BlockingQueue<ConsumerRecord<String, byte[]>> recordQueue = new ArrayBlockingQueue<>(10000);
    private final List<SatelliteMessage> batchBuffer = new ArrayList<>();
    private final Object batchLock = new Object();

    @KafkaListener(
            topics = "${app.kafka.topic:satellite-data}",
            groupId = "${spring.kafka.consumer.group-id:ground-station-group}"
    )
    public void listen(ConsumerRecord<String, byte[]> record, Acknowledgment ack) {
        try {
            String json = new String(record.value(), StandardCharsets.UTF_8);
            SatelliteMessage message = objectMapper.readValue(json, SatelliteMessage.class);
            
            synchronized (batchLock) {
                batchBuffer.add(message);
                
                if (batchBuffer.size() >= 50) {
                    processAndClearBuffer();
                }
            }
            
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process message: key={}", record.key(), e);
            ack.acknowledge();
        }
    }

    private void processAndClearBuffer() {
        if (!batchBuffer.isEmpty()) {
            try {
                dataProcessingService.processBatch(new ArrayList<>(batchBuffer));
                log.debug("Processed batch of {} records", batchBuffer.size());
            } catch (Exception e) {
                log.error("Failed to process batch", e);
            } finally {
                batchBuffer.clear();
            }
        }
    }

    public int getQueueSize() {
        return recordQueue.size();
    }
}
