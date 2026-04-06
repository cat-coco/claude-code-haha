package com.claudecode.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.claudecode.blog.entity.SysConfig;
import com.claudecode.blog.mapper.SysConfigMapper;
import com.claudecode.blog.service.SysConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SysConfigServiceImpl implements SysConfigService {

    private final SysConfigMapper sysConfigMapper;

    @Override
    public Map<String, String> getAll() {
        List<SysConfig> configs = sysConfigMapper.selectList(null);
        Map<String, String> result = new HashMap<>();
        for (SysConfig config : configs) {
            result.put(config.getConfigKey(), config.getConfigValue());
        }
        return result;
    }

    @Override
    public String get(String key) {
        QueryWrapper<SysConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("config_key", key);
        SysConfig config = sysConfigMapper.selectOne(queryWrapper);
        return config != null ? config.getConfigValue() : null;
    }

    @Override
    public void set(String key, String value) {
        QueryWrapper<SysConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("config_key", key);
        SysConfig existing = sysConfigMapper.selectOne(queryWrapper);

        if (existing != null) {
            existing.setConfigValue(value);
            sysConfigMapper.updateById(existing);
        } else {
            SysConfig config = new SysConfig();
            config.setConfigKey(key);
            config.setConfigValue(value);
            sysConfigMapper.insert(config);
        }
    }

    @Override
    public Map<String, String> getSiteConfig() {
        QueryWrapper<SysConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.likeRight("config_key", "site_");
        List<SysConfig> configs = sysConfigMapper.selectList(queryWrapper);
        Map<String, String> result = new HashMap<>();
        for (SysConfig config : configs) {
            result.put(config.getConfigKey(), config.getConfigValue());
        }
        return result;
    }
}
