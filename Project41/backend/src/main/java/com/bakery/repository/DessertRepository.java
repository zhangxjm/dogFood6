package com.bakery.repository;

import com.bakery.entity.Dessert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DessertRepository extends JpaRepository<Dessert, Long> {
    List<Dessert> findByAvailable(Boolean available);
    List<Dessert> findByCategory(String category);
    List<Dessert> findByNameContaining(String keyword);
}
