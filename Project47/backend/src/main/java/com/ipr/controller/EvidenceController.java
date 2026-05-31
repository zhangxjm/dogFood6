package com.ipr.controller;

import com.ipr.entity.Evidence;
import com.ipr.service.EvidenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evidence")
public class EvidenceController {

    private final EvidenceService evidenceService;

    public EvidenceController(EvidenceService evidenceService) {
        this.evidenceService = evidenceService;
    }

    @GetMapping
    public ResponseEntity<List<Evidence>> getAllEvidence() {
        return ResponseEntity.ok(evidenceService.getAllEvidence());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evidence> getEvidenceById(@PathVariable Long id) {
        Evidence evidence = evidenceService.getEvidenceById(id);
        return evidence != null ? ResponseEntity.ok(evidence) : ResponseEntity.notFound().build();
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Evidence>> getEvidenceByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(evidenceService.getEvidenceByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<Evidence> addEvidence(@RequestBody Evidence evidence) {
        return ResponseEntity.ok(evidenceService.addEvidence(evidence));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Evidence> updateEvidenceStatus(
            @PathVariable Long id,
            @RequestParam Evidence.EvidenceStatus status) {
        Evidence updated = evidenceService.updateEvidenceStatus(id, status);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvidence(@PathVariable Long id) {
        evidenceService.deleteEvidence(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/collect/{productId}")
    public ResponseEntity<Void> collectEvidence(
            @PathVariable Long productId,
            @RequestParam String productName,
            @RequestParam String platform) {
        evidenceService.collectEvidence(productId, productName, platform);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("collected", evidenceService.getEvidenceCountByStatus(Evidence.EvidenceStatus.COLLECTED));
        stats.put("verifying", evidenceService.getEvidenceCountByStatus(Evidence.EvidenceStatus.VERIFYING));
        stats.put("verified", evidenceService.getEvidenceCountByStatus(Evidence.EvidenceStatus.VERIFIED));
        stats.put("notarized", evidenceService.getEvidenceCountByStatus(Evidence.EvidenceStatus.NOTARIZED));
        stats.put("rejected", evidenceService.getEvidenceCountByStatus(Evidence.EvidenceStatus.REJECTED));
        return ResponseEntity.ok(stats);
    }
}
