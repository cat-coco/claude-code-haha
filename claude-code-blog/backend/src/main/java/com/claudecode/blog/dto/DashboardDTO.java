package com.claudecode.blog.dto;

import com.claudecode.blog.entity.DailyStats;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class DashboardDTO {

    private int todayPv;
    private int todayUv;
    private long totalArticles;
    private long totalViews;
    private List<DailyStats> recentDays;
    private List<Map<String, Object>> topArticles;
    private Map<String, Object> deviceStats;
    private Map<String, Object> browserStats;
}
