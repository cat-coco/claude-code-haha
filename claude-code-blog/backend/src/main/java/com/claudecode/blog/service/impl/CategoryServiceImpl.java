package com.claudecode.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.claudecode.blog.entity.Category;
import com.claudecode.blog.mapper.CategoryMapper;
import com.claudecode.blog.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryMapper categoryMapper;

    @Override
    public List<Category> listAll() {
        QueryWrapper<Category> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByAsc("sort_order");
        return categoryMapper.selectList(queryWrapper);
    }

    @Override
    public List<Map<String, Object>> getCategoryTree() {
        List<Category> allCategories = listAll();

        // Group categories by parentId
        Map<Long, List<Category>> groupedByParent = allCategories.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getParentId() == null ? 0L : c.getParentId()
                ));

        // Get top-level categories (parentId = 0 or null)
        List<Category> topLevel = groupedByParent.getOrDefault(0L, new ArrayList<>());

        // Assemble tree structure with "category" and "children" keys
        return topLevel.stream().map(category -> {
            Map<String, Object> node = new HashMap<>();
            node.put("category", category);
            node.put("children", groupedByParent.getOrDefault(category.getId(), new ArrayList<>()));
            return node;
        }).collect(Collectors.toList());
    }

    @Override
    public Category getById(Long id) {
        return categoryMapper.selectById(id);
    }

    @Override
    public void save(Category category) {
        categoryMapper.insert(category);
    }

    @Override
    public void update(Category category) {
        categoryMapper.updateById(category);
    }

    @Override
    public void delete(Long id) {
        categoryMapper.deleteById(id);
    }
}
