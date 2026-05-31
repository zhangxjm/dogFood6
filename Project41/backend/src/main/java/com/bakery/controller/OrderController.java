package com.bakery.controller;

import com.bakery.entity.Order;
import com.bakery.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> findAll() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Order> orders = orderService.findAll();
            response.put("success", true);
            response.put("data", orders);
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
            Optional<Order> order = orderService.findById(id);
            response.put("success", true);
            response.put("data", order.orElse(null));
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
            Optional<Order> order = orderService.findByOrderNo(orderNo);
            response.put("success", true);
            response.put("data", order.orElse(null));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> findByStatus(@PathVariable String status) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Order> orders = orderService.findByStatus(status);
            response.put("success", true);
            response.put("data", orders);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/progress/{progressStatus}")
    public ResponseEntity<Map<String, Object>> findByProgressStatus(@PathVariable String progressStatus) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Order> orders = orderService.findByProgressStatus(progressStatus);
            response.put("success", true);
            response.put("data", orders);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@RequestParam String keyword) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Order> orders = orderService.search(keyword);
            response.put("success", true);
            response.put("data", orders);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> save(@RequestBody Order order) {
        Map<String, Object> response = new HashMap<>();
        try {
            Order saved = orderService.save(order);
            response.put("success", true);
            response.put("data", saved);
            response.put("message", "订单创建成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long id, @RequestParam String status) {
        Map<String, Object> response = new HashMap<>();
        try {
            Order updated = orderService.updateStatus(id, status);
            response.put("success", true);
            response.put("data", updated);
            response.put("message", "订单状态更新成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<Map<String, Object>> updateProgress(
            @PathVariable Long id,
            @RequestParam String progressStatus,
            @RequestParam(required = false) String remark) {
        Map<String, Object> response = new HashMap<>();
        try {
            Order updated = orderService.updateProgress(id, progressStatus, remark);
            response.put("success", true);
            response.put("data", updated);
            response.put("message", "制作进度更新成功");
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
            orderService.delete(id);
            response.put("success", true);
            response.put("message", "订单删除成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/pickup-code")
    public ResponseEntity<Map<String, Object>> generatePickupCode() {
        Map<String, Object> response = new HashMap<>();
        try {
            String code = orderService.generatePickupCode();
            response.put("success", true);
            response.put("data", code);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
