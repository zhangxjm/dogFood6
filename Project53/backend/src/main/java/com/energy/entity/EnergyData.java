package com.energy.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "energy_data")
public class EnergyData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long equipmentId;

    private String equipmentCode;

    private Double voltage;

    private Double current;

    private Double power;

    private Double powerFactor;

    private Double energyConsumption;

    private Double temperature;

    private LocalDateTime collectTime;

    private LocalDateTime createTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
    }
}
