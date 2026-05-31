package com.aerospace.groundstation.controller;

import com.aerospace.groundstation.simulator.DataSimulatorService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/simulator")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class SimulatorController {

    private final DataSimulatorService simulatorService;

    @Value("${app.simulator.enabled:true}")
    private boolean autoStart;

    @PostConstruct
    public void init() {
        if (autoStart) {
            log.info("Auto-starting data simulator...");
            simulatorService.start();
        }
    }

    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> start() {
        simulatorService.start();
        Map<String, Object> result = new HashMap<>();
        result.put("status", "started");
        result.put("running", simulatorService.isRunning());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/stop")
    public ResponseEntity<Map<String, Object>> stop() {
        simulatorService.stop();
        Map<String, Object> result = new HashMap<>();
        result.put("status", "stopped");
        result.put("running", simulatorService.isRunning());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> result = new HashMap<>();
        result.put("running", simulatorService.isRunning());
        return ResponseEntity.ok(result);
    }
}
