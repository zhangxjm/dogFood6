package com.aerospace.groundstation.simulator;

import com.aerospace.groundstation.dto.SatelliteMessage;
import com.aerospace.groundstation.entity.SatelliteInfo;
import com.aerospace.groundstation.kafka.KafkaProducerService;
import com.aerospace.groundstation.repository.SatelliteInfoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataSimulatorService {

    private final KafkaProducerService kafkaProducerService;
    private final SatelliteInfoRepository satelliteInfoRepository;
    private final ObjectMapper objectMapper;
    private final ThreadPoolTaskScheduler taskScheduler;

    @Value("${app.simulator.interval-ms:100}")
    private int intervalMs;

    @Value("${app.simulator.enabled:true}")
    private boolean autoStart;

    private final AtomicBoolean running = new AtomicBoolean(false);
    private ScheduledFuture<?> scheduledTask;
    private final Random random = new Random();
    private List<SatelliteInfo> satellites;

    private final String[] dataTypes = {
            "TELEMETRY", "COMMAND", "IMAGE", "SENSOR", "POSITION", "STATUS"
    };

    private static final List<SatelliteInfo> DEFAULT_SATELLITES = Arrays.asList(
            SatelliteInfo.builder()
                    .satelliteId("SAT-001")
                    .satelliteName("天宫一号")
                    .dataFormat("JSON")
                    .enabled(true)
                    .build(),
            SatelliteInfo.builder()
                    .satelliteId("SAT-002")
                    .satelliteName("神舟十五号")
                    .dataFormat("JSON")
                    .enabled(true)
                    .build(),
            SatelliteInfo.builder()
                    .satelliteId("SAT-003")
                    .satelliteName("北斗三号G1")
                    .dataFormat("HEX")
                    .enabled(true)
                    .build(),
            SatelliteInfo.builder()
                    .satelliteId("SAT-004")
                    .satelliteName("风云四号A")
                    .dataFormat("CSV")
                    .enabled(true)
                    .build(),
            SatelliteInfo.builder()
                    .satelliteId("SAT-005")
                    .satelliteName("高分七号")
                    .dataFormat("JSON")
                    .enabled(true)
                    .build()
    );

    private void ensureSatellitesInitialized() {
        satellites = satelliteInfoRepository.findByEnabledTrue();
        if (satellites.isEmpty()) {
            log.warn("No satellites found in database, initializing default satellites...");
            for (SatelliteInfo satellite : DEFAULT_SATELLITES) {
                try {
                    satelliteInfoRepository.save(satellite);
                    log.info("Initialized satellite: {} - {}", 
                            satellite.getSatelliteId(), 
                            satellite.getSatelliteName());
                } catch (Exception e) {
                    log.warn("Failed to save satellite {}: {}", 
                            satellite.getSatelliteId(), e.getMessage());
                }
            }
            satellites = satelliteInfoRepository.findByEnabledTrue();
        }
        log.info("Simulator initialized with {} satellites", satellites.size());
    }

    public void start() {
        if (running.compareAndSet(false, true)) {
            ensureSatellitesInitialized();
            if (satellites.isEmpty()) {
                log.error("No satellites configured, cannot start simulator");
                running.set(false);
                return;
            }

            scheduledTask = taskScheduler.scheduleAtFixedRate(this::generateAndSend, intervalMs);
            log.info("Data simulator started with {} satellites, interval={}ms", 
                    satellites.size(), intervalMs);
        } else {
            log.info("Data simulator is already running");
        }
    }

    public void stop() {
        if (running.compareAndSet(true, false)) {
            if (scheduledTask != null && !scheduledTask.isCancelled()) {
                scheduledTask.cancel(false);
            }
            log.info("Data simulator stopped");
        } else {
            log.info("Data simulator is not running");
        }
    }

    public boolean isRunning() {
        return running.get();
    }

    private void generateAndSend() {
        try {
            SatelliteInfo satellite = satellites.get(random.nextInt(satellites.size()));
            SatelliteMessage message = generateMessage(satellite);
            kafkaProducerService.send(message);
        } catch (Exception e) {
            log.error("Error generating simulated data", e);
        }
    }

    private SatelliteMessage generateMessage(SatelliteInfo satellite) throws Exception {
        String format = satellite.getDataFormat();
        String rawData = generateRawData(format);
        String checksum = calculateChecksum(rawData);
        String dataType = dataTypes[random.nextInt(dataTypes.length)];

        return SatelliteMessage.builder()
                .satelliteId(satellite.getSatelliteId())
                .satelliteName(satellite.getSatelliteName())
                .dataType(dataType)
                .rawData(rawData)
                .dataFormat(format)
                .timestamp(LocalDateTime.now())
                .checksum(checksum)
                .dataSize(rawData.length())
                .build();
    }

    private String generateRawData(String format) throws Exception {
        return switch (format.toUpperCase()) {
            case "JSON" -> generateJsonData();
            case "HEX" -> generateHexData();
            case "CSV" -> generateCsvData();
            default -> generateJsonData();
        };
    }

    private String generateJsonData() throws Exception {
        Map<String, Object> data = new LinkedHashMap<>();
        
        data.put("timestamp", System.currentTimeMillis());
        data.put("sequence", random.nextLong(1000000));
        data.put("altitude", 200 + random.nextDouble() * 500);
        data.put("velocity", 7.5 + random.nextDouble() * 0.5);
        data.put("temperature", -50 + random.nextDouble() * 100);
        data.put("battery", 70 + random.nextDouble() * 30);
        data.put("signalStrength", 80 + random.nextDouble() * 20);
        
        Map<String, Object> position = new LinkedHashMap<>();
        position.put("latitude", -90 + random.nextDouble() * 180);
        position.put("longitude", -180 + random.nextDouble() * 360);
        position.put("altitude", 300 + random.nextDouble() * 100);
        data.put("position", position);

        Map<String, Object> sensors = new LinkedHashMap<>();
        sensors.put("gyroX", random.nextGaussian() * 0.1);
        sensors.put("gyroY", random.nextGaussian() * 0.1);
        sensors.put("gyroZ", random.nextGaussian() * 0.1);
        sensors.put("accelX", random.nextGaussian() * 0.5);
        sensors.put("accelY", random.nextGaussian() * 0.5);
        sensors.put("accelZ", 9.8 + random.nextGaussian() * 0.2);
        data.put("sensors", sensors);

        data.put("status", random.nextInt(10) > 0 ? "NOMINAL" : "WARNING");

        return objectMapper.writeValueAsString(data);
    }

    private String generateHexData() {
        int length = 64 + random.nextInt(128);
        StringBuilder sb = new StringBuilder();
        
        sb.append("AA55");
        sb.append(String.format("%04X", length));
        
        for (int i = 0; i < length; i++) {
            sb.append(String.format("%02X", random.nextInt(256)));
        }
        
        int checksum = 0;
        for (int i = 0; i < sb.length(); i += 2) {
            checksum += Integer.parseInt(sb.substring(i, i + 2), 16);
        }
        sb.append(String.format("%04X", checksum & 0xFFFF));
        
        return sb.toString();
    }

    private String generateCsvData() {
        StringBuilder sb = new StringBuilder();
        
        sb.append("timestamp,parameter,value,unit,status\n");
        
        int rows = 5 + random.nextInt(10);
        long baseTime = System.currentTimeMillis();
        
        String[] parameters = {"temperature", "pressure", "voltage", "current", "humidity", "radiation"};
        String[] units = {"C", "kPa", "V", "A", "%", "uSv/h"};
        
        for (int i = 0; i < rows; i++) {
            int idx = random.nextInt(parameters.length);
            sb.append(baseTime + i * 1000).append(",");
            sb.append(parameters[idx]).append(",");
            sb.append(String.format("%.4f", random.nextDouble() * 100)).append(",");
            sb.append(units[idx]).append(",");
            sb.append(random.nextInt(20) > 0 ? "OK" : "ALARM").append("\n");
        }
        
        return sb.toString();
    }

    private String calculateChecksum(String data) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("MD5");
        byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
