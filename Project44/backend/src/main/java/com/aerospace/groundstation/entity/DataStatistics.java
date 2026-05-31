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
@Table(name = "data_statistics")
public class DataStatistics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "received_count", nullable = false)
    private Integer receivedCount;

    @Column(name = "processed_count", nullable = false)
    private Integer processedCount;

    @Column(name = "error_count", nullable = false)
    private Integer errorCount;

    @Column(name = "throughput", nullable = false)
    private Double throughput;
}
