package com.claudecode.blog.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("blog_article")
public class Article {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String contentHtml;
    private String coverImage;
    private Long categoryId;
    private String author;
    private String sourceFile;
    private Integer difficulty;
    private Integer isTop;
    private Integer isRecommended;
    private Integer status;
    private Long viewCount;
    private Long likeCount;
    private Integer commentCount;
    private Integer wordCount;
    private Integer readTime;
    private Integer sortOrder;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
