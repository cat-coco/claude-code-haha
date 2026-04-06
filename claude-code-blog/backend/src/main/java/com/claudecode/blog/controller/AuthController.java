package com.claudecode.blog.controller;

import com.claudecode.blog.dto.LoginDTO;
import com.claudecode.blog.dto.Result;
import com.claudecode.blog.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AdminService adminService;

    @PostMapping("/login")
    public Result<?> login(@RequestBody LoginDTO loginDTO) {
        String token = adminService.login(loginDTO.getUsername(), loginDTO.getPassword());
        return Result.success(token);
    }

    @GetMapping("/info")
    public Result<?> info() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return Result.success(adminService.getAdminInfo(username));
    }

    @PostMapping("/password")
    public Result<?> updatePassword(@RequestParam String oldPassword, @RequestParam String newPassword) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        adminService.updatePassword(username, oldPassword, newPassword);
        return Result.success();
    }
}
