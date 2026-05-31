package com.energy.repository;

import com.energy.entity.EnergySavingPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnergySavingPlanRepository extends JpaRepository<EnergySavingPlan, Long> {

    List<EnergySavingPlan> findByEquipmentId(Long equipmentId);

    List<EnergySavingPlan> findByPriority(String priority);

    List<EnergySavingPlan> findByStatus(String status);
}
