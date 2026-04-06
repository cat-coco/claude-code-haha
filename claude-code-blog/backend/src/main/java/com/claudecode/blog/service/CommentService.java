package com.claudecode.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.claudecode.blog.dto.PageResult;
import com.claudecode.blog.entity.Comment;

public interface CommentService {

    Page<Comment> listByArticle(Long articleId, int page, int pageSize);

    PageResult<Comment> listByArticleId(Long articleId, int page, int pageSize);

    PageResult<Comment> listAll(int page, int pageSize, Integer status);

    void save(Comment comment);

    void approve(Long id);

    void reject(Long id);

    void delete(Long id);
}
