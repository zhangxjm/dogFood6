package com.eldercare.controller;

import com.eldercare.dto.AlertDTO;
import com.eldercare.dto.ApiResponse;
import com.eldercare.service.HealthAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HealthAlertController {
    private final HealthAlertService alertService;

    @GetMapping("/elderly/{elderlyId}")
    public ApiResponse<List<AlertDTO>> listByElderly(@PathVariable Long elderlyId) {
        return ApiResponse.success(alertService.listByElderly(elderlyId));
    }

    @GetMapping("/pending")
    public ApiResponse<List<AlertDTO>> listPending() {
        return ApiResponse.success(alertService.listPending());
    }

    @GetMapping("/all")
    public ApiResponse<List<AlertDTO>> listAll() {
        return ApiResponse.success(alertService.listAll());
    }

    @GetMapping("/handled")
    public ApiResponse<List<AlertDTO>> listHandled() {
        return ApiResponse.success(alertService.listHandled());
    }

    @PostMapping("/{id}/handle")
    public ApiResponse<AlertDTO> handleAlert(@PathVariable Long id, @RequestParam String handleResult) {
        AlertDTO result = alertService.handleAlert(id, handleResult);
        if (result == null) {
            return ApiResponse.error(404, "Alert not found");
        }
        return ApiResponse.success("Handled successfully", result);
    }
}
