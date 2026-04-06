package com.claudecode.blog.service;

import com.claudecode.blog.entity.Category;

import java.util.List;
import java.util.Map;

public interface CategoryService {

    List<Category> listAll();

    List<Map<String, Object>> getCategoryTree();

    Category getById(Long id);

    void save(Category category);

    void update(Category category);

    void delete(Long id);
}
