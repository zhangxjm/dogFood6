package com.quantum.controller;

import com.quantum.entity.Experiment;
import com.quantum.entity.ExperimentStep;
import com.quantum.service.QuantumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/quantum")
@CrossOrigin(origins = "*")
public class QuantumController {

    @Autowired
    private QuantumService quantumService;

    @PostMapping("/simulate")
    public ResponseEntity<Map<String, Object>> simulateCircuit(@RequestBody Map<String, Object> request) {
        try {
            Map<String, Object> result = quantumService.simulateCircuit(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/algorithm/{name}")
    public ResponseEntity<Map<String, Object>> runAlgorithm(
            @PathVariable String name,
            @RequestParam(defaultValue = "3") int numQubits,
            @RequestParam(defaultValue = "0") int targetState) {
        try {
            Map<String, Object> result = quantumService.runAlgorithm(name, numQubits, targetState);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/gates")
    public ResponseEntity<Map<String, Object>> getAllGates() {
        return ResponseEntity.ok(quantumService.getAllGates());
    }

    @GetMapping("/gates/{name}")
    public ResponseEntity<Map<String, Object>> getGateInfo(@PathVariable String name) {
        try {
            return ResponseEntity.ok(quantumService.getGateInfo(name));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/algorithms")
    public ResponseEntity<Map<String, Object>> getAllAlgorithms() {
        return ResponseEntity.ok(quantumService.getAllAlgorithms());
    }

    @PostMapping("/experiments")
    public ResponseEntity<?> saveExperiment(@RequestBody Map<String, Object> request) {
        try {
            Experiment experiment = quantumService.saveExperiment(request);
            return ResponseEntity.ok(experiment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/experiments")
    public ResponseEntity<List<Experiment>> getAllExperiments() {
        return ResponseEntity.ok(quantumService.getAllExperiments());
    }

    @GetMapping("/experiments/{id}")
    public ResponseEntity<?> getExperiment(@PathVariable Long id) {
        return quantumService.getExperiment(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/experiments/{id}/steps")
    public ResponseEntity<List<ExperimentStep>> getExperimentSteps(@PathVariable Long id) {
        return ResponseEntity.ok(quantumService.getExperimentSteps(id));
    }

    @DeleteMapping("/experiments/{id}")
    public ResponseEntity<?> deleteExperiment(@PathVariable Long id) {
        quantumService.deleteExperiment(id);
        return ResponseEntity.ok().build();
    }
}
