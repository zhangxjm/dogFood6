package com.inspection.controller;

import com.inspection.entity.Camera;
import com.inspection.entity.EdgeNode;
import com.inspection.entity.VisionModel;
import com.inspection.service.DeviceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @GetMapping("/cameras")
    public ResponseEntity<List<Camera>> getAllCameras() {
        return ResponseEntity.ok(deviceService.getAllCameras());
    }

    @PostMapping("/cameras")
    public ResponseEntity<Camera> createCamera(@RequestBody Camera camera) {
        return ResponseEntity.ok(deviceService.createCamera(camera));
    }

    @PutMapping("/cameras/{id}")
    public ResponseEntity<Camera> updateCamera(@PathVariable Long id, @RequestBody Camera camera) {
        return ResponseEntity.ok(deviceService.updateCamera(id, camera));
    }

    @DeleteMapping("/cameras/{id}")
    public ResponseEntity<Void> deleteCamera(@PathVariable Long id) {
        deviceService.deleteCamera(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/edge-nodes")
    public ResponseEntity<List<EdgeNode>> getAllEdgeNodes() {
        return ResponseEntity.ok(deviceService.getAllEdgeNodes());
    }

    @GetMapping("/models")
    public ResponseEntity<List<VisionModel>> getAllModels() {
        return ResponseEntity.ok(deviceService.getAllModels());
    }

    @PostMapping("/models")
    public ResponseEntity<VisionModel> createModel(@RequestBody VisionModel model) {
        return ResponseEntity.ok(deviceService.createModel(model));
    }

    @PutMapping("/models/{id}/activate")
    public ResponseEntity<Void> activateModel(@PathVariable Long id) {
        deviceService.activateModel(id);
        return ResponseEntity.ok().build();
    }
}
