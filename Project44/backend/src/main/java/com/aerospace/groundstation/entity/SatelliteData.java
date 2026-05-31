package com.aerospace.groundstation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "satellite_data")
public class SatelliteData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "satellite_id", nullable = false, length = 64)
    private String satelliteId;

    @Column(name = "satellite_name", nullable = false, length = 128)
    private String satelliteName;

    @Column(name = "data_type", nullable = false, length = 64)
    private String dataType;

    @Column(name = "raw_data", nullable = false, columnDefinition = "TEXT")
    private String rawData;

    @Column(name = "parsed_data", columnDefinition = "TEXT")
    private String parsedData;

    @Column(name = "received_time", nullable = false)
    private LocalDateTime receivedTime;

    @Column(name = "processed_time")
    private LocalDateTime processedTime;

    @Column(name = "data_size", nullable = false)
    private Integer dataSize;

    @Column(name = "checksum", length = 64)
    private String checksum;

    @Column(name = "status", nullable = false, length = 32)
    @Enumerated(EnumType.STRING)
    private DataStatus status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    public enum DataStatus {
        RECEIVED, PROCESSED, ERROR
    }
}
