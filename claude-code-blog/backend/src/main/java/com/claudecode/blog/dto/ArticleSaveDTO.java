package com.claudecode.blog.dto;

import lombok.Data;

import java.util.List;

@Data
public class ArticleSaveDTO {

    private Long id;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private Long categoryId;
    private List<Long> tagIds;
    private String difficulty;
    private String coverImage;
    private String sourceFile;
    private Integer status;
    private Boolean isTop;
    private Boolean isRecommended;
}
