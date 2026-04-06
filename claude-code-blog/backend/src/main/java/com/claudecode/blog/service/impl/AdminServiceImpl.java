package com.claudecode.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.claudecode.blog.entity.Admin;
import com.claudecode.blog.mapper.AdminMapper;
import com.claudecode.blog.service.AdminService;
import com.claudecode.blog.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public String login(String username, String password) {
        QueryWrapper<Admin> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username);
        Admin admin = adminMapper.selectOne(queryWrapper);

        if (admin == null) {
            throw new RuntimeException("User not found");
        }

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Update last login time
        admin.setLastLoginTime(LocalDateTime.now());
        adminMapper.updateById(admin);

        return jwtUtil.generateToken(username);
    }

    @Override
    public Admin getAdminInfo(String username) {
        QueryWrapper<Admin> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username);
        Admin admin = adminMapper.selectOne(queryWrapper);
        if (admin != null) {
            admin.setPassword(null);
        }
        return admin;
    }

    @Override
    public void updatePassword(String username, String oldPwd, String newPwd) {
        QueryWrapper<Admin> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username);
        Admin admin = adminMapper.selectOne(queryWrapper);

        if (admin == null) {
            throw new RuntimeException("User not found");
        }

        if (!passwordEncoder.matches(oldPwd, admin.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        admin.setPassword(passwordEncoder.encode(newPwd));
        adminMapper.updateById(admin);
    }
}
