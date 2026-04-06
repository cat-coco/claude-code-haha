package com.claudecode.blog.controller;

import com.claudecode.blog.dto.Result;
import com.claudecode.blog.entity.VisitLog;
import com.claudecode.blog.service.VisitLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/visit")
@RequiredArgsConstructor
public class VisitController {

    private final VisitLogService visitLogService;

    @PostMapping("/log")
    public Result<?> log(@RequestBody VisitLog visitLog) {
        visitLogService.saveLog(visitLog);
        return Result.success();
    }
}
