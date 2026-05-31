package com.eldercare.controller;

import com.eldercare.dto.ApiResponse;
import com.eldercare.dto.HealthDataDTO;
import com.eldercare.service.HealthDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HealthDataController {
    private final HealthDataService healthDataService;

    @GetMapping("/elderly/{elderlyId}")
    public ApiResponse<List<HealthDataDTO>> listByElderly(@PathVariable Long elderlyId) {
        return ApiResponse.success(healthDataService.listByElderly(elderlyId));
    }

    @GetMapping("/elderly/{elderlyId}/latest")
    public ApiResponse<HealthDataDTO> getLatest(@PathVariable Long elderlyId) {
        HealthDataDTO dto = healthDataService.getLatestByElderly(elderlyId);
        if (dto == null) {
            return ApiResponse.error(404, "No data found");
        }
        return ApiResponse.success(dto);
    }

    @GetMapping("/elderly/{elderlyId}/range")
    public ApiResponse<List<HealthDataDTO>> listByTimeRange(
            @PathVariable Long elderlyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return ApiResponse.success(healthDataService.listByElderlyAndTimeRange(elderlyId, startTime, endTime));
    }

    @PostMapping
    public ApiResponse<HealthDataDTO> save(@RequestBody HealthDataDTO dto) {
        return ApiResponse.success("Saved successfully", healthDataService.save(dto));
    }
}
