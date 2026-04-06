package com.claudecode.blog.controller;

import com.claudecode.blog.dto.Result;
import com.claudecode.blog.service.ConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ConfigController {

    private final ConfigService configService;

    @GetMapping("/config/site")
    public Result<?> getSiteConfig() {
        return Result.success(configService.getSiteConfig());
    }

    @GetMapping("/admin/config/list")
    public Result<?> getAll() {
        return Result.success(configService.getAll());
    }

    @PostMapping("/admin/config/set")
    public Result<?> set(@RequestParam String key, @RequestParam String value) {
        configService.set(key, value);
        return Result.success();
    }
}
