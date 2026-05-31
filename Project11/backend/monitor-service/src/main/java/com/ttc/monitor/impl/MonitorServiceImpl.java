package com.ttc.monitor.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ttc.common.constant.CommonConstants;
import com.ttc.common.domain.Result;
import com.ttc.monitor.domain.Alert;
import com.ttc.monitor.domain.CircuitBreaker;
import com.ttc.monitor.mapper.AlertMapper;
import com.ttc.monitor.mapper.CircuitBreakerMapper;
import com.ttc.monitor.service.MonitorService;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RocketMQMessageListener(
        topic = "ttc-alert-topic",
        consumerGroup = "ttc-alert-group"
)
public class MonitorServiceImpl extends ServiceImpl<AlertMapper, Alert> implements MonitorService, RocketMQListener<String> {

    @Autowired
    private CircuitBreakerMapper circuitBreakerMapper;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String CIRCUIT_BREAKER_KEY_PREFIX = "ttc:circuit:";

    @Override
    public void onMessage(String message) {
        log.info("收到告警消息: {}", message);
        try {
            Alert alert = new Alert();
            alert.setAlertType("system");
            alert.setAlertLevel("warning");
            alert.setAlertContent(message);
            alert.setSource("rocketmq");
            alert.setStatus(0);
            alert.setAlertTime(LocalDateTime.now());
            alert.setCreateTime(LocalDateTime.now());
            save(alert);
        } catch (Exception e) {
            log.error("处理告警消息异常", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<?> createAlert(Alert alert) {
        alert.setStatus(0);
        alert.setAlertTime(LocalDateTime.now());
        alert.setCreateTime(LocalDateTime.now());
        save(alert);
        log.info("创建告警: {}", alert.getAlertContent());
        return Result.success(alert);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<?> handleAlert(Long id, String handler, String handleResult) {
        Alert alert = getById(id);
        if (alert == null) {
            return Result.error("告警不存在");
        }
        alert.setStatus(1);
        alert.setHandler(handler);
        alert.setHandleResult(handleResult);
        alert.setHandleTime(LocalDateTime.now());
        updateById(alert);
        return Result.success();
    }

    @Override
    public Result<?> listAlerts(Integer page, Integer size, Integer status, String alertLevel) {
        QueryWrapper<Alert> wrapper = new QueryWrapper<>();
        if (status != null) {
            wrapper.eq("status", status);
        }
        if (alertLevel != null && !alertLevel.isEmpty()) {
            wrapper.eq("alert_level", alertLevel);
        }
        wrapper.orderByDesc("alert_time");
        Page<Alert> pageResult = page(new Page<>(page, size), wrapper);
        Map<String, Object> result = new HashMap<>();
        result.put("list", pageResult.getRecords());
        result.put("total", pageResult.getTotal());
        return Result.success(result);
    }

    @Override
    public Result<?> getAlertStatistics() {
        Map<String, Object> result = new HashMap<>();
        long totalAlerts = count(null);
        long unhandledAlerts = count(new QueryWrapper<Alert>().eq("status", 0));
        long todayAlerts = count(new QueryWrapper<Alert>().ge("create_time", LocalDateTime.now().toLocalDate().atStartOfDay()));
        long highAlerts = count(new QueryWrapper<Alert>().eq("alert_level", "high"));
        long mediumAlerts = count(new QueryWrapper<Alert>().eq("alert_level", "medium"));
        long lowAlerts = count(new QueryWrapper<Alert>().eq("alert_level", "low"));
        result.put("totalAlerts", totalAlerts);
        result.put("unhandledAlerts", unhandledAlerts);
        result.put("todayAlerts", todayAlerts);
        result.put("highAlerts", highAlerts);
        result.put("mediumAlerts", mediumAlerts);
        result.put("lowAlerts", lowAlerts);
        return Result.success(result);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<?> openCircuitBreaker(String resourceName, String resourceType, String reason) {
        QueryWrapper<CircuitBreaker> wrapper = new QueryWrapper<>();
        wrapper.eq("resource_name", resourceName);
        CircuitBreaker circuitBreaker = circuitBreakerMapper.selectOne(wrapper);
        if (circuitBreaker == null) {
            circuitBreaker = new CircuitBreaker();
            circuitBreaker.setResourceName(resourceName);
            circuitBreaker.setResourceType(resourceType);
            circuitBreaker.setThreshold(5);
            circuitBreaker.setTimeout(30);
            circuitBreaker.setFailureCount(0);
            circuitBreaker.setCreateTime(LocalDateTime.now());
        }
        circuitBreaker.setStatus(1);
        circuitBreaker.setFailureCount(circuitBreaker.getFailureCount() + 1);
        circuitBreaker.setOpenTime(LocalDateTime.now());
        circuitBreaker.setRemark(reason);
        circuitBreaker.setUpdateTime(LocalDateTime.now());
        if (circuitBreaker.getId() == null) {
            circuitBreakerMapper.insert(circuitBreaker);
        } else {
            circuitBreakerMapper.updateById(circuitBreaker);
        }
        String cacheKey = CIRCUIT_BREAKER_KEY_PREFIX + resourceName;
        redisTemplate.opsForValue().set(cacheKey, "OPEN", circuitBreaker.getTimeout(), TimeUnit.SECONDS);
        log.warn("熔断器打开: {}, 原因: {}", resourceName, reason);
        return Result.success(circuitBreaker);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<?> closeCircuitBreaker(Long id) {
        CircuitBreaker circuitBreaker = circuitBreakerMapper.selectById(id);
        if (circuitBreaker == null) {
            return Result.error("熔断器不存在");
        }
        circuitBreaker.setStatus(0);
        circuitBreaker.setFailureCount(0);
        circuitBreaker.setCloseTime(LocalDateTime.now());
        circuitBreaker.setUpdateTime(LocalDateTime.now());
        circuitBreakerMapper.updateById(circuitBreaker);
        redisTemplate.delete(CIRCUIT_BREAKER_KEY_PREFIX + circuitBreaker.getResourceName());
        log.info("熔断器关闭: {}", circuitBreaker.getResourceName());
        return Result.success();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<?> halfOpenCircuitBreaker(Long id) {
        CircuitBreaker circuitBreaker = circuitBreakerMapper.selectById(id);
        if (circuitBreaker == null) {
            return Result.error("熔断器不存在");
        }
        circuitBreaker.setStatus(2);
        circuitBreaker.setHalfOpenTime(LocalDateTime.now());
        circuitBreaker.setUpdateTime(LocalDateTime.now());
        circuitBreakerMapper.updateById(circuitBreaker);
        String cacheKey = CIRCUIT_BREAKER_KEY_PREFIX + circuitBreaker.getResourceName();
        redisTemplate.opsForValue().set(cacheKey, "HALF_OPEN", 10, TimeUnit.SECONDS);
        log.info("熔断器半开: {}", circuitBreaker.getResourceName());
        return Result.success();
    }

    @Override
    public Result<?> listCircuitBreakers() {
        List<CircuitBreaker> list = circuitBreakerMapper.selectList(null);
        return Result.success(list);
    }

    @Override
    public Result<?> checkCircuitBreaker(String resourceName) {
        String cacheKey = CIRCUIT_BREAKER_KEY_PREFIX + resourceName;
        String status = redisTemplate.opsForValue().get(cacheKey);
        Map<String, Object> result = new HashMap<>();
        result.put("resourceName", resourceName);
        result.put("status", status != null ? status : "CLOSED");
        return Result.success(result);
    }

    @Override
    public Result<?> getSystemStatus() {
        Map<String, Object> result = new HashMap<>();
        long openCircuits = circuitBreakerMapper.selectCount(new QueryWrapper<CircuitBreaker>().eq("status", 1));
        long totalDevices = 5;
        long activeServices = 4;
        result.put("openCircuits", openCircuits);
        result.put("totalDevices", totalDevices);
        result.put("activeServices", activeServices);
        result.put("systemStatus", openCircuits > 0 ? "WARNING" : "NORMAL");
        result.put("timestamp", LocalDateTime.now().toString());
        return Result.success(result);
    }
}
