package com.inspection.controller;

import com.inspection.dto.SortingStatisticsDTO;
import com.inspection.entity.SortingExecution;
import com.inspection.entity.SortingRule;
import com.inspection.service.SortingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SortingController {

    private final SortingService sortingService;

    public SortingController(SortingService sortingService) {
        this.sortingService = sortingService;
    }

    @GetMapping("/sorting-rules")
    public ResponseEntity<List<SortingRule>> getAllRules() {
        return ResponseEntity.ok(sortingService.getAllRules());
    }

    @PostMapping("/sorting-rules")
    public ResponseEntity<SortingRule> createRule(@RequestBody SortingRule rule) {
        return ResponseEntity.ok(sortingService.createRule(rule));
    }

    @PutMapping("/sorting-rules/{id}")
    public ResponseEntity<SortingRule> updateRule(@PathVariable Long id, @RequestBody SortingRule rule) {
        return ResponseEntity.ok(sortingService.updateRule(id, rule));
    }

    @DeleteMapping("/sorting-rules/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        sortingService.deleteRule(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/sorting-executions")
    public ResponseEntity<List<SortingExecution>> getExecutions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(sortingService.getExecutions(page, size));
    }

    @GetMapping("/sorting/statistics")
    public ResponseEntity<SortingStatisticsDTO> getStatistics() {
        return ResponseEntity.ok(sortingService.getStatistics());
    }
}
