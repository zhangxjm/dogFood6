package com.inspection.controller;

import com.inspection.entity.DefectType;
import com.inspection.entity.SystemSetting;
import com.inspection.entity.User;
import com.inspection.service.SystemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SystemController {

    private final SystemService systemService;

    public SystemController(SystemService systemService) {
        this.systemService = systemService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(systemService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(systemService.createUser(user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(systemService.updateUser(id, user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        systemService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/defect-types")
    public ResponseEntity<List<DefectType>> getAllDefectTypes() {
        return ResponseEntity.ok(systemService.getAllDefectTypes());
    }

    @PostMapping("/defect-types")
    public ResponseEntity<DefectType> createDefectType(@RequestBody DefectType defectType) {
        return ResponseEntity.ok(systemService.createDefectType(defectType));
    }

    @PutMapping("/defect-types/{id}")
    public ResponseEntity<DefectType> updateDefectType(@PathVariable Long id, @RequestBody DefectType defectType) {
        return ResponseEntity.ok(systemService.updateDefectType(id, defectType));
    }

    @DeleteMapping("/defect-types/{id}")
    public ResponseEntity<Void> deleteDefectType(@PathVariable Long id) {
        systemService.deleteDefectType(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/system/settings")
    public ResponseEntity<List<SystemSetting>> getAllSettings() {
        return ResponseEntity.ok(systemService.getAllSettings());
    }

    @PutMapping("/system/settings/{key}")
    public ResponseEntity<SystemSetting> updateSetting(
            @PathVariable String key,
            @RequestParam String value) {
        return ResponseEntity.ok(systemService.updateSetting(key, value));
    }
}
