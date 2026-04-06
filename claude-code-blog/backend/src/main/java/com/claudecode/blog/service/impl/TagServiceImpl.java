package com.claudecode.blog.service.impl;

import com.claudecode.blog.entity.Tag;
import com.claudecode.blog.mapper.TagMapper;
import com.claudecode.blog.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagMapper tagMapper;

    @Override
    public List<Tag> listAll() {
        return tagMapper.selectList(null);
    }

    @Override
    public Tag getById(Long id) {
        return tagMapper.selectById(id);
    }

    @Override
    public void save(Tag tag) {
        tagMapper.insert(tag);
    }

    @Override
    public void update(Tag tag) {
        tagMapper.updateById(tag);
    }

    @Override
    public void delete(Long id) {
        tagMapper.deleteById(id);
    }
}
