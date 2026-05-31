package com.ipr.controller;

import com.ipr.entity.CopyrightWork;
import com.ipr.service.CopyrightWorkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/copyright")
public class CopyrightWorkController {

    private final CopyrightWorkService copyrightWorkService;

    public CopyrightWorkController(CopyrightWorkService copyrightWorkService) {
        this.copyrightWorkService = copyrightWorkService;
    }

    @GetMapping
    public ResponseEntity<List<CopyrightWork>> getAllWorks() {
        return ResponseEntity.ok(copyrightWorkService.getAllWorks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CopyrightWork> getWorkById(@PathVariable Long id) {
        CopyrightWork work = copyrightWorkService.getWorkById(id);
        return work != null ? ResponseEntity.ok(work) : ResponseEntity.notFound().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CopyrightWork>> getWorksByStatus(@PathVariable CopyrightWork.WorkStatus status) {
        return ResponseEntity.ok(copyrightWorkService.getWorksByStatus(status));
    }

    @PostMapping
    public ResponseEntity<CopyrightWork> addWork(@RequestBody CopyrightWork work) {
        return ResponseEntity.ok(copyrightWorkService.addWork(work));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CopyrightWork> updateWork(@PathVariable Long id, @RequestBody CopyrightWork work) {
        CopyrightWork updated = copyrightWorkService.updateWork(id, work);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CopyrightWork> updateWorkStatus(
            @PathVariable Long id,
            @RequestParam CopyrightWork.WorkStatus status) {
        CopyrightWork updated = copyrightWorkService.updateWorkStatus(id, status);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWork(@PathVariable Long id) {
        copyrightWorkService.deleteWork(id);
        return ResponseEntity.ok().build();
    }
}
