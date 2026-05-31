package com.inspection.controller;

import com.inspection.dto.InspectionRecordDTO;
import com.inspection.dto.ProductionLineStatusDTO;
import com.inspection.entity.InspectionRecord;
import com.inspection.entity.ProductionLine;
import com.inspection.service.InspectionService;
import com.inspection.service.ProductionLineService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class InspectionController {

    private final ProductionLineService lineService;
    private final InspectionService inspectionService;

    public InspectionController(ProductionLineService lineService, InspectionService inspectionService) {
        this.lineService = lineService;
        this.inspectionService = inspectionService;
    }

    @GetMapping("/production-lines")
    public ResponseEntity<List<ProductionLine>> getAllLines() {
        return ResponseEntity.ok(lineService.getAllLines());
    }

    @GetMapping("/production-lines/{id}")
    public ResponseEntity<ProductionLine> getLineById(@PathVariable Long id) {
        ProductionLine line = lineService.getLineById(id);
        return line != null ? ResponseEntity.ok(line) : ResponseEntity.notFound().build();
    }

    @PostMapping("/production-lines")
    public ResponseEntity<ProductionLine> createLine(@RequestBody ProductionLine line) {
        return ResponseEntity.ok(lineService.createLine(line));
    }

    @PutMapping("/production-lines/{id}")
    public ResponseEntity<ProductionLine> updateLine(@PathVariable Long id, @RequestBody ProductionLine line) {
        return ResponseEntity.ok(lineService.updateLine(id, line));
    }

    @DeleteMapping("/production-lines/{id}")
    public ResponseEntity<Void> deleteLine(@PathVariable Long id) {
        lineService.deleteLine(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/production-lines/status")
    public ResponseEntity<List<ProductionLineStatusDTO>> getAllLineStatuses() {
        return ResponseEntity.ok(lineService.getAllLineStatuses());
    }

    @GetMapping("/inspection-records")
    public ResponseEntity<Page<InspectionRecordDTO>> getRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String result,
            @RequestParam(required = false) Long lineId,
            @RequestParam(required = false) Long defectTypeId) {
        return ResponseEntity.ok(inspectionService.getRecords(page, size, result, lineId, defectTypeId));
    }

    @GetMapping("/inspection-records/{id}")
    public ResponseEntity<InspectionRecordDTO> getRecordById(@PathVariable Long id) {
        InspectionRecordDTO record = inspectionService.getRecordById(id);
        return record != null ? ResponseEntity.ok(record) : ResponseEntity.notFound().build();
    }

    @PostMapping("/inspection-records")
    public ResponseEntity<InspectionRecordDTO> createRecord(@RequestBody InspectionRecord record) {
        return ResponseEntity.ok(inspectionService.createRecord(record));
    }
}
