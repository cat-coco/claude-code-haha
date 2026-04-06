import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form, Input, Select, Upload, Radio, Checkbox, Button, message, Modal, Card, Row, Col, Space, Spin,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { articleApi, categoryApi, tagApi, uploadApi } from '../../api/index.js';

const { TextArea } = Input;
const { Option } = Select;

const difficultyOptions = [
  { label: '入门', value: 'beginner' },
  { label: '中级', value: 'intermediate' },
  { label: '高级', value: 'advanced' },
  { label: '专家', value: 'expert' },
];

const ArticleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  const isEdit = id && id !== 'new';

  const fetchArticle = useCallback(async () => {
    if (!isEdit) return;
    setLoading(true);
    try {
      const res = await articleApi.adminList({ id });
      const article = res.data?.list?.[0] || res.data || res;
      form.setFieldsValue({
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        categoryId: article.categoryId,
        tagIds: article.tagIds || article.tags?.map((t) => t.id) || [],
        difficulty: article.difficulty,
        sourceFile: article.sourceFile,
        content: article.content,
        status: article.status || 'draft',
        isTop: !!article.isTop,
        isRecommend: !!article.isRecommend,
      });
      if (article.cover) {
        setCoverUrl(article.cover);
      }
    } catch {
      message.error('获取文章详情失败');
    } finally {
      setLoading(false);
    }
  }, [id, isEdit, form]);

  const fetchOptions = useCallback(async () => {
    try {
      const [catRes, tagRes] = await Promise.all([categoryApi.list(), tagApi.list()]);
      setCategories(catRes.data || catRes || []);
      setTags(tagRes.data || tagRes || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchOptions();
    fetchArticle();
  }, [fetchOptions, fetchArticle]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const currentSlug = form.getFieldValue('slug');
    if (!currentSlug) {
      form.setFieldsValue({ slug: generateSlug(title) });
    }
  };

  const handleUpload = async (info) => {
    const { file } = info;
    try {
      const res = await uploadApi.image(file);
      const url = res.data?.url || res.url;
      setCoverUrl(url);
      message.success('上传成功');
    } catch {
      message.error('上传失败');
    }
  };

  const handlePreview = () => {
    const content = form.getFieldValue('content') || '';
    setPreviewContent(content);
    setPreviewVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        ...values,
        cover: coverUrl,
      };

      if (isEdit) {
        await articleApi.update(id, payload);
        message.success('更新成功');
      } else {
        await articleApi.save(payload);
        message.success('创建成功');
      }
      navigate('/admin/articles');
    } catch (err) {
      if (err.errorFields) {
        message.error('请填写必填项');
      } else {
        message.error(isEdit ? '更新失败' : '创建失败');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/articles')}>
            返回
          </Button>
          <h2 style={{ margin: 0 }}>{isEdit ? '编辑文章' : '新建文章'}</h2>
        </Space>
        <Space>
          <Button icon={<EyeOutlined />} onClick={handlePreview}>
            预览
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            保存
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              initialValues={{ status: 'draft', isTop: false, isRecommend: false }}
            >
              <Form.Item
                label="标题"
                name="title"
                rules={[{ required: true, message: '请输入文章标题' }]}
              >
                <Input placeholder="请输入文章标题" onChange={handleTitleChange} />
              </Form.Item>

              <Form.Item label="Slug" name="slug">
                <Input placeholder="URL友好的标识，留空自动生成" />
              </Form.Item>

              <Form.Item label="摘要" name="summary">
                <TextArea rows={3} placeholder="请输入文章摘要" />
              </Form.Item>

              <Form.Item
                label="内容"
                name="content"
                rules={[{ required: true, message: '请输入文章内容' }]}
              >
                <TextArea
                  rows={20}
                  placeholder="请输入 Markdown 内容"
                  style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace', fontSize: 14 }}
                />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="文章设置" style={{ marginBottom: 16 }}>
            <Form form={form} layout="vertical">
              <Form.Item label="分类" name="categoryId">
                <Select placeholder="选择分类" allowClear>
                  {(Array.isArray(categories) ? categories : []).map((cat) => (
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="标签" name="tagIds">
                <Select mode="multiple" placeholder="选择标签" allowClear>
                  {(Array.isArray(tags) ? tags : []).map((tag) => (
                    <Option key={tag.id} value={tag.id}>{tag.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="难度" name="difficulty">
                <Select placeholder="选择难度" allowClear>
                  {difficultyOptions.map((opt) => (
                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="对应源码文件" name="sourceFile">
                <Input placeholder="如：src/QueryEngine.ts" />
              </Form.Item>

              <Form.Item label="封面图">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  customRequest={handleUpload}
                >
                  <Button icon={<UploadOutlined />}>上传封面</Button>
                </Upload>
                {coverUrl && (
                  <img
                    src={coverUrl}
                    alt="cover"
                    style={{ width: '100%', marginTop: 8, borderRadius: 4 }}
                  />
                )}
              </Form.Item>

              <Form.Item label="状态" name="status">
                <Radio.Group>
                  <Radio value="draft">草稿</Radio>
                  <Radio value="published">发布</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Form.Item name="isTop" valuePropName="checked" noStyle>
                    <Checkbox>置顶</Checkbox>
                  </Form.Item>
                  <Form.Item name="isRecommend" valuePropName="checked" noStyle>
                    <Checkbox>推荐</Checkbox>
                  </Form.Item>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Modal
        title="文章预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        <div
          style={{
            maxHeight: '60vh',
            overflow: 'auto',
            padding: 16,
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: '#f5f5f5',
            borderRadius: 4,
          }}
        >
          {previewContent || '暂无内容'}
        </div>
      </Modal>
    </Spin>
  );
};

export default ArticleEdit;
