package com.claudecode.blog.service;

import java.util.Map;

public interface SysConfigService {

    Map<String, String> getAll();

    String get(String key);

    void set(String key, String value);

    Map<String, String> getSiteConfig();
}
