package com.energy.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "loss_analysis")
public class LossAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long equipmentId;

    private String equipmentCode;

    private String lossType;

    @Column(length = 2000)
    private String description;

    private Double lossValue;

    private Double lossPercentage;

    private Double cost;

    @Column(length = 2000)
    private String reason;

    @Column(length = 2000)
    private String suggestion;

    private String severity;

    private LocalDateTime analysisTime;

    private LocalDateTime createTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
    }
}
