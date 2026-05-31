package com.petgroom.controller;

import com.petgroom.entity.GroomingItem;
import com.petgroom.service.GroomingItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grooming-items")
@CrossOrigin(origins = "*")
public class GroomingItemController {

    @Autowired
    private GroomingItemService groomingItemService;

    @GetMapping
    public List<GroomingItem> getAllItems() {
        return groomingItemService.findAll();
    }

    @GetMapping("/active")
    public List<GroomingItem> getActiveItems() {
        return groomingItemService.findActive();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroomingItem> getItemById(@PathVariable Long id) {
        return groomingItemService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public GroomingItem createItem(@RequestBody GroomingItem item) {
        return groomingItemService.save(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroomingItem> updateItem(@PathVariable Long id, @RequestBody GroomingItem item) {
        return groomingItemService.findById(id)
                .map(existing -> {
                    item.setId(id);
                    return ResponseEntity.ok(groomingItemService.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        return groomingItemService.findById(id)
                .map(item -> {
                    groomingItemService.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
