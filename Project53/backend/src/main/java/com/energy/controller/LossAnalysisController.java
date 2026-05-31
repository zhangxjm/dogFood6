package com.energy.controller;

import com.energy.entity.LossAnalysis;
import com.energy.service.LossAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/loss-analysis")
@RequiredArgsConstructor
public class LossAnalysisController {

    private final LossAnalysisService lossAnalysisService;

    @GetMapping
    public ResponseEntity<List<LossAnalysis>> findAll() {
        return ResponseEntity.ok(lossAnalysisService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LossAnalysis> findById(@PathVariable Long id) {
        return lossAnalysisService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<LossAnalysis>> findByEquipmentId(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(lossAnalysisService.findByEquipmentId(equipmentId));
    }

    @GetMapping("/severity/{severity}")
    public ResponseEntity<List<LossAnalysis>> findBySeverity(@PathVariable String severity) {
        return ResponseEntity.ok(lossAnalysisService.findBySeverity(severity));
    }

    @GetMapping("/type/{lossType}")
    public ResponseEntity<List<LossAnalysis>> findByLossType(@PathVariable String lossType) {
        return ResponseEntity.ok(lossAnalysisService.findByLossType(lossType));
    }

    @GetMapping("/time-range")
    public ResponseEntity<List<LossAnalysis>> findByTimeRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(lossAnalysisService.findByTimeRange(start, end));
    }

    @PostMapping
    public ResponseEntity<LossAnalysis> save(@RequestBody LossAnalysis lossAnalysis) {
        return ResponseEntity.ok(lossAnalysisService.save(lossAnalysis));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        if (lossAnalysisService.findById(id).isPresent()) {
            lossAnalysisService.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getLossStatistics() {
        return ResponseEntity.ok(lossAnalysisService.getLossStatistics());
    }
}
