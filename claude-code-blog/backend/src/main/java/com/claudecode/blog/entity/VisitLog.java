package com.claudecode.blog.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("sys_visit_log")
public class VisitLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String visitorIp;
    private String visitorUa;
    private String visitorReferer;
    private String pageUrl;
    private Long articleId;
    private String sessionId;
    private String deviceType;
    private String browser;
    private String os;
    private String country;
    private String province;
    private String city;
    private Integer visitDuration;
    private LocalDateTime createdAt;
}
