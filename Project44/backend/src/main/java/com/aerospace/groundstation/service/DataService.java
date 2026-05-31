package com.aerospace.groundstation.service;

import com.aerospace.groundstation.dto.PageResult;
import com.aerospace.groundstation.dto.SatelliteDataDTO;
import com.aerospace.groundstation.entity.SatelliteData;
import com.aerospace.groundstation.repository.SatelliteDataRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataService {

    private final SatelliteDataRepository satelliteDataRepository;
    private final ObjectMapper objectMapper;

    public List<SatelliteDataDTO> getLatestData(int limit) {
        List<SatelliteData> dataList = satelliteDataRepository.findTop10ByOrderByReceivedTimeDesc();
        List<SatelliteDataDTO> result = new ArrayList<>();
        for (SatelliteData data : dataList) {
            result.add(convertToDTO(data));
        }
        return result;
    }

    public PageResult<SatelliteDataDTO> getData(
            int page, int size, String satelliteId, String dataType,
            String status, String startTime, String endTime) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "receivedTime"));

        SatelliteData.DataStatus dataStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                dataStatus = SatelliteData.DataStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status value: {}", status);
            }
        }

        LocalDateTime start = null;
        LocalDateTime end = null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        if (startTime != null && !startTime.isEmpty()) {
            try {
                start = LocalDateTime.parse(startTime, formatter);
            } catch (Exception e) {
                log.warn("Invalid startTime format: {}", startTime);
            }
        }
        
        if (endTime != null && !endTime.isEmpty()) {
            try {
                end = LocalDateTime.parse(endTime, formatter);
            } catch (Exception e) {
                log.warn("Invalid endTime format: {}", endTime);
            }
        }

        Page<SatelliteData> dataPage = satelliteDataRepository.findByFilters(
                (satelliteId != null && !satelliteId.isEmpty()) ? satelliteId : null,
                (dataType != null && !dataType.isEmpty()) ? dataType : null,
                dataStatus,
                start,
                end,
                pageable
        );

        List<SatelliteDataDTO> content = new ArrayList<>();
        for (SatelliteData data : dataPage.getContent()) {
            content.add(convertToDTO(data));
        }

        return PageResult.<SatelliteDataDTO>builder()
                .content(content)
                .totalElements(dataPage.getTotalElements())
                .totalPages(dataPage.getTotalPages())
                .pageNumber(page)
                .pageSize(size)
                .build();
    }

    public SatelliteDataDTO getDataById(Long id) {
        Optional<SatelliteData> dataOpt = satelliteDataRepository.findById(id);
        return dataOpt.map(this::convertToDTO).orElse(null);
    }

    private SatelliteDataDTO convertToDTO(SatelliteData data) {
        Map<String, Object> parsedData = null;
        if (data.getParsedData() != null && !data.getParsedData().isEmpty()) {
            try {
                parsedData = objectMapper.readValue(data.getParsedData(), 
                        new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                log.warn("Failed to parse JSON data for id={}", data.getId());
            }
        }

        return SatelliteDataDTO.builder()
                .id(data.getId())
                .satelliteId(data.getSatelliteId())
                .satelliteName(data.getSatelliteName())
                .dataType(data.getDataType())
                .rawData(data.getRawData())
                .parsedData(parsedData)
                .receivedTime(data.getReceivedTime())
                .processedTime(data.getProcessedTime())
                .dataSize(data.getDataSize())
                .checksum(data.getChecksum())
                .status(data.getStatus())
                .errorMessage(data.getErrorMessage())
                .build();
    }
}
