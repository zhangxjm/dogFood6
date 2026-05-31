package com.petgroom.service;

import com.petgroom.entity.GroomingItem;
import com.petgroom.repository.GroomingItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GroomingItemService {

    @Autowired
    private GroomingItemRepository groomingItemRepository;

    public List<GroomingItem> findAll() {
        return groomingItemRepository.findAll();
    }

    public List<GroomingItem> findActive() {
        return groomingItemRepository.findByIsActiveTrue();
    }

    public Optional<GroomingItem> findById(Long id) {
        return groomingItemRepository.findById(id);
    }

    public GroomingItem save(GroomingItem item) {
        if (item.getIsActive() == null) {
            item.setIsActive(true);
        }
        return groomingItemRepository.save(item);
    }

    public void deleteById(Long id) {
        groomingItemRepository.deleteById(id);
    }
}
