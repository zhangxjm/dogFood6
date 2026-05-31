package com.bakery.controller;

import com.bakery.entity.ProgressRecord;
import com.bakery.service.ProgressRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/progress")
public class ProgressRecordController {

    @Autowired
    private ProgressRecordService progressRecordService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> findAll() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<ProgressRecord> records = progressRecordService.findAll();
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
            Optional<ProgressRecord> record = progressRecordService.findById(id);
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
            List<ProgressRecord> records = progressRecordService.findByOrderId(orderId);
            response.put("success", true);
            response.put("data", records);
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
            List<ProgressRecord> records = progressRecordService.findByOrderNo(orderNo);
            response.put("success", true);
            response.put("data", records);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> save(@RequestBody ProgressRecord progressRecord) {
        Map<String, Object> response = new HashMap<>();
        try {
            ProgressRecord saved = progressRecordService.save(progressRecord);
            response.put("success", true);
            response.put("data", saved);
            response.put("message", "进度记录创建成功");
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
            progressRecordService.delete(id);
            response.put("success", true);
            response.put("message", "进度记录删除成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
