package com.digitaltwin.controller;

import com.digitaltwin.dto.AlarmResolveRequest;
import com.digitaltwin.dto.Result;
import com.digitaltwin.entity.Alarm;
import com.digitaltwin.service.AlarmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alarms")
@CrossOrigin(origins = "*")
public class AlarmController {

    @Autowired
    private AlarmService alarmService;

    @GetMapping
    public Result<List<Alarm>> getAllAlarms() {
        return Result.success(alarmService.getAllAlarms());
    }

    @GetMapping("/active")
    public Result<List<Alarm>> getActiveAlarms() {
        return Result.success(alarmService.getActiveAlarms());
    }

    @GetMapping("/device/{deviceCode}")
    public Result<List<Alarm>> getAlarmsByDevice(@PathVariable String deviceCode) {
        return Result.success(alarmService.getAlarmsByDevice(deviceCode));
    }

    @PostMapping("/resolve")
    public Result<Alarm> resolveAlarm(@RequestBody AlarmResolveRequest request) {
        Alarm alarm = alarmService.resolveAlarm(request.getAlarmId(), request.getResolveNote());
        if (alarm == null) {
            return Result.error("告警不存在");
        }
        return Result.success(alarm);
    }

    @GetMapping("/count")
    public Result<Long> getActiveAlarmCount() {
        return Result.success(alarmService.getActiveAlarmCount());
    }
}
