package com.ipr.controller;

import com.ipr.entity.LegalCase;
import com.ipr.service.LegalCaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases")
public class LegalCaseController {

    private final LegalCaseService legalCaseService;

    public LegalCaseController(LegalCaseService legalCaseService) {
        this.legalCaseService = legalCaseService;
    }

    @GetMapping
    public ResponseEntity<List<LegalCase>> getAllCases() {
        return ResponseEntity.ok(legalCaseService.getAllCases());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LegalCase> getCaseById(@PathVariable Long id) {
        LegalCase legalCase = legalCaseService.getCaseById(id);
        return legalCase != null ? ResponseEntity.ok(legalCase) : ResponseEntity.notFound().build();
    }

    @GetMapping("/number/{caseNumber}")
    public ResponseEntity<LegalCase> getCaseByNumber(@PathVariable String caseNumber) {
        LegalCase legalCase = legalCaseService.getCaseByNumber(caseNumber);
        return legalCase != null ? ResponseEntity.ok(legalCase) : ResponseEntity.notFound().build();
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<LegalCase>> getCasesByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(legalCaseService.getCasesByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<LegalCase> createCase(@RequestBody LegalCase legalCase) {
        return ResponseEntity.ok(legalCaseService.createCase(legalCase));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LegalCase> updateCase(@PathVariable Long id, @RequestBody LegalCase legalCase) {
        LegalCase updated = legalCaseService.updateCase(id, legalCase);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<LegalCase> updateCaseStatus(
            @PathVariable Long id,
            @RequestParam LegalCase.CaseStatus status) {
        LegalCase updated = legalCaseService.updateCaseStatus(id, status);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCase(@PathVariable Long id) {
        legalCaseService.deleteCase(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("draft", legalCaseService.getCaseCountByStatus(LegalCase.CaseStatus.DRAFT));
        stats.put("preparing", legalCaseService.getCaseCountByStatus(LegalCase.CaseStatus.PREPARING));
        stats.put("filed", legalCaseService.getCaseCountByStatus(LegalCase.CaseStatus.FILED));
        stats.put("hearing", legalCaseService.getCaseCountByStatus(LegalCase.CaseStatus.HEARING));
        stats.put("judgement", legalCaseService.getCaseCountByStatus(LegalCase.CaseStatus.JUDGEMENT));
        stats.put("closed_won", legalCaseService.getCaseCountByStatus(LegalCase.CaseStatus.CLOSED_WON));
        stats.put("closed_lost", legalCaseService.getCaseCountByStatus(LegalCase.CaseStatus.CLOSED_LOST));
        stats.put("settled", legalCaseService.getCaseCountByStatus(LegalCase.CaseStatus.SETTLED));
        return ResponseEntity.ok(stats);
    }
}
