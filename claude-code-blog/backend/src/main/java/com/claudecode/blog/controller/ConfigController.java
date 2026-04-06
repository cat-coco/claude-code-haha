package com.claudecode.blog.controller;

import com.claudecode.blog.dto.Result;
import com.claudecode.blog.service.SysConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ConfigController {

    private final SysConfigService sysConfigService;

    @GetMapping("/config/site")
    public Result<?> getSiteConfig() {
        return Result.success(sysConfigService.getSiteConfig());
    }

    @GetMapping("/admin/config/list")
    public Result<?> getAll() {
        return Result.success(sysConfigService.getAll());
    }

    @PostMapping("/admin/config/set")
    public Result<?> set(@RequestParam String key, @RequestParam String value) {
        sysConfigService.set(key, value);
        return Result.success();
    }
}
