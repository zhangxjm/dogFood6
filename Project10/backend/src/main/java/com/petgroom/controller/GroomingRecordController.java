package com.petgroom.controller;

import com.petgroom.entity.GroomingRecord;
import com.petgroom.service.GroomingRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grooming-records")
@CrossOrigin(origins = "*")
public class GroomingRecordController {

    @Autowired
    private GroomingRecordService groomingRecordService;

    @GetMapping
    public List<GroomingRecord> getAllRecords() {
        return groomingRecordService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroomingRecord> getRecordById(@PathVariable Long id) {
        return groomingRecordService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public GroomingRecord createRecord(@RequestBody GroomingRecord record) {
        return groomingRecordService.save(record);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroomingRecord> updateRecord(@PathVariable Long id, @RequestBody GroomingRecord record) {
        return groomingRecordService.findById(id)
                .map(existing -> {
                    record.setId(id);
                    return ResponseEntity.ok(groomingRecordService.save(record));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable Long id) {
        return groomingRecordService.findById(id)
                .map(record -> {
                    groomingRecordService.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<GroomingRecord> startGrooming(@PathVariable Long id, @RequestBody GroomingRecord record) {
        return groomingRecordService.findById(id)
                .map(existing -> {
                    existing.setPetId(record.getPetId());
                    existing.setMemberId(record.getMemberId());
                    existing.setItemId(record.getItemId());
                    existing.setItemName(record.getItemName());
                    existing.setPrice(record.getPrice());
                    return ResponseEntity.ok(groomingRecordService.startGrooming(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<GroomingRecord> completeGrooming(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        GroomingRecord completed = groomingRecordService.completeGrooming(id, notes);
        if (completed != null) {
            return ResponseEntity.ok(completed);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/member/{memberId}")
    public List<GroomingRecord> getRecordsByMemberId(@PathVariable Long memberId) {
        return groomingRecordService.findByMemberId(memberId);
    }

    @GetMapping("/pet/{petId}")
    public List<GroomingRecord> getRecordsByPetId(@PathVariable Long petId) {
        return groomingRecordService.findByPetId(petId);
    }

    @GetMapping("/status/{status}")
    public List<GroomingRecord> getRecordsByStatus(@PathVariable String status) {
        return groomingRecordService.findByStatus(status);
    }

    @GetMapping("/date-range")
    public List<GroomingRecord> getRecordsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        return groomingRecordService.findByDateRange(start, end);
    }

    @GetMapping("/member/{memberId}/completed-count")
    public long getMemberCompletedCount(@PathVariable Long memberId) {
        return groomingRecordService.getMemberCompletedCount(memberId);
    }
}
