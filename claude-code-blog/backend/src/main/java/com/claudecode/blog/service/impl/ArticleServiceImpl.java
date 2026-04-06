package com.claudecode.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.claudecode.blog.dto.ArticleDTO;
import com.claudecode.blog.dto.ArticleSaveDTO;
import com.claudecode.blog.dto.PageResult;
import com.claudecode.blog.entity.Article;
import com.claudecode.blog.entity.ArticleTag;
import com.claudecode.blog.entity.Category;
import com.claudecode.blog.entity.Tag;
import com.claudecode.blog.mapper.ArticleMapper;
import com.claudecode.blog.mapper.ArticleTagMapper;
import com.claudecode.blog.mapper.CategoryMapper;
import com.claudecode.blog.mapper.TagMapper;
import com.claudecode.blog.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {

    private final ArticleMapper articleMapper;
    private final ArticleTagMapper articleTagMapper;
    private final TagMapper tagMapper;
    private final CategoryMapper categoryMapper;

    @Override
    public Page<Article> page(int page, int pageSize, Long categoryId, String keyword, Integer status) {
        Page<Article> pageParam = new Page<>(page, pageSize);
        QueryWrapper<Article> queryWrapper = new QueryWrapper<>();

        if (categoryId != null) {
            queryWrapper.eq("category_id", categoryId);
        }
        if (keyword != null && !keyword.isEmpty()) {
            queryWrapper.like("title", keyword);
        }
        if (status != null) {
            queryWrapper.eq("status", status);
        }

        queryWrapper.orderByDesc("is_top", "published_at");

        Page<Article> result = articleMapper.selectPage(pageParam, queryWrapper);

        // Populate categoryName and tagList for each article
        for (Article article : result.getRecords()) {
            populateArticleExtras(article);
        }

        return result;
    }

    @Override
    public Article getById(Long id) {
        Article article = articleMapper.selectById(id);
        if (article != null) {
            populateArticleExtras(article);
        }
        return article;
    }

    @Override
    public Article getBySlug(String slug) {
        QueryWrapper<Article> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("slug", slug);
        Article article = articleMapper.selectOne(queryWrapper);
        if (article != null) {
            populateArticleExtras(article);
        }
        return article;
    }

    @Override
    @Transactional
    public void save(ArticleSaveDTO dto) {
        Article article = new Article();
        copyDtoToArticle(dto, article);

        // Calculate wordCount and readTime
        if (dto.getContent() != null) {
            int wordCount = dto.getContent().length();
            article.setWordCount(wordCount);
            article.setReadTime(Math.max(1, wordCount / 300));
        }

        // Set publishedAt if status is published (1)
        if (dto.getStatus() != null && dto.getStatus() == 1) {
            article.setPublishedAt(LocalDateTime.now());
        }

        articleMapper.insert(article);

        // Insert ArticleTag records
        if (dto.getTagIds() != null && !dto.getTagIds().isEmpty()) {
            for (Long tagId : dto.getTagIds()) {
                ArticleTag articleTag = new ArticleTag();
                articleTag.setArticleId(article.getId());
                articleTag.setTagId(tagId);
                articleTagMapper.insert(articleTag);
            }
        }

        // Update category articleCount
        if (dto.getCategoryId() != null) {
            updateCategoryArticleCount(dto.getCategoryId(), 1);
        }
    }

    @Override
    @Transactional
    public void update(Long id, ArticleSaveDTO dto) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new RuntimeException("Article not found");
        }

        Long oldCategoryId = article.getCategoryId();
        copyDtoToArticle(dto, article);

        // Recalculate wordCount and readTime
        if (dto.getContent() != null) {
            int wordCount = dto.getContent().length();
            article.setWordCount(wordCount);
            article.setReadTime(Math.max(1, wordCount / 300));
        }

        // Set publishedAt if newly published
        if (dto.getStatus() != null && dto.getStatus() == 1 && article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }

        articleMapper.updateById(article);

        // Delete old ArticleTag records and insert new ones
        QueryWrapper<ArticleTag> tagDeleteWrapper = new QueryWrapper<>();
        tagDeleteWrapper.eq("article_id", id);
        articleTagMapper.delete(tagDeleteWrapper);

        if (dto.getTagIds() != null && !dto.getTagIds().isEmpty()) {
            for (Long tagId : dto.getTagIds()) {
                ArticleTag articleTag = new ArticleTag();
                articleTag.setArticleId(id);
                articleTag.setTagId(tagId);
                articleTagMapper.insert(articleTag);
            }
        }

        // Update category articleCount if category changed
        if (dto.getCategoryId() != null && !dto.getCategoryId().equals(oldCategoryId)) {
            if (oldCategoryId != null) {
                updateCategoryArticleCount(oldCategoryId, -1);
            }
            updateCategoryArticleCount(dto.getCategoryId(), 1);
        }
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            return;
        }

        // Logical delete
        articleMapper.deleteById(id);

        // Update category articleCount
        if (article.getCategoryId() != null) {
            updateCategoryArticleCount(article.getCategoryId(), -1);
        }
    }

    @Override
    public void incrementViewCount(Long id) {
        UpdateWrapper<Article> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("id", id)
                .setSql("view_count = view_count + 1");
        articleMapper.update(null, updateWrapper);
    }

    @Override
    public List<Article> listRecommended(int limit) {
        QueryWrapper<Article> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("is_recommended", 1)
                .eq("status", 1)
                .orderByDesc("view_count")
                .last("LIMIT " + limit);
        List<Article> articles = articleMapper.selectList(queryWrapper);
        articles.forEach(this::populateArticleExtras);
        return articles;
    }

    @Override
    public List<Article> listByCategory(Long categoryId, int limit) {
        QueryWrapper<Article> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("category_id", categoryId)
                .eq("status", 1)
                .orderByAsc("sort_order")
                .orderByDesc("published_at")
                .last("LIMIT " + limit);
        List<Article> articles = articleMapper.selectList(queryWrapper);
        articles.forEach(this::populateArticleExtras);
        return articles;
    }

    private void populateArticleExtras(Article article) {
        // Populate category name
        if (article.getCategoryId() != null) {
            Category category = categoryMapper.selectById(article.getCategoryId());
            if (category != null) {
                // Store categoryName in article's author field temporarily is not ideal,
                // so we rely on the caller or DTO conversion to handle this.
                // The ArticleMapper.selectArticleDetail handles this via SQL join.
            }
        }
    }

    private void copyDtoToArticle(ArticleSaveDTO dto, Article article) {
        article.setTitle(dto.getTitle());
        article.setSlug(dto.getSlug());
        article.setSummary(dto.getSummary());
        article.setContent(dto.getContent());
        article.setCategoryId(dto.getCategoryId());
        article.setCoverImage(dto.getCoverImage());
        article.setSourceFile(dto.getSourceFile());
        article.setStatus(dto.getStatus());
        if (dto.getDifficulty() != null) {
            article.setDifficulty(Integer.parseInt(dto.getDifficulty()));
        }
        if (dto.getIsTop() != null) {
            article.setIsTop(dto.getIsTop() ? 1 : 0);
        }
        if (dto.getIsRecommended() != null) {
            article.setIsRecommended(dto.getIsRecommended() ? 1 : 0);
        }
    }

    @Override
    public PageResult<ArticleDTO> listArticles(int page, int pageSize, Long categoryId, String keyword) {
        Page<Article> result = page(page, pageSize, categoryId, keyword, 1);
        List<ArticleDTO> dtoList = result.getRecords().stream().map(this::toDTO).collect(Collectors.toList());
        return new PageResult<>(dtoList, result.getTotal(), result.getCurrent(), result.getSize());
    }

    @Override
    public ArticleDTO getArticleById(Long id) {
        return toDTO(getById(id));
    }

    @Override
    public ArticleDTO getArticleBySlug(String slug) {
        return toDTO(getBySlug(slug));
    }

    @Override
    public PageResult<ArticleDTO> listAdminArticles(int page, int pageSize, Long categoryId, String keyword, Integer status) {
        Page<Article> result = page(page, pageSize, categoryId, keyword, status);
        List<ArticleDTO> dtoList = result.getRecords().stream().map(this::toDTO).collect(Collectors.toList());
        return new PageResult<>(dtoList, result.getTotal(), result.getCurrent(), result.getSize());
    }

    @Override
    @Transactional
    public ArticleDTO saveArticle(ArticleSaveDTO dto) {
        save(dto);
        return null;
    }

    @Override
    @Transactional
    public ArticleDTO updateArticle(ArticleSaveDTO dto) {
        update(dto.getId(), dto);
        return toDTO(getById(dto.getId()));
    }

    @Override
    @Transactional
    public void deleteArticle(Long id) {
        delete(id);
    }

    @Override
    public void toggleTop(Long id) {
        Article article = articleMapper.selectById(id);
        if (article != null) {
            article.setIsTop(article.getIsTop() == null || article.getIsTop() == 0 ? 1 : 0);
            articleMapper.updateById(article);
        }
    }

    @Override
    public void toggleRecommended(Long id) {
        Article article = articleMapper.selectById(id);
        if (article != null) {
            article.setIsRecommended(article.getIsRecommended() == null || article.getIsRecommended() == 0 ? 1 : 0);
            articleMapper.updateById(article);
        }
    }

    private ArticleDTO toDTO(Article article) {
        if (article == null) return null;
        ArticleDTO dto = new ArticleDTO();
        dto.setId(article.getId());
        dto.setTitle(article.getTitle());
        dto.setSlug(article.getSlug());
        dto.setSummary(article.getSummary());
        dto.setContent(article.getContent());
        dto.setContentHtml(article.getContentHtml());
        dto.setCoverImage(article.getCoverImage());
        dto.setCategoryId(article.getCategoryId());
        dto.setAuthor(article.getAuthor());
        dto.setSourceFile(article.getSourceFile());
        dto.setDifficulty(article.getDifficulty() != null ? String.valueOf(article.getDifficulty()) : null);
        dto.setIsTop(article.getIsTop() != null && article.getIsTop() == 1);
        dto.setIsRecommended(article.getIsRecommended() != null && article.getIsRecommended() == 1);
        dto.setStatus(article.getStatus());
        dto.setViewCount(article.getViewCount() != null ? article.getViewCount().intValue() : 0);
        dto.setLikeCount(article.getLikeCount() != null ? article.getLikeCount().intValue() : 0);
        dto.setCommentCount(article.getCommentCount());
        dto.setWordCount(article.getWordCount());
        dto.setReadTime(article.getReadTime());
        dto.setSortOrder(article.getSortOrder());
        dto.setPublishedAt(article.getPublishedAt());
        dto.setCreatedAt(article.getCreatedAt());
        dto.setUpdatedAt(article.getUpdatedAt());
        // Populate category name
        if (article.getCategoryId() != null) {
            Category category = categoryMapper.selectById(article.getCategoryId());
            if (category != null) {
                dto.setCategoryName(category.getName());
            }
        }
        // Populate tags
        QueryWrapper<ArticleTag> atQuery = new QueryWrapper<>();
        atQuery.eq("article_id", article.getId());
        List<ArticleTag> articleTags = articleTagMapper.selectList(atQuery);
        if (!articleTags.isEmpty()) {
            List<Long> tagIds = articleTags.stream().map(ArticleTag::getTagId).collect(Collectors.toList());
            dto.setTagList(tagMapper.selectBatchIds(tagIds));
        }
        return dto;
    }

    private void updateCategoryArticleCount(Long categoryId, int delta) {
        UpdateWrapper<Category> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("id", categoryId)
                .setSql("article_count = article_count + " + delta);
        categoryMapper.update(null, updateWrapper);
    }
}
