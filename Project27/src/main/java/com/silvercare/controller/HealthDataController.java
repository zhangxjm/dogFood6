package com.silvercare.controller;

import com.silvercare.common.Result;
import com.silvercare.entity.HealthData;
import com.silvercare.service.HealthDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/health")
public class HealthDataController {

    @Autowired
    private HealthDataService healthDataService;

    @PostMapping("/save")
    public Result<HealthData> save(@RequestBody HealthData healthData, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        healthData.setUserId(userId);
        return healthDataService.save(healthData);
    }

    @GetMapping("/my")
    public Result<List<HealthData>> myHealthData(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return healthDataService.listByUserId(userId);
    }

    @GetMapping("/latest")
    public Result<HealthData> getLatest(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return healthDataService.getLatest(userId);
    }

    @GetMapping("/user/{userId}")
    public Result<List<HealthData>> getByUserId(@PathVariable Long userId) {
        return healthDataService.listByUserId(userId);
    }
}
