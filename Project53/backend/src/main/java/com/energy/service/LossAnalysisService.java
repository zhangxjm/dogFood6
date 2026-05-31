package com.energy.service;

import com.energy.entity.LossAnalysis;
import com.energy.repository.LossAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LossAnalysisService {

    private final LossAnalysisRepository lossAnalysisRepository;

    public List<LossAnalysis> findAll() {
        return lossAnalysisRepository.findAll();
    }

    public Optional<LossAnalysis> findById(Long id) {
        return lossAnalysisRepository.findById(id);
    }

    public List<LossAnalysis> findByEquipmentId(Long equipmentId) {
        return lossAnalysisRepository.findByEquipmentId(equipmentId);
    }

    public List<LossAnalysis> findBySeverity(String severity) {
        return lossAnalysisRepository.findBySeverity(severity);
    }

    public List<LossAnalysis> findByLossType(String lossType) {
        return lossAnalysisRepository.findByLossType(lossType);
    }

    public List<LossAnalysis> findByTimeRange(LocalDateTime start, LocalDateTime end) {
        return lossAnalysisRepository.findByAnalysisTimeBetween(start, end);
    }

    public LossAnalysis save(LossAnalysis lossAnalysis) {
        return lossAnalysisRepository.save(lossAnalysis);
    }

    public void deleteById(Long id) {
        lossAnalysisRepository.deleteById(id);
    }

    public Map<String, Object> getLossStatistics() {
        Map<String, Object> stats = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.minusDays(30).toLocalDate().atStartOfDay();

        List<LossAnalysis> allLosses = lossAnalysisRepository.findByAnalysisTimeBetween(monthStart, now);

        double totalLossValue = allLosses.stream()
                .mapToDouble(l -> l.getLossValue() != null ? l.getLossValue() : 0.0)
                .sum();
        double totalCost = allLosses.stream()
                .mapToDouble(l -> l.getCost() != null ? l.getCost() : 0.0)
                .sum();

        Map<String, Double> lossByType = new HashMap<>();
        for (LossAnalysis loss : allLosses) {
            String type = loss.getLossType() != null ? loss.getLossType() : "unknown";
            lossByType.merge(type, loss.getLossValue() != null ? loss.getLossValue() : 0.0, Double::sum);
        }

        stats.put("totalLossValue", totalLossValue);
        stats.put("totalCost", totalCost);
        stats.put("lossByType", lossByType);
        stats.put("lossCount", allLosses.size());

        return stats;
    }
}
