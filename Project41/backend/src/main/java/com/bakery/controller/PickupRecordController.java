package com.bakery.controller;

import com.bakery.entity.PickupRecord;
import com.bakery.service.PickupRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/pickup")
public class PickupRecordController {

    @Autowired
    private PickupRecordService pickupRecordService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> findAll() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<PickupRecord> records = pickupRecordService.findAll();
            response.put("success", true);
            response.put("data", records);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> findById(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<PickupRecord> record = pickupRecordService.findById(id);
            response.put("success", true);
            response.put("data", record.orElse(null));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Map<String, Object>> findByOrderId(@PathVariable Long orderId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<PickupRecord> record = pickupRecordService.findByOrderId(orderId);
            response.put("success", true);
            response.put("data", record.orElse(null));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/orderNo/{orderNo}")
    public ResponseEntity<Map<String, Object>> findByOrderNo(@PathVariable String orderNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<PickupRecord> record = pickupRecordService.findByOrderNo(orderNo);
            response.put("success", true);
            response.put("data", record.orElse(null));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/code/{pickupCode}")
    public ResponseEntity<Map<String, Object>> findByPickupCode(@PathVariable String pickupCode) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<PickupRecord> record = pickupRecordService.findByPickupCode(pickupCode);
            response.put("success", true);
            response.put("data", record.orElse(null));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createPickupRecord(
            @RequestParam Long orderId,
            @RequestParam String pickupCode) {
        Map<String, Object> response = new HashMap<>();
        try {
            PickupRecord record = pickupRecordService.createPickupRecord(orderId, pickupCode);
            if (record != null) {
                response.put("success", true);
                response.put("data", record);
                response.put("message", "自提记录创建成功");
            } else {
                response.put("success", false);
                response.put("message", "订单不存在");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPickup(@RequestParam String pickupCode) {
        Map<String, Object> response = new HashMap<>();
        try {
            PickupRecord record = pickupRecordService.verifyPickup(pickupCode);
            if (record != null) {
                response.put("success", true);
                response.put("data", record);
                response.put("message", "自提核销成功");
            } else {
                response.put("success", false);
                response.put("message", "核销码无效");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> save(@RequestBody PickupRecord pickupRecord) {
        Map<String, Object> response = new HashMap<>();
        try {
            PickupRecord saved = pickupRecordService.save(pickupRecord);
            response.put("success", true);
            response.put("data", saved);
            response.put("message", "自提记录创建成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            pickupRecordService.delete(id);
            response.put("success", true);
            response.put("message", "自提记录删除成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
