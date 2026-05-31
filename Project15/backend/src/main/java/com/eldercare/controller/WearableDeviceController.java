package com.eldercare.controller;

import com.eldercare.dto.ApiResponse;
import com.eldercare.entity.WearableDevice;
import com.eldercare.service.WearableDeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WearableDeviceController {
    private final WearableDeviceService deviceService;

    @GetMapping
    public ApiResponse<List<WearableDevice>> list() {
        return ApiResponse.success(deviceService.list());
    }

    @GetMapping("/{id}")
    public ApiResponse<WearableDevice> getById(@PathVariable Long id) {
        return deviceService.getById(id)
                .map(ApiResponse::success)
                .orElse(ApiResponse.error(404, "Not found"));
    }

    @GetMapping("/code/{deviceCode}")
    public ApiResponse<WearableDevice> getByDeviceCode(@PathVariable String deviceCode) {
        return deviceService.getByDeviceCode(deviceCode)
                .map(ApiResponse::success)
                .orElse(ApiResponse.error(404, "Not found"));
    }

    @GetMapping("/elderly/{elderlyId}")
    public ApiResponse<List<WearableDevice>> listByElderly(@PathVariable Long elderlyId) {
        return ApiResponse.success(deviceService.listByElderly(elderlyId));
    }

    @PostMapping
    public ApiResponse<WearableDevice> create(@RequestBody WearableDevice device) {
        return ApiResponse.success("Created successfully", deviceService.create(device));
    }

    @PutMapping("/{id}")
    public ApiResponse<WearableDevice> update(@PathVariable Long id, @RequestBody WearableDevice device) {
        WearableDevice result = deviceService.update(id, device);
        if (result == null) {
            return ApiResponse.error(404, "Not found");
        }
        return ApiResponse.success("Updated successfully", result);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        deviceService.delete(id);
        return ApiResponse.success("Deleted successfully", null);
    }
}
