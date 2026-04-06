package com.claudecode.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.claudecode.blog.dto.PageResult;
import com.claudecode.blog.entity.Article;
import com.claudecode.blog.entity.Comment;
import com.claudecode.blog.mapper.ArticleMapper;
import com.claudecode.blog.mapper.CommentMapper;
import com.claudecode.blog.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentMapper commentMapper;
    private final ArticleMapper articleMapper;

    @Override
    public PageResult<Comment> listByArticleId(Long articleId, int page, int pageSize) {
        Page<Comment> result = listByArticle(articleId, page, pageSize);
        return new PageResult<>(result.getRecords(), result.getTotal(), result.getCurrent(), result.getSize());
    }

    @Override
    public PageResult<Comment> listAll(int page, int pageSize, Integer status) {
        Page<Comment> pageParam = new Page<>(page, pageSize);
        QueryWrapper<Comment> queryWrapper = new QueryWrapper<>();
        if (status != null) {
            queryWrapper.eq("status", status);
        }
        queryWrapper.orderByDesc("created_at");
        Page<Comment> result = commentMapper.selectPage(pageParam, queryWrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), result.getCurrent(), result.getSize());
    }

    @Override
    public Page<Comment> listByArticle(Long articleId, int page, int pageSize) {
        Page<Comment> pageParam = new Page<>(page, pageSize);
        QueryWrapper<Comment> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("article_id", articleId)
                .eq("status", 1)
                .orderByDesc("created_at");
        return commentMapper.selectPage(pageParam, queryWrapper);
    }

    @Override
    @Transactional
    public void save(Comment comment) {
        commentMapper.insert(comment);

        // Increment article comment_count
        if (comment.getArticleId() != null) {
            UpdateWrapper<Article> updateWrapper = new UpdateWrapper<>();
            updateWrapper.eq("id", comment.getArticleId())
                    .setSql("comment_count = comment_count + 1");
            articleMapper.update(null, updateWrapper);
        }
    }

    @Override
    public void approve(Long id) {
        Comment comment = new Comment();
        comment.setId(id);
        comment.setStatus(1);
        commentMapper.updateById(comment);
    }

    @Override
    public void reject(Long id) {
        Comment comment = new Comment();
        comment.setId(id);
        comment.setStatus(2);
        commentMapper.updateById(comment);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            return;
        }

        // Logical delete
        commentMapper.deleteById(id);

        // Decrement article comment_count
        if (comment.getArticleId() != null) {
            UpdateWrapper<Article> updateWrapper = new UpdateWrapper<>();
            updateWrapper.eq("id", comment.getArticleId())
                    .setSql("comment_count = GREATEST(comment_count - 1, 0)");
            articleMapper.update(null, updateWrapper);
        }
    }
}
