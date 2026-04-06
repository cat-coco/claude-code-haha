package com.claudecode.blog.controller;

import com.claudecode.blog.dto.Result;
import com.claudecode.blog.entity.Tag;
import com.claudecode.blog.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/tag")
@RequiredArgsConstructor
public class AdminTagController {

    private final TagService tagService;

    @PostMapping("/save")
    public Result<?> save(@RequestBody Tag tag) {
        return Result.success(tagService.save(tag));
    }

    @PutMapping("/update/{id}")
    public Result<?> update(@PathVariable Long id, @RequestBody Tag tag) {
        tag.setId(id);
        return Result.success(tagService.update(tag));
    }

    @DeleteMapping("/delete/{id}")
    public Result<?> delete(@PathVariable Long id) {
        tagService.delete(id);
        return Result.success();
    }
}
