package com.digitaltwin.controller;

import com.digitaltwin.dto.Result;
import com.digitaltwin.entity.Device;
import com.digitaltwin.entity.DeviceHistory;
import com.digitaltwin.service.DeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/devices")
@CrossOrigin(origins = "*")
public class DeviceController {

    @Autowired
    private DeviceService deviceService;

    @GetMapping
    public Result<List<Device>> getAllDevices() {
        return Result.success(deviceService.getAllDevices());
    }

    @GetMapping("/{deviceCode}")
    public Result<Device> getDeviceByCode(@PathVariable String deviceCode) {
        Device device = deviceService.getDeviceByCode(deviceCode);
        if (device == null) {
            return Result.error("设备不存在");
        }
        return Result.success(device);
    }

    @PostMapping
    public Result<Device> createDevice(@RequestBody Device device) {
        return Result.success(deviceService.saveDevice(device));
    }

    @PutMapping
    public Result<Device> updateDevice(@RequestBody Device device) {
        return Result.success(deviceService.saveDevice(device));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteDevice(@PathVariable Long id) {
        deviceService.deleteDevice(id);
        return Result.success();
    }

    @GetMapping("/alarms")
    public Result<List<Device>> getDevicesWithAlarms() {
        return Result.success(deviceService.getDevicesWithAlarms());
    }

    @GetMapping("/stats")
    public Result<Map<String, Object>> getDeviceStats() {
        return Result.success(deviceService.getDeviceStats());
    }

    @GetMapping("/{deviceCode}/history")
    public Result<List<DeviceHistory>> getDeviceHistory(
            @PathVariable String deviceCode,
            @RequestParam(defaultValue = "100") int limit) {
        return Result.success(deviceService.getDeviceHistory(deviceCode, limit));
    }

    @GetMapping("/{deviceCode}/history/range")
    public Result<List<DeviceHistory>> getDeviceHistoryByTimeRange(
            @PathVariable String deviceCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return Result.success(deviceService.getDeviceHistoryByTimeRange(deviceCode, startTime, endTime));
    }
}
