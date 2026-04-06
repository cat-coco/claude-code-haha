import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Button, Input, Select, Tag, Space, Popconfirm, message, Switch, Card,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { articleApi, categoryApi } from '../../api/index.js';

const { Option } = Select;

const Articles = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ keyword: '', categoryId: undefined, status: undefined });

  const fetchArticles = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        ...filters,
      };
      const res = await articleApi.adminList(params);
      const resData = res.data || res;
      setArticles(resData.list || resData.rows || resData.items || []);
      setPagination({
        current: page,
        pageSize,
        total: resData.total || 0,
      });
    } catch (err) {
      message.error('获取文章列表失败');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryApi.list();
      setCategories(res.data || res || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [fetchArticles, fetchCategories]);

  const handleSearch = () => {
    fetchArticles(1, pagination.pageSize);
  };

  const handleDelete = async (id) => {
    try {
      await articleApi.delete(id);
      message.success('删除成功');
      fetchArticles(pagination.current, pagination.pageSize);
    } catch {
      message.error('删除失败');
    }
  };

  const handleToggleTop = async (id) => {
    try {
      await articleApi.toggleTop(id);
      message.success('操作成功');
      fetchArticles(pagination.current, pagination.pageSize);
    } catch {
      message.error('操作失败');
    }
  };

  const handleToggleRecommend = async (id) => {
    try {
      await articleApi.toggleRecommend(id);
      message.success('操作成功');
      fetchArticles(pagination.current, pagination.pageSize);
    } catch {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 250,
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 100,
      render: (text, record) => text || record.category?.name || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'published' || status === 1 ? 'green' : 'orange'}>
          {status === 'published' || status === 1 ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      width: 80,
      sorter: (a, b) => (a.views || 0) - (b.views || 0),
    },
    {
      title: '置顶',
      dataIndex: 'isTop',
      key: 'isTop',
      width: 70,
      render: (val, record) => (
        <Switch
          checked={!!val}
          size="small"
          onChange={() => handleToggleTop(record.id)}
        />
      ),
    },
    {
      title: '推荐',
      dataIndex: 'isRecommend',
      key: 'isRecommend',
      width: 70,
      render: (val, record) => (
        <Switch
          checked={!!val}
          size="small"
          onChange={() => handleToggleRecommend(record.id)}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (text) => text ? new Date(text).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 130,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/article/${record.id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该文章？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索文章标题"
            prefix={<SearchOutlined />}
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 220 }}
            allowClear
          />
          <Select
            placeholder="选择分类"
            value={filters.categoryId}
            onChange={(val) => setFilters({ ...filters, categoryId: val })}
            style={{ width: 150 }}
            allowClear
          >
            {(Array.isArray(categories) ? categories : []).map((cat) => (
              <Option key={cat.id} value={cat.id}>{cat.name}</Option>
            ))}
          </Select>
          <Select
            placeholder="文章状态"
            value={filters.status}
            onChange={(val) => setFilters({ ...filters, status: val })}
            style={{ width: 120 }}
            allowClear
          >
            <Option value="">全部</Option>
            <Option value="published">已发布</Option>
            <Option value="draft">草稿</Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/article/new')}
          >
            新建文章
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 篇文章`,
            onChange: (page, pageSize) => fetchArticles(page, pageSize),
          }}
          scroll={{ x: 1100 }}
        />
      </Card>
    </div>
  );
};

export default Articles;
