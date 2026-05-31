package com.eldercare.controller;

import com.eldercare.dto.ApiResponse;
import com.eldercare.service.BluetoothIoTService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BluetoothIoTController {
    private final BluetoothIoTService bluetoothIoTService;

    @PostMapping("/simulation/start")
    public ApiResponse<Map<String, Object>> startSimulation() {
        bluetoothIoTService.startSimulation();
        Map<String, Object> result = new HashMap<>();
        result.put("status", "RUNNING");
        return ApiResponse.success("Simulation started", result);
    }

    @PostMapping("/simulation/stop")
    public ApiResponse<Map<String, Object>> stopSimulation() {
        bluetoothIoTService.stopSimulation();
        Map<String, Object> result = new HashMap<>();
        result.put("status", "STOPPED");
        return ApiResponse.success("Simulation stopped", result);
    }

    @GetMapping("/simulation/status")
    public ApiResponse<Map<String, Object>> getSimulationStatus() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", bluetoothIoTService.isSimulationRunning() ? "RUNNING" : "STOPPED");
        return ApiResponse.success(result);
    }
}
