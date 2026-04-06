package com.claudecode.blog.service;

import com.claudecode.blog.entity.Tag;

import java.util.List;

public interface TagService {

    List<Tag> listAll();

    Tag getById(Long id);

    void save(Tag tag);

    void update(Tag tag);

    void delete(Long id);
}
