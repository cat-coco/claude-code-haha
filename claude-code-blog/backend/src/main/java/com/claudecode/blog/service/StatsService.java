package com.claudecode.blog.service;

import com.claudecode.blog.dto.DashboardDTO;
import com.claudecode.blog.entity.DailyStats;

import java.time.LocalDate;
import java.util.List;

public interface StatsService {

    DashboardDTO getDashboardStats();

    List<DailyStats> getDailyStats(LocalDate start, LocalDate end);

    void refreshDailyStats(LocalDate date);
}
