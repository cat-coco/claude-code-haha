package com.claudecode.blog.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("sys_daily_stats")
public class DailyStats {
    @TableId(type = IdType.AUTO)
    private Long id;
    private LocalDate statDate;
    private Integer pv;
    private Integer uv;
    private Integer ipCount;
    private Integer newVisitor;
    private Integer avgDuration;
    private BigDecimal bounceRate;
    private Integer articleViews;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
