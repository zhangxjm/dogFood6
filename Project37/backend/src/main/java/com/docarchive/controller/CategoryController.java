package com.docarchive.controller;

import com.docarchive.common.Result;
import com.docarchive.entity.Category;
import com.docarchive.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public Result<List<Category>> getAllCategories() {
        return Result.success(categoryService.findAll());
    }

    @GetMapping("/parent/{parentId}")
    public Result<List<Category>> getCategoriesByParentId(@PathVariable Long parentId) {
        return Result.success(categoryService.findByParentId(parentId));
    }

    @GetMapping("/{id}")
    public Result<Category> getCategoryById(@PathVariable Long id) {
        return categoryService.findById(id)
                .map(Result::success)
                .orElse(Result.error("分类不存在"));
    }

    @PostMapping
    public Result<Category> createCategory(@RequestBody Category category, Authentication authentication) {
        category.setCreateBy(authentication.getName());
        return Result.success("创建成功", categoryService.save(category));
    }

    @PutMapping("/{id}")
    public Result<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        return categoryService.findById(id)
                .map(existing -> {
                    existing.setName(category.getName());
                    existing.setDescription(category.getDescription());
                    existing.setParentId(category.getParentId());
                    existing.setSortOrder(category.getSortOrder());
                    return Result.success("更新成功", categoryService.save(existing));
                })
                .orElse(Result.error("分类不存在"));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteById(id);
        return Result.success();
    }
}
