package com.claudecode.blog.service;

import com.claudecode.blog.entity.Admin;

public interface AdminService {

    String login(String username, String password);

    Admin getAdminInfo(String username);

    void updatePassword(String username, String oldPwd, String newPwd);
}
