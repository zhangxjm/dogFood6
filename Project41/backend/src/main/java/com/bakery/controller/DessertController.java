package com.bakery.controller;

import com.bakery.entity.Dessert;
import com.bakery.service.DessertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/desserts")
public class DessertController {

    @Autowired
    private DessertService dessertService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> findAll() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Dessert> desserts = dessertService.findAll();
            response.put("success", true);
            response.put("data", desserts);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/available")
    public ResponseEntity<Map<String, Object>> findAvailable() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Dessert> desserts = dessertService.findAvailable();
            response.put("success", true);
            response.put("data", desserts);
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
            Optional<Dessert> dessert = dessertService.findById(id);
            response.put("success", true);
            response.put("data", dessert.orElse(null));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<Map<String, Object>> findByCategory(@PathVariable String category) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Dessert> desserts = dessertService.findByCategory(category);
            response.put("success", true);
            response.put("data", desserts);
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
            List<Dessert> desserts = dessertService.search(keyword);
            response.put("success", true);
            response.put("data", desserts);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> save(@RequestBody Dessert dessert) {
        Map<String, Object> response = new HashMap<>();
        try {
            Dessert saved = dessertService.save(dessert);
            response.put("success", true);
            response.put("data", saved);
            response.put("message", "甜品创建成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody Dessert dessert) {
        Map<String, Object> response = new HashMap<>();
        try {
            Dessert updated = dessertService.update(id, dessert);
            response.put("success", true);
            response.put("data", updated);
            response.put("message", "甜品更新成功");
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
            dessertService.delete(id);
            response.put("success", true);
            response.put("message", "甜品删除成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
