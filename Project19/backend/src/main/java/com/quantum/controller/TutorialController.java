package com.quantum.controller;

import com.quantum.entity.Tutorial;
import com.quantum.service.TutorialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tutorials")
@CrossOrigin(origins = "*")
public class TutorialController {

    @Autowired
    private TutorialService tutorialService;

    @GetMapping
    public ResponseEntity<List<Tutorial>> getAllTutorials() {
        return ResponseEntity.ok(tutorialService.getAllTutorials());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Tutorial>> getTutorialsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(tutorialService.getTutorialsByCategory(category));
    }

    @GetMapping("/difficulty")
    public ResponseEntity<List<Tutorial>> getTutorialsByDifficulty(
            @RequestParam(defaultValue = "1") Integer min,
            @RequestParam(defaultValue = "5") Integer max) {
        return ResponseEntity.ok(tutorialService.getTutorialsByDifficulty(min, max));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tutorial> getTutorial(@PathVariable Long id) {
        return tutorialService.getTutorial(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Tutorial> createTutorial(@RequestBody Tutorial tutorial) {
        return ResponseEntity.ok(tutorialService.createTutorial(tutorial));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tutorial> updateTutorial(
            @PathVariable Long id,
            @RequestBody Tutorial tutorial) {
        return ResponseEntity.ok(tutorialService.updateTutorial(id, tutorial));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTutorial(@PathVariable Long id) {
        tutorialService.deleteTutorial(id);
        return ResponseEntity.ok().build();
    }
}
