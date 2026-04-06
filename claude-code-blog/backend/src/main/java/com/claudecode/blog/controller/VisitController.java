package com.claudecode.blog.controller;

import com.claudecode.blog.dto.Result;
import com.claudecode.blog.entity.VisitLog;
import com.claudecode.blog.service.VisitService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/visit")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;

    @PostMapping("/log")
    public Result<?> log(@RequestBody VisitLog visitLog) {
        visitService.saveVisitLog(visitLog);
        return Result.success();
    }
}
