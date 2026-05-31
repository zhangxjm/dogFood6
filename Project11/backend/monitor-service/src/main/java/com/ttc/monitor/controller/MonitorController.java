package com.ttc.monitor.controller;

import com.ttc.common.domain.Result;
import com.ttc.monitor.domain.Alert;
import com.ttc.monitor.service.MonitorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/monitor")
@CrossOrigin
public class MonitorController {

    @Autowired
    private MonitorService monitorService;

    @PostMapping("/alert")
    public Result<?> createAlert(@RequestBody Alert alert) {
        return monitorService.createAlert(alert);
    }

    @PostMapping("/alert/handle/{id}")
    public Result<?> handleAlert(
            @PathVariable Long id,
            @RequestBody Map<String, String> params) {
        return monitorService.handleAlert(id, params.get("handler"), params.get("handleResult"));
    }

    @GetMapping("/alerts")
    public Result<?> listAlerts(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String alertLevel) {
        return monitorService.listAlerts(page, size, status, alertLevel);
    }

    @GetMapping("/alert/statistics")
    public Result<?> getAlertStatistics() {
        return monitorService.getAlertStatistics();
    }

    @PostMapping("/circuit/open")
    public Result<?> openCircuitBreaker(@RequestBody Map<String, String> params) {
        return monitorService.openCircuitBreaker(
                params.get("resourceName"),
                params.get("resourceType"),
                params.get("reason"));
    }

    @PostMapping("/circuit/close/{id}")
    public Result<?> closeCircuitBreaker(@PathVariable Long id) {
        return monitorService.closeCircuitBreaker(id);
    }

    @PostMapping("/circuit/halfopen/{id}")
    public Result<?> halfOpenCircuitBreaker(@PathVariable Long id) {
        return monitorService.halfOpenCircuitBreaker(id);
    }

    @GetMapping("/circuits")
    public Result<?> listCircuitBreakers() {
        return monitorService.listCircuitBreakers();
    }

    @GetMapping("/circuit/check/{resourceName}")
    public Result<?> checkCircuitBreaker(@PathVariable String resourceName) {
        return monitorService.checkCircuitBreaker(resourceName);
    }

    @GetMapping("/system/status")
    public Result<?> getSystemStatus() {
        return monitorService.getSystemStatus();
    }
}
