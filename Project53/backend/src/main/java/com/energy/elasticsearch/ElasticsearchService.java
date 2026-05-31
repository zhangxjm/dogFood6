package com.energy.elasticsearch;

import com.energy.entity.EnergyData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ElasticsearchService {

    private final EnergyDataEsRepository energyDataEsRepository;

    public void saveEnergyData(EnergyData energyData) {
        EnergyDataDocument document = convertToDocument(energyData);
        try {
            energyDataEsRepository.save(document);
        } catch (Exception e) {
        }
    }

    public void saveAllEnergyData(List<EnergyData> energyDataList) {
        List<EnergyDataDocument> documents = energyDataList.stream()
                .map(this::convertToDocument)
                .collect(Collectors.toList());
        try {
            energyDataEsRepository.saveAll(documents);
        } catch (Exception e) {
        }
    }

    public List<EnergyDataDocument> findByEquipmentId(Long equipmentId) {
        try {
            return energyDataEsRepository.findByEquipmentId(equipmentId);
        } catch (Exception e) {
            return List.of();
        }
    }

    public List<EnergyDataDocument> findByTimeRange(LocalDateTime start, LocalDateTime end) {
        try {
            return energyDataEsRepository.findByCollectTimeBetween(start, end);
        } catch (Exception e) {
            return List.of();
        }
    }

    public List<EnergyDataDocument> findByEquipmentIdAndTimeRange(Long equipmentId, LocalDateTime start, LocalDateTime end) {
        try {
            return energyDataEsRepository.findByEquipmentIdAndCollectTimeBetween(equipmentId, start, end);
        } catch (Exception e) {
            return List.of();
        }
    }

    public Map<String, Object> getAggregatedStatistics(LocalDateTime start, LocalDateTime end) {
        Map<String, Object> stats = new HashMap<>();
        try {
            List<EnergyDataDocument> documents = findByTimeRange(start, end);

            double totalEnergy = documents.stream()
                    .mapToDouble(d -> d.getEnergyConsumption() != null ? d.getEnergyConsumption() : 0.0)
                    .sum();
            double avgPower = documents.stream()
                    .mapToDouble(d -> d.getPower() != null ? d.getPower() : 0.0)
                    .average()
                    .orElse(0.0);
            double maxPower = documents.stream()
                    .mapToDouble(d -> d.getPower() != null ? d.getPower() : 0.0)
                    .max()
                    .orElse(0.0);
            double avgPowerFactor = documents.stream()
                    .mapToDouble(d -> d.getPowerFactor() != null ? d.getPowerFactor() : 0.0)
                    .average()
                    .orElse(0.0);

            stats.put("totalEnergyConsumption", Math.round(totalEnergy * 100.0) / 100.0);
            stats.put("avgPower", Math.round(avgPower * 100.0) / 100.0);
            stats.put("maxPower", Math.round(maxPower * 100.0) / 100.0);
            stats.put("avgPowerFactor", Math.round(avgPowerFactor * 100.0) / 100.0);
            stats.put("totalRecords", documents.size());
        } catch (Exception e) {
            stats.put("totalEnergyConsumption", 0.0);
            stats.put("avgPower", 0.0);
            stats.put("maxPower", 0.0);
            stats.put("avgPowerFactor", 0.0);
            stats.put("totalRecords", 0);
        }
        return stats;
    }

    private EnergyDataDocument convertToDocument(EnergyData energyData) {
        EnergyDataDocument document = new EnergyDataDocument();
        if (energyData.getId() != null) {
            document.setId(energyData.getId().toString());
        }
        document.setEquipmentId(energyData.getEquipmentId());
        document.setEquipmentCode(energyData.getEquipmentCode());
        document.setVoltage(energyData.getVoltage());
        document.setCurrent(energyData.getCurrent());
        document.setPower(energyData.getPower());
        document.setPowerFactor(energyData.getPowerFactor());
        document.setEnergyConsumption(energyData.getEnergyConsumption());
        document.setTemperature(energyData.getTemperature());
        document.setCollectTime(energyData.getCollectTime());
        document.setCreateTime(energyData.getCreateTime());
        return document;
    }
}
