package com.eldercare.controller;

import com.eldercare.dto.ApiResponse;
import com.eldercare.entity.EmergencyCall;
import com.eldercare.service.EmergencyCallService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emergency")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmergencyCallController {
    private final EmergencyCallService emergencyCallService;

    @GetMapping("/elderly/{elderlyId}")
    public ApiResponse<List<EmergencyCall>> listByElderly(@PathVariable Long elderlyId) {
        return ApiResponse.success(emergencyCallService.listByElderly(elderlyId));
    }

    @GetMapping("/pending")
    public ApiResponse<List<EmergencyCall>> listPending() {
        return ApiResponse.success(emergencyCallService.listPending());
    }

    @GetMapping("/{id}/details")
    public ApiResponse<Map<String, Object>> getDetails(@PathVariable Long id) {
        return ApiResponse.success(emergencyCallService.getEmergencyCallDetails(id));
    }

    @PostMapping
    public ApiResponse<EmergencyCall> create(@RequestBody Map<String, Object> params) {
        Long elderlyId = Long.valueOf(params.get("elderlyId").toString());
        String callType = (String) params.getOrDefault("callType", "MANUAL");
        String callContent = (String) params.getOrDefault("callContent", "");
        
        return ApiResponse.success("Created successfully", 
                emergencyCallService.createEmergencyCall(elderlyId, callType, callContent));
    }

    @PostMapping("/{id}/handle")
    public ApiResponse<EmergencyCall> handle(@PathVariable Long id, @RequestParam String handleResult) {
        EmergencyCall result = emergencyCallService.handleEmergencyCall(id, handleResult);
        if (result == null) {
            return ApiResponse.error(404, "Not found");
        }
        return ApiResponse.success("Handled successfully", result);
    }
}
