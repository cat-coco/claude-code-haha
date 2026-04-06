import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, Space, Popconfirm, message, Card, Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { tagApi } from '../../api/index.js';

const Tags = () => {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tagApi.list();
      setTags(res.data || res || []);
    } catch {
      message.error('获取标签列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      color: record.color,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await tagApi.delete(id);
      message.success('删除成功');
      fetchTags();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingId) {
        await tagApi.update(editingId, values);
        message.success('更新成功');
      } else {
        await tagApi.save(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchTags();
    } catch (err) {
      if (err.errorFields) return;
      message.error('操作失败');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name, record) => (
        <Tag color={record.color || 'default'}>{name}</Tag>
      ),
    },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', width: 150 },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color) => color || '-',
    },
    {
      title: '文章数',
      dataIndex: 'articleCount',
      key: 'articleCount',
      width: 80,
      render: (val) => val || 0,
    },
    {
      title: '操作',
      key: 'action',
      width: 130,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该标签？"
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
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>标签管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增标签
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={Array.isArray(tags) ? tags : []}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 700 }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑标签' : '新增标签'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>

          <Form.Item label="Slug" name="slug">
            <Input placeholder="URL标识，留空自动生成" />
          </Form.Item>

          <Form.Item label="颜色" name="color">
            <Input placeholder="如 #1890ff 或 blue" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tags;
