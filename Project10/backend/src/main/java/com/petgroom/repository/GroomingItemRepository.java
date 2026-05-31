package com.petgroom.repository;

import com.petgroom.entity.GroomingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroomingItemRepository extends JpaRepository<GroomingItem, Long> {
    List<GroomingItem> findByIsActiveTrue();
}
