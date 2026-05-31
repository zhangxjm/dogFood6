package com.energy.repository;

import com.energy.entity.EnergyData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EnergyDataRepository extends JpaRepository<EnergyData, Long> {

    List<EnergyData> findByEquipmentId(Long equipmentId);

    List<EnergyData> findByEquipmentIdAndCollectTimeBetween(Long equipmentId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT e FROM EnergyData e WHERE e.collectTime BETWEEN :start AND :end ORDER BY e.collectTime")
    List<EnergyData> findByCollectTimeBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT SUM(e.energyConsumption) FROM EnergyData e WHERE e.equipmentId = :equipmentId AND e.collectTime BETWEEN :start AND :end")
    Double sumEnergyConsumptionByEquipmentIdAndTime(@Param("equipmentId") Long equipmentId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT SUM(e.energyConsumption) FROM EnergyData e WHERE e.collectTime BETWEEN :start AND :end")
    Double sumTotalEnergyConsumption(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT e FROM EnergyData e WHERE e.equipmentId = :equipmentId ORDER BY e.collectTime DESC LIMIT 1")
    EnergyData findLatestByEquipmentId(@Param("equipmentId") Long equipmentId);

    List<EnergyData> findTop100ByOrderByCollectTimeDesc();
}
