package com.claudecode.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.claudecode.blog.entity.DailyStats;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DailyStatsMapper extends BaseMapper<DailyStats> {
}
