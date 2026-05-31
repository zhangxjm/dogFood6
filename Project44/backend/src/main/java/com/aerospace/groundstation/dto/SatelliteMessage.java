package com.aerospace.groundstation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SatelliteMessage {

    private String satelliteId;
    private String satelliteName;
    private String dataType;
    private String rawData;
    private String dataFormat;
    private LocalDateTime timestamp;
    private String checksum;
    private Integer dataSize;
}
