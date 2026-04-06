package com.claudecode.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.claudecode.blog.dto.DashboardDTO;
import com.claudecode.blog.entity.Article;
import com.claudecode.blog.entity.DailyStats;
import com.claudecode.blog.entity.VisitLog;
import com.claudecode.blog.mapper.ArticleMapper;
import com.claudecode.blog.mapper.DailyStatsMapper;
import com.claudecode.blog.mapper.VisitLogMapper;
import com.claudecode.blog.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

    private final VisitLogMapper visitLogMapper;
    private final DailyStatsMapper dailyStatsMapper;
    private final ArticleMapper articleMapper;

    @Override
    public DashboardDTO getDashboardStats() {
        DashboardDTO dto = new DashboardDTO();

        // Today's PV
        dto.setTodayPv(visitLogMapper.countTodayPv());

        // Today's UV
        dto.setTodayUv(visitLogMapper.countTodayUv());

        // Total published articles
        QueryWrapper<Article> articleQuery = new QueryWrapper<>();
        articleQuery.eq("status", 1);
        dto.setTotalArticles(articleMapper.selectCount(articleQuery));

        // Total views (sum of view_count from articles)
        QueryWrapper<Article> viewQuery = new QueryWrapper<>();
        viewQuery.select("IFNULL(SUM(view_count), 0) AS view_count");
        List<Map<String, Object>> viewResult = articleMapper.selectMaps(viewQuery);
        if (viewResult != null && !viewResult.isEmpty()) {
            Object viewCount = viewResult.get(0).get("view_count");
            dto.setTotalViews(viewCount != null ? Long.parseLong(viewCount.toString()) : 0L);
        }

        // Recent 30 days stats
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        QueryWrapper<DailyStats> statsQuery = new QueryWrapper<>();
        statsQuery.between("stat_date", startDate, endDate)
                .orderByAsc("stat_date");
        dto.setRecentDays(dailyStatsMapper.selectList(statsQuery));

        // Top 10 articles by view_count
        QueryWrapper<Article> topQuery = new QueryWrapper<>();
        topQuery.select("id", "title", "view_count", "slug")
                .eq("status", 1)
                .orderByDesc("view_count")
                .last("LIMIT 10");
        List<Map<String, Object>> topArticles = articleMapper.selectMaps(topQuery);
        dto.setTopArticles(topArticles);

        // Device stats
        List<Map<String, Object>> deviceList = visitLogMapper.countByDevice();
        Map<String, Object> deviceStats = new HashMap<>();
        for (Map<String, Object> item : deviceList) {
            deviceStats.put(
                    item.get("deviceType") != null ? item.get("deviceType").toString() : "unknown",
                    item.get("count")
            );
        }
        dto.setDeviceStats(deviceStats);

        // Browser stats
        List<Map<String, Object>> browserList = visitLogMapper.countByBrowser();
        Map<String, Object> browserStats = new HashMap<>();
        for (Map<String, Object> item : browserList) {
            browserStats.put(
                    item.get("browser") != null ? item.get("browser").toString() : "unknown",
                    item.get("count")
            );
        }
        dto.setBrowserStats(browserStats);

        return dto;
    }

    @Override
    public List<DailyStats> getDailyStats(LocalDate start, LocalDate end) {
        QueryWrapper<DailyStats> queryWrapper = new QueryWrapper<>();
        queryWrapper.between("stat_date", start, end)
                .orderByAsc("stat_date");
        return dailyStatsMapper.selectList(queryWrapper);
    }

    @Override
    public void refreshDailyStats(LocalDate date) {
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.atTime(LocalTime.MAX);

        // Count PV for the date
        QueryWrapper<VisitLog> pvQuery = new QueryWrapper<>();
        pvQuery.between("created_at", dayStart, dayEnd);
        long pv = visitLogMapper.selectCount(pvQuery);

        // Count UV (distinct visitor_ip) for the date
        QueryWrapper<VisitLog> uvQuery = new QueryWrapper<>();
        uvQuery.select("COUNT(DISTINCT visitor_ip) AS uv_count")
                .between("created_at", dayStart, dayEnd);
        List<Map<String, Object>> uvResult = visitLogMapper.selectMaps(uvQuery);
        long uv = 0;
        if (uvResult != null && !uvResult.isEmpty()) {
            Object uvCount = uvResult.get(0).get("uv_count");
            uv = uvCount != null ? Long.parseLong(uvCount.toString()) : 0;
        }

        // Count distinct IPs
        QueryWrapper<VisitLog> ipQuery = new QueryWrapper<>();
        ipQuery.select("COUNT(DISTINCT visitor_ip) AS ip_count")
                .between("created_at", dayStart, dayEnd);
        List<Map<String, Object>> ipResult = visitLogMapper.selectMaps(ipQuery);
        long ipCount = 0;
        if (ipResult != null && !ipResult.isEmpty()) {
            Object count = ipResult.get(0).get("ip_count");
            ipCount = count != null ? Long.parseLong(count.toString()) : 0;
        }

        // Check if record exists for this date
        QueryWrapper<DailyStats> existQuery = new QueryWrapper<>();
        existQuery.eq("stat_date", date);
        DailyStats existing = dailyStatsMapper.selectOne(existQuery);

        if (existing != null) {
            existing.setPv((int) pv);
            existing.setUv((int) uv);
            existing.setIpCount((int) ipCount);
            dailyStatsMapper.updateById(existing);
        } else {
            DailyStats stats = new DailyStats();
            stats.setStatDate(date);
            stats.setPv((int) pv);
            stats.setUv((int) uv);
            stats.setIpCount((int) ipCount);
            dailyStatsMapper.insert(stats);
        }
    }
}
