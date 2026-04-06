package com.claudecode.blog.controller;

import com.claudecode.blog.dto.ArticleDTO;
import com.claudecode.blog.dto.ArticleSaveDTO;
import com.claudecode.blog.dto.PageResult;
import com.claudecode.blog.dto.Result;
import com.claudecode.blog.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/article")
@RequiredArgsConstructor
public class AdminArticleController {

    private final ArticleService articleService;

    @GetMapping("/list")
    public Result<PageResult<ArticleDTO>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        return Result.success(articleService.listAdminArticles(page, pageSize, categoryId, keyword, status));
    }

    @PostMapping("/save")
    public Result<?> save(@RequestBody ArticleSaveDTO articleSaveDTO) {
        return Result.success(articleService.saveArticle(articleSaveDTO));
    }

    @PutMapping("/update/{id}")
    public Result<?> update(@PathVariable Long id, @RequestBody ArticleSaveDTO articleSaveDTO) {
        articleSaveDTO.setId(id);
        return Result.success(articleService.updateArticle(articleSaveDTO));
    }

    @DeleteMapping("/delete/{id}")
    public Result<?> delete(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return Result.success();
    }

    @PostMapping("/top/{id}")
    public Result<?> toggleTop(@PathVariable Long id) {
        articleService.toggleTop(id);
        return Result.success();
    }

    @PostMapping("/recommend/{id}")
    public Result<?> toggleRecommend(@PathVariable Long id) {
        articleService.toggleRecommended(id);
        return Result.success();
    }
}
