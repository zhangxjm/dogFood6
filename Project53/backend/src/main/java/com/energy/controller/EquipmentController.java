package com.energy.controller;

import com.energy.entity.Equipment;
import com.energy.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping
    public ResponseEntity<List<Equipment>> findAll() {
        return ResponseEntity.ok(equipmentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> findById(@PathVariable Long id) {
        return equipmentService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Equipment> findByCode(@PathVariable String code) {
        return equipmentService.findByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Equipment> save(@RequestBody Equipment equipment) {
        return ResponseEntity.ok(equipmentService.save(equipment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Equipment> update(@PathVariable Long id, @RequestBody Equipment equipment) {
        return equipmentService.findById(id)
                .map(existing -> {
                    equipment.setId(id);
                    return ResponseEntity.ok(equipmentService.save(equipment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        if (equipmentService.findById(id).isPresent()) {
            equipmentService.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Equipment>> findByStatus(@PathVariable String status) {
        return ResponseEntity.ok(equipmentService.findByStatus(status));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Equipment>> findByType(@PathVariable String type) {
        return ResponseEntity.ok(equipmentService.findByType(type));
    }
}
