package com.aerospace.groundstation.service;

import com.aerospace.groundstation.entity.SatelliteData;
import com.aerospace.groundstation.repository.SatelliteDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BatchStorageService {

    private final SatelliteDataRepository satelliteDataRepository;

    @Transactional
    public void saveBatch(List<SatelliteData> batch) {
        try {
            satelliteDataRepository.saveAll(batch);
            log.debug("Successfully saved batch of {} records", batch.size());
        } catch (Exception e) {
            log.error("Failed to save batch of {} records", batch.size(), e);
            saveOneByOne(batch);
        }
    }

    @Transactional
    public void saveOneByOne(List<SatelliteData> batch) {
        int successCount = 0;
        int failCount = 0;

        for (SatelliteData data : batch) {
            try {
                satelliteDataRepository.save(data);
                successCount++;
            } catch (Exception e) {
                failCount++;
                log.error("Failed to save record id={}, satellite={}", 
                        data.getId(), data.getSatelliteId(), e);
            }
        }

        log.info("Fallback save completed: success={}, failed={}", successCount, failCount);
    }
}
