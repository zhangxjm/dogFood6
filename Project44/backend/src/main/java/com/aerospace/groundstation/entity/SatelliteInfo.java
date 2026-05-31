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
@Table(name = "satellite_info")
public class SatelliteInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "satellite_id", nullable = false, unique = true, length = 64)
    private String satelliteId;

    @Column(name = "satellite_name", nullable = false, length = 128)
    private String satelliteName;

    @Column(name = "data_format", nullable = false, length = 32)
    private String dataFormat;

    @Column(name = "parser_config", columnDefinition = "TEXT")
    private String parserConfig;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (enabled == null) {
            enabled = true;
        }
        if (dataFormat == null) {
            dataFormat = "JSON";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
