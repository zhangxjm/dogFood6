package com.ttc.payload.controller;

import com.ttc.common.domain.Result;
import com.ttc.payload.domain.Device;
import com.ttc.payload.domain.PayloadData;
import com.ttc.payload.service.PayloadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payload")
@CrossOrigin
public class PayloadController {

    @Autowired
    private PayloadService payloadService;

    @PostMapping("/collect")
    public Result<?> collectData(@RequestBody PayloadData data) {
        return payloadService.collectData(data);
    }

    @GetMapping("/realtime/{deviceCode}")
    public Result<?> getRealtimeData(@PathVariable String deviceCode) {
        return payloadService.getRealtimeData(deviceCode);
    }

    @GetMapping("/list")
    public Result<?> listData(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String deviceCode,
            @RequestParam(required = false) String dataType) {
        return payloadService.listData(page, size, deviceCode, dataType);
    }

    @GetMapping("/devices")
    public Result<?> getDeviceList() {
        return payloadService.getDeviceList();
    }

    @PostMapping("/device")
    public Result<?> addDevice(@RequestBody Device device) {
        return payloadService.addDevice(device);
    }

    @PutMapping("/device")
    public Result<?> updateDevice(@RequestBody Device device) {
        return payloadService.updateDevice(device);
    }

    @DeleteMapping("/device/{id}")
    public Result<?> deleteDevice(@PathVariable Long id) {
        return payloadService.deleteDevice(id);
    }

    @GetMapping("/device/status/{deviceCode}")
    public Result<?> getDeviceStatus(@PathVariable String deviceCode) {
        return payloadService.getDeviceStatus(deviceCode);
    }

    @GetMapping("/history")
    public Result<?> getHistoryData(
            @RequestParam String deviceCode,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {
        return payloadService.getHistoryData(deviceCode, startTime, endTime);
    }

    @GetMapping("/statistics")
    public Result<?> getDataStatistics() {
        return payloadService.getDataStatistics();
    }
}
