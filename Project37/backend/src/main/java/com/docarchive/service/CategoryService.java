package com.docarchive.service;

import com.docarchive.entity.Category;
import com.docarchive.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> findAll() {
        return categoryRepository.findAllByOrderBySortOrderAsc();
    }

    public List<Category> findByParentId(Long parentId) {
        return categoryRepository.findByParentIdOrderBySortOrderAsc(parentId);
    }

    public Optional<Category> findById(Long id) {
        return categoryRepository.findById(id);
    }

    public Category save(Category category) {
        return categoryRepository.save(category);
    }

    public void deleteById(Long id) {
        categoryRepository.deleteById(id);
    }
}
