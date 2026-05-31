package com.docarchive.repository;

import com.docarchive.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByParentIdOrderBySortOrderAsc(Long parentId);
    List<Category> findAllByOrderBySortOrderAsc();
}
