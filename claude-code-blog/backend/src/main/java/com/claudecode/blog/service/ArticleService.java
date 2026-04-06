package com.claudecode.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.claudecode.blog.dto.ArticleDTO;
import com.claudecode.blog.dto.ArticleSaveDTO;
import com.claudecode.blog.dto.PageResult;
import com.claudecode.blog.entity.Article;

import java.util.List;

public interface ArticleService {

    Page<Article> page(int page, int pageSize, Long categoryId, String keyword, Integer status);

    Article getById(Long id);

    Article getBySlug(String slug);

    void save(ArticleSaveDTO dto);

    void update(Long id, ArticleSaveDTO dto);

    void delete(Long id);

    void incrementViewCount(Long id);

    List<Article> listRecommended(int limit);

    List<Article> listByCategory(Long categoryId, int limit);

    PageResult<ArticleDTO> listArticles(int page, int pageSize, Long categoryId, String keyword);

    ArticleDTO getArticleById(Long id);

    ArticleDTO getArticleBySlug(String slug);

    PageResult<ArticleDTO> listAdminArticles(int page, int pageSize, Long categoryId, String keyword, Integer status);

    ArticleDTO saveArticle(ArticleSaveDTO dto);

    ArticleDTO updateArticle(ArticleSaveDTO dto);

    void deleteArticle(Long id);

    void toggleTop(Long id);

    void toggleRecommended(Long id);
}
