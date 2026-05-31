package com.quantum.repository;

import com.quantum.entity.Experiment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperimentRepository extends JpaRepository<Experiment, Long> {
    List<Experiment> findByCircuitType(String circuitType);
    List<Experiment> findByNameContaining(String name);
}
