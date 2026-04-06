package com.claudecode.blog.dto;

import lombok.Data;

import java.util.List;

@Data
public class PageResult<T> {

    private List<T> list;
    private long total;
    private long page;
    private long pageSize;

    public PageResult() {
    }

    public PageResult(List<T> list, long total, long page, long pageSize) {
        this.list = list;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
    }
}
