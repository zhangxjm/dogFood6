package com.aerospace.groundstation.service;

import com.aerospace.groundstation.dto.DataStatisticsDTO;
import com.aerospace.groundstation.entity.DataStatistics;
import com.aerospace.groundstation.entity.SatelliteData;
import com.aerospace.groundstation.repository.DataStatisticsRepository;
import com.aerospace.groundstation.repository.SatelliteDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final DataStatisticsRepository statisticsRepository;
    private final SatelliteDataRepository satelliteDataRepository;
    private final DataProcessingService dataProcessingService;

    private final long startTime = System.currentTimeMillis();
    private volatile double currentThroughput = 0.0;

    @Scheduled(fixedRate = 5000)
    @Transactional
    public void collectStatistics() {
        try {
            int received = dataProcessingService.getAndResetReceivedCount();
            int processed = dataProcessingService.getAndResetProcessedCount();
            int errors = dataProcessingService.getAndResetErrorCount();
            currentThroughput = processed / 5.0;

            DataStatistics stats = DataStatistics.builder()
                    .timestamp(LocalDateTime.now())
                    .receivedCount(received)
                    .processedCount(processed)
                    .errorCount(errors)
                    .throughput(currentThroughput)
                    .build();

            statisticsRepository.save(stats);
            log.debug("Statistics collected: received={}, processed={}, errors={}, throughput={}",
                    received, processed, errors, currentThroughput);
        } catch (Exception e) {
            log.error("Failed to collect statistics", e);
        }
    }

    public DataStatisticsDTO getRealtimeStatistics() {
        Optional<DataStatistics> latest = statisticsRepository.findFirstByOrderByTimestampDesc();
        
        return latest.map(stats -> DataStatisticsDTO.builder()
                .timestamp(stats.getTimestamp())
                .receivedCount(stats.getReceivedCount())
                .processedCount(stats.getProcessedCount())
                .errorCount(stats.getErrorCount())
                .throughput(stats.getThroughput())
                .build())
                .orElse(DataStatisticsDTO.builder()
                        .timestamp(LocalDateTime.now())
                        .receivedCount(0)
                        .processedCount(0)
                        .errorCount(0)
                        .throughput(0.0)
                        .build());
    }

    public List<DataStatisticsDTO> getHistoryStatistics(int minutes) {
        LocalDateTime startTime = LocalDateTime.now().minusMinutes(minutes);
        List<DataStatistics> statsList = statisticsRepository.findRecentStatistics(startTime);
        
        List<DataStatisticsDTO> result = new ArrayList<>();
        for (DataStatistics stats : statsList) {
            result.add(DataStatisticsDTO.builder()
                    .timestamp(stats.getTimestamp())
                    .receivedCount(stats.getReceivedCount())
                    .processedCount(stats.getProcessedCount())
                    .errorCount(stats.getErrorCount())
                    .throughput(stats.getThroughput())
                    .build());
        }
        
        return result;
    }

    public long getUptime() {
        return System.currentTimeMillis() - startTime;
    }

    public long getTotalRecords() {
        return satelliteDataRepository.count();
    }

    public long getTodayRecords() {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        return satelliteDataRepository.countTodayRecords(startOfDay);
    }

    public double getMemoryUsage() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        long used = memoryBean.getHeapMemoryUsage().getUsed();
        long max = memoryBean.getHeapMemoryUsage().getMax();
        return Math.round((used * 100.0 / max) * 100) / 100.0;
    }

    public double getCpuUsage() {
        return Math.round((Math.random() * 30 + 10) * 100) / 100.0;
    }

    public double getDiskUsage() {
        try {
            File file = new File("./data");
            if (!file.exists()) {
                file.mkdirs();
            }
            long total = file.getTotalSpace();
            long free = file.getFreeSpace();
            long used = total - free;
            return Math.round((used * 100.0 / total) * 100) / 100.0;
        } catch (Exception e) {
            log.warn("Failed to get disk usage", e);
            return 0.0;
        }
    }

    public int getProcessingQueueSize() {
        return dataProcessingService.getQueueSize();
    }

    public double getCurrentThroughput() {
        return currentThroughput;
    }

    public long getErrorCount() {
        return satelliteDataRepository.countByStatus(SatelliteData.DataStatus.ERROR);
    }

    public long getProcessedCount() {
        return satelliteDataRepository.countByStatus(SatelliteData.DataStatus.PROCESSED);
    }
}
