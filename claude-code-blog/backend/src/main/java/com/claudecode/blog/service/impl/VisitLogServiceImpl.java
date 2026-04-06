package com.claudecode.blog.service.impl;

import com.claudecode.blog.entity.VisitLog;
import com.claudecode.blog.mapper.VisitLogMapper;
import com.claudecode.blog.service.VisitLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VisitLogServiceImpl implements VisitLogService {

    private final VisitLogMapper visitLogMapper;

    @Override
    public void saveLog(VisitLog log) {
        visitLogMapper.insert(log);
    }
}
