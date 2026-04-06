import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Select, Tag, Space, Popconfirm, message, Card, Tooltip,
} from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { commentApi } from '../../api/index.js';

const { Option } = Select;

const statusMap = {
  pending: { text: '待审核', color: 'orange' },
  approved: { text: '已通过', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' },
};

const Comments = () => {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [statusFilter, setStatusFilter] = useState(undefined);

  const fetchComments = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = { page, pageSize };
      if (statusFilter) params.status = statusFilter;
      const res = await commentApi.adminList(params);
      const resData = res.data || res;
      setComments(resData.list || resData.rows || resData.items || []);
      setPagination({
        current: page,
        pageSize,
        total: resData.total || 0,
      });
    } catch {
      message.error('获取评论列表失败');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleApprove = async (id) => {
    try {
      await commentApi.approve(id);
      message.success('已通过');
      fetchComments(pagination.current, pagination.pageSize);
    } catch {
      message.error('操作失败');
    }
  };

  const handleReject = async (id) => {
    try {
      await commentApi.reject(id);
      message.success('已拒绝');
      fetchComments(pagination.current, pagination.pageSize);
    } catch {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await commentApi.delete(id);
      message.success('删除成功');
      fetchComments(pagination.current, pagination.pageSize);
    } catch {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '文章',
      dataIndex: 'articleTitle',
      key: 'articleTitle',
      width: 200,
      ellipsis: true,
      render: (text, record) => text || record.article?.title || '-',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 120,
      render: (text, record) => text || record.author || '-',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          {text && text.length > 50 ? text.slice(0, 50) + '...' : text || '-'}
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status) => {
        const info = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (text) => text ? new Date(text).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          {record.status !== 'approved' && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              style={{ color: '#52c41a' }}
              onClick={() => handleApprove(record.id)}
            >
              通过
            </Button>
          )}
          {record.status !== 'rejected' && (
            <Button
              type="link"
              size="small"
              icon={<CloseOutlined />}
              style={{ color: '#faad14' }}
              onClick={() => handleReject(record.id)}
            >
              拒绝
            </Button>
          )}
          <Popconfirm
            title="确定删除该评论？"
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
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>评论管理</h2>
          <Select
            placeholder="筛选状态"
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            style={{ width: 140 }}
            allowClear
          >
            <Option value="">全部</Option>
            <Option value="pending">待审核</Option>
            <Option value="approved">已通过</Option>
            <Option value="rejected">已拒绝</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={comments}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条评论`,
            onChange: (page, pageSize) => fetchComments(page, pageSize),
          }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};

export default Comments;
