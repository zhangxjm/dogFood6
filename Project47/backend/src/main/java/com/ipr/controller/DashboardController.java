package com.ipr.controller;

import com.ipr.entity.Evidence;
import com.ipr.entity.LegalCase;
import com.ipr.entity.Product;
import com.ipr.service.EvidenceService;
import com.ipr.service.LegalCaseService;
import com.ipr.service.MonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final MonitoringService monitoringService;
    private final EvidenceService evidenceService;
    private final LegalCaseService legalCaseService;

    public DashboardController(MonitoringService monitoringService, EvidenceService evidenceService, LegalCaseService legalCaseService) {
        this.monitoringService = monitoringService;
        this.evidenceService = evidenceService;
        this.legalCaseService = legalCaseService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();

        Map<String, Long> productStats = new HashMap<>();
        productStats.put("total", (long) monitoringService.getAllProducts().size());
        productStats.put("pending", monitoringService.getProductCountByStatus(Product.InfringementStatus.PENDING));
        productStats.put("suspected", monitoringService.getProductCountByStatus(Product.InfringementStatus.SUSPECTED));
        productStats.put("confirmed", monitoringService.getProductCountByStatus(Product.InfringementStatus.CONFIRMED));
        productStats.put("cleared", monitoringService.getProductCountByStatus(Product.InfringementStatus.CLEARED));
        summary.put("products", productStats);

        Map<String, Long> evidenceStats = new HashMap<>();
        evidenceStats.put("total", (long) evidenceService.getAllEvidence().size());
        evidenceStats.put("verified", evidenceService.getEvidenceCountByStatus(Evidence.EvidenceStatus.VERIFIED));
        evidenceStats.put("notarized", evidenceService.getEvidenceCountByStatus(Evidence.EvidenceStatus.NOTARIZED));
        summary.put("evidence", evidenceStats);

        Map<String, Long> caseStats = new HashMap<>();
        caseStats.put("total", (long) legalCaseService.getAllCases().size());
        caseStats.put("active", legalCaseService.getCaseCountByStatus(LegalCase.CaseStatus.PREPARING) +
                legalCaseService.getCaseCountByStatus(LegalCase.CaseStatus.FILED) +
                legalCaseService.getCaseCountByStatus(LegalCase.CaseStatus.HEARING));
        caseStats.put("closed", legalCaseService.getCaseCountByStatus(LegalCase.CaseStatus.CLOSED_WON) +
                legalCaseService.getCaseCountByStatus(LegalCase.CaseStatus.CLOSED_LOST) +
                legalCaseService.getCaseCountByStatus(LegalCase.CaseStatus.SETTLED));
        caseStats.put("won", legalCaseService.getCaseCountByStatus(LegalCase.CaseStatus.CLOSED_WON));
        summary.put("cases", caseStats);

        return ResponseEntity.ok(summary);
    }
}
