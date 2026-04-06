package com.claudecode.blog.controller;

import com.claudecode.blog.dto.Result;
import com.claudecode.blog.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tag")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping("/list")
    public Result<?> list() {
        return Result.success(tagService.listAll());
    }

    @GetMapping("/{id}")
    public Result<?> getById(@PathVariable Long id) {
        return Result.success(tagService.getById(id));
    }
}
