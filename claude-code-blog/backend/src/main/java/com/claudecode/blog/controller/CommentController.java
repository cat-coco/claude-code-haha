package com.claudecode.blog.controller;

import com.claudecode.blog.dto.Result;
import com.claudecode.blog.entity.Comment;
import com.claudecode.blog.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/comment")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/list/{articleId}")
    public Result<?> list(@PathVariable Long articleId,
                          @RequestParam(defaultValue = "1") int page,
                          @RequestParam(defaultValue = "10") int pageSize) {
        return Result.success(commentService.listByArticleId(articleId, page, pageSize));
    }

    @PostMapping("/save")
    public Result<?> save(@RequestBody Comment comment) {
        commentService.save(comment);
        return Result.success();
    }
}
