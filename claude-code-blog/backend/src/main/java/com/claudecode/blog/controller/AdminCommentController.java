package com.claudecode.blog.controller;

import com.claudecode.blog.dto.Result;
import com.claudecode.blog.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/comment")
@RequiredArgsConstructor
public class AdminCommentController {

    private final CommentService commentService;

    @GetMapping("/list")
    public Result<?> list(@RequestParam(defaultValue = "1") int page,
                          @RequestParam(defaultValue = "10") int pageSize,
                          @RequestParam(required = false) Integer status) {
        return Result.success(commentService.listAll(page, pageSize, status));
    }

    @PostMapping("/approve/{id}")
    public Result<?> approve(@PathVariable Long id) {
        commentService.approve(id);
        return Result.success();
    }

    @PostMapping("/reject/{id}")
    public Result<?> reject(@PathVariable Long id) {
        commentService.reject(id);
        return Result.success();
    }

    @DeleteMapping("/delete/{id}")
    public Result<?> delete(@PathVariable Long id) {
        commentService.delete(id);
        return Result.success();
    }
}
