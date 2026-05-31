package com.energy.controller;

import com.energy.entity.EnergyData;
import com.energy.service.EnergyDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/energy-data")
@RequiredArgsConstructor
public class EnergyDataController {

    private final EnergyDataService energyDataService;

    @GetMapping
    public ResponseEntity<List<EnergyData>> findAll() {
        return ResponseEntity.ok(energyDataService.findAll());
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<EnergyData>> findByEquipmentId(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(energyDataService.findByEquipmentId(equipmentId));
    }

    @GetMapping("/time-range")
    public ResponseEntity<List<EnergyData>> findByTimeRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(energyDataService.findByTimeRange(start, end));
    }

    @GetMapping("/equipment/{equipmentId}/time-range")
    public ResponseEntity<List<EnergyData>> findByEquipmentIdAndTimeRange(
            @PathVariable Long equipmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(energyDataService.findByEquipmentIdAndTimeRange(equipmentId, start, end));
    }

    @PostMapping
    public ResponseEntity<EnergyData> save(@RequestBody EnergyData energyData) {
        return ResponseEntity.ok(energyDataService.save(energyData));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        energyDataService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/equipment/{equipmentId}/latest")
    public ResponseEntity<EnergyData> findLatestByEquipmentId(@PathVariable Long equipmentId) {
        EnergyData data = energyDataService.findLatestByEquipmentId(equipmentId);
        return data != null ? ResponseEntity.ok(data) : ResponseEntity.notFound().build();
    }

    @GetMapping("/statistics/realtime")
    public ResponseEntity<Map<String, Object>> getRealTimeStatistics() {
        return ResponseEntity.ok(energyDataService.getRealTimeStatistics());
    }

    @GetMapping("/hourly")
    public ResponseEntity<Map<Long, Double>> getHourlyConsumption(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(energyDataService.getHourlyConsumption(start, end));
    }
}
