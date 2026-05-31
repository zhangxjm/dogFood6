package com.aerospace.groundstation.service;

import com.aerospace.groundstation.dto.SatelliteMessage;
import com.aerospace.groundstation.entity.SatelliteData;
import com.aerospace.groundstation.parser.DataParser;
import com.aerospace.groundstation.parser.ParserFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataProcessingService {

    private final ParserFactory parserFactory;
    private final BatchStorageService batchStorageService;
    private final ObjectMapper objectMapper;

    @Value("${app.batch.size:200}")
    private int batchSize;

    @Value("${app.batch.timeout-ms:5000}")
    private long batchTimeoutMs;

    private final ConcurrentLinkedQueue<SatelliteData> processingQueue = new ConcurrentLinkedQueue<>();
    private final ReentrantLock batchLock = new ReentrantLock();
    private volatile long lastFlushTime = System.currentTimeMillis();
    private final AtomicInteger receivedCount = new AtomicInteger(0);
    private final AtomicInteger processedCount = new AtomicInteger(0);
    private final AtomicInteger errorCount = new AtomicInteger(0);

    public void processBatch(List<SatelliteMessage> messages) {
        receivedCount.addAndGet(messages.size());
        
        for (SatelliteMessage message : messages) {
            try {
                SatelliteData data = processMessage(message);
                processingQueue.offer(data);
                processedCount.incrementAndGet();
            } catch (Exception e) {
                errorCount.incrementAndGet();
                log.error("Error processing message from satellite: {}", message.getSatelliteId(), e);
                
                SatelliteData errorData = createErrorData(message, e.getMessage());
                processingQueue.offer(errorData);
            }
        }

        checkAndFlush();
    }

    private SatelliteData processMessage(SatelliteMessage message) throws Exception {
        DataParser parser = parserFactory.getParser(message.getDataFormat());
        
        boolean valid = parser.validate(message);
        
        Map<String, Object> parsedData = parser.parse(message);
        String parsedJson = objectMapper.writeValueAsString(parsedData);

        return SatelliteData.builder()
                .satelliteId(message.getSatelliteId())
                .satelliteName(message.getSatelliteName())
                .dataType(message.getDataType())
                .rawData(message.getRawData())
                .parsedData(parsedJson)
                .receivedTime(message.getTimestamp())
                .processedTime(LocalDateTime.now())
                .dataSize(message.getDataSize())
                .checksum(message.getChecksum())
                .status(valid ? SatelliteData.DataStatus.PROCESSED : SatelliteData.DataStatus.ERROR)
                .errorMessage(valid ? null : "Checksum validation failed")
                .build();
    }

    private SatelliteData createErrorData(SatelliteMessage message, String error) {
        return SatelliteData.builder()
                .satelliteId(message.getSatelliteId())
                .satelliteName(message.getSatelliteName())
                .dataType(message.getDataType())
                .rawData(message.getRawData())
                .receivedTime(message.getTimestamp())
                .processedTime(LocalDateTime.now())
                .dataSize(message.getDataSize() != null ? message.getDataSize() : 0)
                .checksum(message.getChecksum())
                .status(SatelliteData.DataStatus.ERROR)
                .errorMessage(error)
                .build();
    }

    private void checkAndFlush() {
        if (processingQueue.size() >= batchSize ||
            (System.currentTimeMillis() - lastFlushTime) >= batchTimeoutMs) {
            flushBatch();
        }
    }

    @Scheduled(fixedDelayString = "${app.batch.timeout-ms:5000}")
    public void scheduledFlush() {
        if (!processingQueue.isEmpty()) {
            flushBatch();
        }
    }

    private void flushBatch() {
        if (batchLock.tryLock()) {
            try {
                List<SatelliteData> batch = new ArrayList<>();
                SatelliteData data;
                while ((data = processingQueue.poll()) != null && batch.size() < batchSize) {
                    batch.add(data);
                }

                if (!batch.isEmpty()) {
                    batchStorageService.saveBatch(batch);
                    lastFlushTime = System.currentTimeMillis();
                    log.debug("Flushed batch of {} records", batch.size());
                }
            } finally {
                batchLock.unlock();
            }
        }
    }

    public int getQueueSize() {
        return processingQueue.size();
    }

    public int getAndResetReceivedCount() {
        return receivedCount.getAndSet(0);
    }

    public int getAndResetProcessedCount() {
        return processedCount.getAndSet(0);
    }

    public int getAndResetErrorCount() {
        return errorCount.getAndSet(0);
    }
}
