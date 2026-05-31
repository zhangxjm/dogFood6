package com.bakery.service;

import com.bakery.entity.Dessert;
import com.bakery.repository.DessertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DessertService {

    @Autowired
    private DessertRepository dessertRepository;

    public List<Dessert> findAll() {
        return dessertRepository.findAll();
    }

    public List<Dessert> findAvailable() {
        return dessertRepository.findByAvailable(true);
    }

    public Optional<Dessert> findById(Long id) {
        return dessertRepository.findById(id);
    }

    public List<Dessert> findByCategory(String category) {
        return dessertRepository.findByCategory(category);
    }

    public List<Dessert> search(String keyword) {
        return dessertRepository.findByNameContaining(keyword);
    }

    public Dessert save(Dessert dessert) {
        return dessertRepository.save(dessert);
    }

    public Dessert update(Long id, Dessert dessert) {
        Optional<Dessert> existing = dessertRepository.findById(id);
        if (existing.isPresent()) {
            Dessert d = existing.get();
            d.setName(dessert.getName());
            d.setDescription(dessert.getDescription());
            d.setPrice(dessert.getPrice());
            d.setImage(dessert.getImage());
            d.setCategory(dessert.getCategory());
            d.setPrepTime(dessert.getPrepTime());
            d.setCustomizable(dessert.getCustomizable());
            d.setAvailable(dessert.getAvailable());
            return dessertRepository.save(d);
        }
        return null;
    }

    public void delete(Long id) {
        dessertRepository.deleteById(id);
    }
}
