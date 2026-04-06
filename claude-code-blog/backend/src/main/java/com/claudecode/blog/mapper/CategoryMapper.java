package com.claudecode.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.claudecode.blog.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CategoryMapper extends BaseMapper<Category> {

    /**
     * Get all categories with their children organized as a tree structure.
     * Returns top-level categories (parentId = 0) with children populated.
     */
    @Select("SELECT * FROM category WHERE deleted = 0 ORDER BY sort_order ASC, id ASC")
    List<Category> selectCategoriesWithChildren();
}
