package com.claudecode.blog.dto;

import com.claudecode.blog.entity.Tag;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ArticleDTO {

    private Long id;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String contentHtml;
    private String coverImage;
    private Long categoryId;
    private String categoryName;
    private String author;
    private String sourceFile;
    private String difficulty;
    private Boolean isTop;
    private Boolean isRecommended;
    private Integer status;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private Integer wordCount;
    private Integer readTime;
    private Integer sortOrder;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Tag> tagList;
}
