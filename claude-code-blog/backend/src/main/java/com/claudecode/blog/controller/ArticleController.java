package com.claudecode.blog.controller;

import com.claudecode.blog.dto.ArticleDTO;
import com.claudecode.blog.dto.PageResult;
import com.claudecode.blog.dto.Result;
import com.claudecode.blog.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/article")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping("/list")
    public Result<PageResult<ArticleDTO>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        return Result.success(articleService.listArticles(page, pageSize, categoryId, keyword));
    }

    @GetMapping("/detail/{id}")
    public Result<ArticleDTO> detail(@PathVariable Long id) {
        articleService.incrementViewCount(id);
        return Result.success(articleService.getArticleById(id));
    }

    @GetMapping("/slug/{slug}")
    public Result<ArticleDTO> getBySlug(@PathVariable String slug) {
        ArticleDTO article = articleService.getArticleBySlug(slug);
        articleService.incrementViewCount(article.getId());
        return Result.success(article);
    }

    @GetMapping("/recommended")
    public Result<?> listRecommended(@RequestParam(defaultValue = "6") int limit) {
        return Result.success(articleService.listRecommended(limit));
    }

    @GetMapping("/category/{categoryId}")
    public Result<?> listByCategory(@PathVariable Long categoryId,
                                    @RequestParam(defaultValue = "10") int limit) {
        return Result.success(articleService.listByCategory(categoryId, limit));
    }
}
