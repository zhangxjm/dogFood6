package com.quantum.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "experiment_steps")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExperimentStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experiment_id")
    private Experiment experiment;

    @Column(nullable = false)
    private Integer stepNumber;

    @Column(nullable = false)
    private String gateName;

    @Column(columnDefinition = "TEXT")
    private String qubits;

    @Column(columnDefinition = "TEXT")
    private String stateVector;

    @Column(columnDefinition = "TEXT")
    private String probabilities;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
