package com.quantum.repository;

import com.quantum.entity.ExperimentStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperimentStepRepository extends JpaRepository<ExperimentStep, Long> {
    List<ExperimentStep> findByExperimentIdOrderByStepNumber(Long experimentId);
    void deleteByExperimentId(Long experimentId);
}
