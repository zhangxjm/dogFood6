package com.energy.controller;

import com.energy.algorithm.EnergyAlgorithmService;
import com.energy.entity.EnergySavingPlan;
import com.energy.entity.LossAnalysis;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/algorithm")
@RequiredArgsConstructor
public class AlgorithmController {

    private final EnergyAlgorithmService energyAlgorithmService;

    @GetMapping("/efficiency/{equipmentId}")
    public ResponseEntity<Double> calculateEnergyEfficiency(
            @PathVariable Long equipmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        double efficiency = energyAlgorithmService.calculateEnergyEfficiency(equipmentId, start, end);
        return ResponseEntity.ok(efficiency);
    }

    @GetMapping("/predict/{equipmentId}")
    public ResponseEntity<Map<String, Object>> predictEnergyConsumption(
            @PathVariable Long equipmentId,
            @RequestParam(defaultValue = "7") int days) {
        Map<String, Object> prediction = energyAlgorithmService.predictEnergyConsumption(equipmentId, days);
        return ResponseEntity.ok(prediction);
    }

    @GetMapping("/losses/{equipmentId}")
    public ResponseEntity<List<LossAnalysis>> analyzeLosses(
            @PathVariable Long equipmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<LossAnalysis> losses = energyAlgorithmService.analyzeLosses(equipmentId, start, end);
        return ResponseEntity.ok(losses);
    }

    @GetMapping("/saving-plans/{equipmentId}")
    public ResponseEntity<List<EnergySavingPlan>> generateSavingPlans(@PathVariable Long equipmentId) {
        List<EnergySavingPlan> plans = energyAlgorithmService.generateSavingPlans(equipmentId);
        return ResponseEntity.ok(plans);
    }
}
