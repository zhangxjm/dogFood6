package com.aerospace.groundstation.dto;

import com.aerospace.groundstation.entity.SatelliteData;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SatelliteDataDTO {

    private Long id;
    private String satelliteId;
    private String satelliteName;
    private String dataType;
    private String rawData;
    private Map<String, Object> parsedData;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss.SSS")
    private LocalDateTime receivedTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss.SSS")
    private LocalDateTime processedTime;

    private Integer dataSize;
    private String checksum;
    private SatelliteData.DataStatus status;
    private String errorMessage;
}
