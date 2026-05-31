package com.energy.service;

import com.energy.entity.EnergySavingPlan;
import com.energy.repository.EnergySavingPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EnergySavingPlanService {

    private final EnergySavingPlanRepository energySavingPlanRepository;

    public List<EnergySavingPlan> findAll() {
        return energySavingPlanRepository.findAll();
    }

    public Optional<EnergySavingPlan> findById(Long id) {
        return energySavingPlanRepository.findById(id);
    }

    public List<EnergySavingPlan> findByEquipmentId(Long equipmentId) {
        return energySavingPlanRepository.findByEquipmentId(equipmentId);
    }

    public List<EnergySavingPlan> findByPriority(String priority) {
        return energySavingPlanRepository.findByPriority(priority);
    }

    public List<EnergySavingPlan> findByStatus(String status) {
        return energySavingPlanRepository.findByStatus(status);
    }

    public EnergySavingPlan save(EnergySavingPlan plan) {
        return energySavingPlanRepository.save(plan);
    }

    public void deleteById(Long id) {
        energySavingPlanRepository.deleteById(id);
    }
}
