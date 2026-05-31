package com.ttc.monitor.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.ttc.common.domain.Result;
import com.ttc.monitor.domain.Alert;
import com.ttc.monitor.domain.CircuitBreaker;

import java.util.Map;

public interface MonitorService extends IService<Alert> {
    Result<?> createAlert(Alert alert);
    Result<?> handleAlert(Long id, String handler, String handleResult);
    Result<?> listAlerts(Integer page, Integer size, Integer status, String alertLevel);
    Result<?> getAlertStatistics();
    Result<?> openCircuitBreaker(String resourceName, String resourceType, String reason);
    Result<?> closeCircuitBreaker(Long id);
    Result<?> halfOpenCircuitBreaker(Long id);
    Result<?> listCircuitBreakers();
    Result<?> checkCircuitBreaker(String resourceName);
    Result<?> getSystemStatus();
}
