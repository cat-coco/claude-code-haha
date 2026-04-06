package com.claudecode.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.claudecode.blog.entity.VisitLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface VisitLogMapper extends BaseMapper<VisitLog> {

    /**
     * Count page views grouped by date within a date range.
     *
     * @param startDate start date (inclusive), format yyyy-MM-dd
     * @param endDate   end date (inclusive), format yyyy-MM-dd
     * @return list of maps with "date" and "count" keys
     */
    @Select("SELECT DATE(created_at) AS date, COUNT(*) AS count " +
            "FROM visit_log " +
            "WHERE DATE(created_at) BETWEEN #{startDate} AND #{endDate} " +
            "GROUP BY DATE(created_at) " +
            "ORDER BY date ASC")
    List<Map<String, Object>> countByDate(@Param("startDate") String startDate,
                                          @Param("endDate") String endDate);

    /**
     * Count visits grouped by device type.
     *
     * @return list of maps with "deviceType" and "count" keys
     */
    @Select("SELECT device_type AS deviceType, COUNT(*) AS count " +
            "FROM visit_log " +
            "GROUP BY device_type " +
            "ORDER BY count DESC")
    List<Map<String, Object>> countByDevice();

    /**
     * Count visits grouped by browser.
     *
     * @return list of maps with "browser" and "count" keys
     */
    @Select("SELECT browser, COUNT(*) AS count " +
            "FROM visit_log " +
            "GROUP BY browser " +
            "ORDER BY count DESC")
    List<Map<String, Object>> countByBrowser();

    /**
     * Count visits grouped by page URL.
     *
     * @param limit maximum number of results
     * @return list of maps with "pageUrl" and "count" keys
     */
    @Select("SELECT page_url AS pageUrl, COUNT(*) AS count " +
            "FROM visit_log " +
            "GROUP BY page_url " +
            "ORDER BY count DESC " +
            "LIMIT #{limit}")
    List<Map<String, Object>> countByPage(@Param("limit") int limit);

    /**
     * Get top articles by visit count.
     *
     * @param limit maximum number of results
     * @return list of maps with "articleId", "title", and "count" keys
     */
    @Select("SELECT v.article_id AS articleId, a.title AS title, COUNT(*) AS count " +
            "FROM visit_log v " +
            "LEFT JOIN article a ON v.article_id = a.id " +
            "WHERE v.article_id IS NOT NULL " +
            "GROUP BY v.article_id, a.title " +
            "ORDER BY count DESC " +
            "LIMIT #{limit}")
    List<Map<String, Object>> topArticles(@Param("limit") int limit);

    /**
     * Count today's page views.
     *
     * @return today's PV count
     */
    @Select("SELECT COUNT(*) FROM visit_log WHERE DATE(created_at) = CURDATE()")
    int countTodayPv();

    /**
     * Count today's unique visitors.
     *
     * @return today's UV count
     */
    @Select("SELECT COUNT(DISTINCT session_id) FROM visit_log WHERE DATE(created_at) = CURDATE()")
    int countTodayUv();
}
