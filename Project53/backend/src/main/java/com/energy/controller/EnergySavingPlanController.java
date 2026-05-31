package com.energy.controller;

import com.energy.entity.EnergySavingPlan;
import com.energy.service.EnergySavingPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/saving-plans")
@RequiredArgsConstructor
public class EnergySavingPlanController {

    private final EnergySavingPlanService energySavingPlanService;

    @GetMapping
    public ResponseEntity<List<EnergySavingPlan>> findAll() {
        return ResponseEntity.ok(energySavingPlanService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnergySavingPlan> findById(@PathVariable Long id) {
        return energySavingPlanService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<EnergySavingPlan>> findByEquipmentId(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(energySavingPlanService.findByEquipmentId(equipmentId));
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<EnergySavingPlan>> findByPriority(@PathVariable String priority) {
        return ResponseEntity.ok(energySavingPlanService.findByPriority(priority));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<EnergySavingPlan>> findByStatus(@PathVariable String status) {
        return ResponseEntity.ok(energySavingPlanService.findByStatus(status));
    }

    @PostMapping
    public ResponseEntity<EnergySavingPlan> save(@RequestBody EnergySavingPlan plan) {
        return ResponseEntity.ok(energySavingPlanService.save(plan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EnergySavingPlan> update(@PathVariable Long id, @RequestBody EnergySavingPlan plan) {
        return energySavingPlanService.findById(id)
                .map(existing -> {
                    plan.setId(id);
                    return ResponseEntity.ok(energySavingPlanService.save(plan));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        if (energySavingPlanService.findById(id).isPresent()) {
            energySavingPlanService.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
