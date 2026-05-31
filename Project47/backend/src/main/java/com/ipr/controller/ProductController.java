package com.ipr.controller;

import com.ipr.entity.Product;
import com.ipr.service.MonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final MonitoringService monitoringService;

    public ProductController(MonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(monitoringService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = monitoringService.getProductById(id);
        return product != null ? ResponseEntity.ok(product) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        return ResponseEntity.ok(monitoringService.addProduct(product));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Product> updateProductStatus(
            @PathVariable Long id,
            @RequestParam Product.InfringementStatus status) {
        Product updated = monitoringService.updateProductStatus(id, status);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        monitoringService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Product>> getProductsByStatus(@PathVariable Product.InfringementStatus status) {
        return ResponseEntity.ok(monitoringService.getProductsByStatus(status));
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("pending", monitoringService.getProductCountByStatus(Product.InfringementStatus.PENDING));
        stats.put("suspected", monitoringService.getProductCountByStatus(Product.InfringementStatus.SUSPECTED));
        stats.put("confirmed", monitoringService.getProductCountByStatus(Product.InfringementStatus.CONFIRMED));
        stats.put("cleared", monitoringService.getProductCountByStatus(Product.InfringementStatus.CLEARED));
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<Void> analyzeProduct(@PathVariable Long id) {
        monitoringService.analyzeProduct(id);
        return ResponseEntity.ok().build();
    }
}
