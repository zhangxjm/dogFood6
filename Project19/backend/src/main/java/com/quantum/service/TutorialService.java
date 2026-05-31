package com.quantum.service;

import com.quantum.entity.Tutorial;
import com.quantum.repository.TutorialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TutorialService {

    @Autowired
    private TutorialRepository tutorialRepository;

    public List<Tutorial> getAllTutorials() {
        return tutorialRepository.findAll();
    }

    public List<Tutorial> getTutorialsByCategory(String category) {
        return tutorialRepository.findByCategory(category);
    }

    public List<Tutorial> getTutorialsByDifficulty(Integer minDifficulty, Integer maxDifficulty) {
        return tutorialRepository.findByDifficultyBetween(minDifficulty, maxDifficulty);
    }

    public Optional<Tutorial> getTutorial(Long id) {
        return tutorialRepository.findById(id);
    }

    public Tutorial createTutorial(Tutorial tutorial) {
        return tutorialRepository.save(tutorial);
    }

    public Tutorial updateTutorial(Long id, Tutorial tutorial) {
        tutorial.setId(id);
        return tutorialRepository.save(tutorial);
    }

    public void deleteTutorial(Long id) {
        tutorialRepository.deleteById(id);
    }
}
