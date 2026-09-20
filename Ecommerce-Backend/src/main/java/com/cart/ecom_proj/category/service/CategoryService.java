package com.cart.ecom_proj.category.service;

import com.cart.ecom_proj.category.model.Category;
import com.cart.ecom_proj.category.repo.CategoryRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepo repo;

    public List<Category> getAllCategories() {
        return repo.findAll();
    }

    public Category getCategoryById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    public Category createCategory(Category category) {
        return repo.save(category);
    }

    public Category updateCategory(Long id, Category category) {
        Category existing = getCategoryById(id);
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        return repo.save(existing);
    }

    public void deleteCategory(Long id) {
        Category existing = getCategoryById(id);
        repo.delete(existing);
    }
}
