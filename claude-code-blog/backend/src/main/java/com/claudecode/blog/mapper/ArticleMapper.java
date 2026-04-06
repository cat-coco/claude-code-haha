package com.claudecode.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.claudecode.blog.dto.ArticleDTO;
import com.claudecode.blog.entity.Article;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ArticleMapper extends BaseMapper<Article> {

    /**
     * Query article list with category name and tags.
     *
     * @param page       pagination parameter
     * @param categoryId optional category filter
     * @param tagId      optional tag filter
     * @param status     optional status filter
     * @param keyword    optional keyword for title search
     * @return paginated list of ArticleDTO with categoryName and tagList populated
     */
    IPage<ArticleDTO> selectArticleList(
            Page<ArticleDTO> page,
            @Param("categoryId") Long categoryId,
            @Param("tagId") Long tagId,
            @Param("status") Integer status,
            @Param("keyword") String keyword
    );

    /**
     * Get article detail with category name and tags by article ID.
     *
     * @param id article ID
     * @return ArticleDTO with categoryName and tagList populated
     */
    ArticleDTO selectArticleDetail(@Param("id") Long id);
}
