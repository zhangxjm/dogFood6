package com.energy.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "energy_saving_plan")
public class EnergySavingPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long equipmentId;

    private String equipmentCode;

    @Column(length = 500)
    private String planName;

    @Column(length = 2000)
    private String description;

    @Column(length = 2000)
    private String measures;

    private Double expectedSaving;

    private Double expectedCost;

    private Integer paybackPeriod;

    private String priority;

    private String status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
}
