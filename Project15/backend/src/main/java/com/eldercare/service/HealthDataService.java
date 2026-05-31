package com.eldercare.service;

import com.eldercare.dto.ElderlyDTO;
import com.eldercare.dto.HealthDataDTO;
import com.eldercare.entity.Elderly;
import com.eldercare.entity.HealthData;
import com.eldercare.repository.ElderlyRepository;
import com.eldercare.repository.HealthDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HealthDataService {
    private final HealthDataRepository healthDataRepository;
    private final ElderlyRepository elderlyRepository;
    private final DataDesensitizationService desensitizationService;

    public List<HealthDataDTO> listByElderly(Long elderlyId) {
        return healthDataRepository.findByElderlyIdOrderByDataTimeDesc(elderlyId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<HealthDataDTO> listByElderlyAndTimeRange(Long elderlyId, LocalDateTime startTime, LocalDateTime endTime) {
        return healthDataRepository.findByElderlyIdAndDataTimeBetween(elderlyId, startTime, endTime).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public HealthDataDTO getLatestByElderly(Long elderlyId) {
        HealthData data = healthDataRepository.findTopByElderlyIdOrderByDataTimeDesc(elderlyId);
        return data != null ? convertToDTO(data) : null;
    }

    public HealthDataDTO save(HealthDataDTO dto) {
        HealthData data = new HealthData();
        BeanUtils.copyProperties(dto, data);
        HealthData saved = healthDataRepository.save(data);
        return convertToDTO(saved);
    }

    private HealthDataDTO convertToDTO(HealthData data) {
        HealthDataDTO dto = new HealthDataDTO();
        BeanUtils.copyProperties(data, dto);
        elderlyRepository.findById(data.getElderlyId())
                .ifPresent(e -> dto.setElderlyName(e.getName()));
        return desensitizationService.desensitizeHealthData(dto);
    }
}
