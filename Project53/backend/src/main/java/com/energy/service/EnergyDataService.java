package com.energy.service;

import com.energy.entity.EnergyData;
import com.energy.repository.EnergyDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EnergyDataService {

    private final EnergyDataRepository energyDataRepository;

    public List<EnergyData> findAll() {
        return energyDataRepository.findTop100ByOrderByCollectTimeDesc();
    }

    public List<EnergyData> findByEquipmentId(Long equipmentId) {
        return energyDataRepository.findByEquipmentId(equipmentId);
    }

    public List<EnergyData> findByTimeRange(LocalDateTime start, LocalDateTime end) {
        return energyDataRepository.findByCollectTimeBetween(start, end);
    }

    public List<EnergyData> findByEquipmentIdAndTimeRange(Long equipmentId, LocalDateTime start, LocalDateTime end) {
        return energyDataRepository.findByEquipmentIdAndCollectTimeBetween(equipmentId, start, end);
    }

    public EnergyData save(EnergyData energyData) {
        return energyDataRepository.save(energyData);
    }

    public void deleteById(Long id) {
        energyDataRepository.deleteById(id);
    }

    public EnergyData findLatestByEquipmentId(Long equipmentId) {
        return energyDataRepository.findLatestByEquipmentId(equipmentId);
    }

    public Map<String, Object> getRealTimeStatistics() {
        Map<String, Object> stats = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        LocalDateTime weekStart = now.minusDays(7).toLocalDate().atStartOfDay();
        LocalDateTime monthStart = now.minusDays(30).toLocalDate().atStartOfDay();

        Double todayConsumption = energyDataRepository.sumTotalEnergyConsumption(todayStart, now);
        Double weekConsumption = energyDataRepository.sumTotalEnergyConsumption(weekStart, now);
        Double monthConsumption = energyDataRepository.sumTotalEnergyConsumption(monthStart, now);

        stats.put("todayConsumption", todayConsumption != null ? todayConsumption : 0.0);
        stats.put("weekConsumption", weekConsumption != null ? weekConsumption : 0.0);
        stats.put("monthConsumption", monthConsumption != null ? monthConsumption : 0.0);
        stats.put("currentPower", getCurrentTotalPower());

        return stats;
    }

    private Double getCurrentTotalPower() {
        List<EnergyData> latestData = energyDataRepository.findTop100ByOrderByCollectTimeDesc();
        Map<Long, EnergyData> latestByEquipment = new HashMap<>();
        for (EnergyData data : latestData) {
            if (!latestByEquipment.containsKey(data.getEquipmentId())) {
                latestByEquipment.put(data.getEquipmentId(), data);
            }
        }
        return latestByEquipment.values().stream()
                .mapToDouble(d -> d.getPower() != null ? d.getPower() : 0.0)
                .sum();
    }

    public Map<Long, Double> getHourlyConsumption(LocalDateTime start, LocalDateTime end) {
        List<EnergyData> dataList = energyDataRepository.findByCollectTimeBetween(start, end);
        Map<Long, Double> hourlyMap = new HashMap<>();

        for (EnergyData data : dataList) {
            long hourKey = data.getCollectTime().getHour();
            hourlyMap.merge(hourKey, data.getEnergyConsumption() != null ? data.getEnergyConsumption() : 0.0, Double::sum);
        }
        return hourlyMap;
    }
}
