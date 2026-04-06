package com.claudecode.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.claudecode.blog.entity.Comment;

public interface CommentService {

    Page<Comment> listByArticle(Long articleId, int page, int pageSize);

    void save(Comment comment);

    void approve(Long id);

    void reject(Long id);

    void delete(Long id);
}
