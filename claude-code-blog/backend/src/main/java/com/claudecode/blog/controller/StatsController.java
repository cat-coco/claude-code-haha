package com.claudecode.blog.controller;

import com.claudecode.blog.dto.Result;
import com.claudecode.blog.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/admin/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/dashboard")
    public Result<?> getDashboardStats() {
        return Result.success(statsService.getDashboardStats());
    }

    @GetMapping("/daily")
    public Result<?> getDailyStats(@RequestParam String startDate, @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return Result.success(statsService.getDailyStats(start, end));
    }

    @PostMapping("/refresh")
    public Result<?> refreshDailyStats(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        statsService.refreshDailyStats(localDate);
        return Result.success();
    }
}
