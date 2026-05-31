package com.inspection.controller;

import com.inspection.dto.ReportDTO;
import com.inspection.service.InspectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final InspectionService inspectionService;

    public ReportController(InspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @GetMapping("/daily")
    public ResponseEntity<ReportDTO> getDailyReport(@RequestParam(required = false) String date) {
        return ResponseEntity.ok(inspectionService.getDailyReport(date));
    }

    @GetMapping("/weekly")
    public ResponseEntity<ReportDTO> getWeeklyReport(@RequestParam(required = false) String date) {
        return ResponseEntity.ok(inspectionService.getWeeklyReport(date));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ReportDTO> getMonthlyReport(@RequestParam(required = false) String month) {
        return ResponseEntity.ok(inspectionService.getMonthlyReport(month));
    }
}
