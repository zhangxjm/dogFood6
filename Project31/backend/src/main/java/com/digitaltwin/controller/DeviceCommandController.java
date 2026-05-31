package com.digitaltwin.controller;

import com.digitaltwin.dto.DeviceCommandRequest;
import com.digitaltwin.dto.Result;
import com.digitaltwin.entity.DeviceCommand;
import com.digitaltwin.service.DeviceCommandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commands")
@CrossOrigin(origins = "*")
public class DeviceCommandController {

    @Autowired
    private DeviceCommandService deviceCommandService;

    @GetMapping
    public Result<List<DeviceCommand>> getAllCommands() {
        return Result.success(deviceCommandService.getAllCommands());
    }

    @GetMapping("/device/{deviceCode}")
    public Result<List<DeviceCommand>> getCommandsByDevice(@PathVariable String deviceCode) {
        return Result.success(deviceCommandService.getCommandsByDevice(deviceCode));
    }

    @GetMapping("/status/{status}")
    public Result<List<DeviceCommand>> getCommandsByStatus(@PathVariable String status) {
        return Result.success(deviceCommandService.getCommandsByStatus(status));
    }

    @PostMapping("/send")
    public Result<DeviceCommand> sendCommand(@RequestBody DeviceCommandRequest request) {
        return Result.success(deviceCommandService.sendCommand(request));
    }
}
