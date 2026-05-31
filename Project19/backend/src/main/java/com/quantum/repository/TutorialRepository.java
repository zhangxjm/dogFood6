package com.quantum.repository;

import com.quantum.entity.Tutorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TutorialRepository extends JpaRepository<Tutorial, Long> {
    List<Tutorial> findByCategory(String category);
    List<Tutorial> findByDifficultyBetween(Integer minDifficulty, Integer maxDifficulty);
}
