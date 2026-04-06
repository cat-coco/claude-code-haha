import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, message, Card, Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { categoryApi } from '../../api/index.js';

const { Option } = Select;

const Categories = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryApi.list();
      setCategories(res.data || res || []);
    } catch {
      message.error('获取分类列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
      icon: record.icon,
      color: record.color,
      parentId: record.parentId,
      sort: record.sort || 0,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await categoryApi.delete(id);
      message.success('删除成功');
      fetchCategories();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingId) {
        await categoryApi.update(editingId, values);
        message.success('更新成功');
      } else {
        await categoryApi.save(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchCategories();
    } catch (err) {
      if (err.errorFields) return;
      message.error('操作失败');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 150 },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', width: 150 },
    { title: '图标', dataIndex: 'icon', key: 'icon', width: 80 },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color) => color ? (
        <Tag color={color}>{color}</Tag>
      ) : '-',
    },
    {
      title: '父分类',
      dataIndex: 'parentId',
      key: 'parentId',
      width: 100,
      render: (parentId) => {
        if (!parentId) return '-';
        const parent = (Array.isArray(categories) ? categories : []).find((c) => c.id === parentId);
        return parent ? parent.name : parentId;
      },
    },
    {
      title: '文章数',
      dataIndex: 'articleCount',
      key: 'articleCount',
      width: 80,
      render: (val) => val || 0,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 70,
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
            title="确定删除该分类？"
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
          <h2 style={{ margin: 0 }}>分类管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增分类
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={Array.isArray(categories) ? categories : []}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑分类' : '新增分类'}
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
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item label="Slug" name="slug">
            <Input placeholder="URL标识，留空自动生成" />
          </Form.Item>

          <Form.Item label="图标" name="icon">
            <Input placeholder="图标名称或emoji" />
          </Form.Item>

          <Form.Item label="颜色" name="color">
            <Input placeholder="如 #1890ff" />
          </Form.Item>

          <Form.Item label="父分类" name="parentId">
            <Select placeholder="选择父分类" allowClear>
              {(Array.isArray(categories) ? categories : [])
                .filter((c) => c.id !== editingId)
                .map((cat) => (
                  <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item label="排序" name="sort">
            <InputNumber min={0} placeholder="排序值，越小越靠前" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
