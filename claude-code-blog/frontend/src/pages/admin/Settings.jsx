import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Switch, Button, message, Card, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { configApi } from '../../api/index.js';

const { TextArea } = Input;

const configFields = [
  { key: 'site_name', label: '站点名称', type: 'input', placeholder: '请输入站点名称' },
  { key: 'site_description', label: '站点描述', type: 'textarea', placeholder: '请输入站点描述' },
  { key: 'site_keywords', label: '站点关键词', type: 'input', placeholder: '多个关键词用逗号分隔' },
  { key: 'site_logo', label: '站点Logo', type: 'input', placeholder: 'Logo URL 地址' },
  { key: 'github_url', label: 'GitHub 地址', type: 'input', placeholder: 'https://github.com/...' },
  { key: 'icp_number', label: 'ICP备案号', type: 'input', placeholder: '如：京ICP备XXXXXXXX号' },
  { key: 'analytics_enabled', label: '启用统计分析', type: 'switch' },
];

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await configApi.list();
      const configs = res.data || res || [];
      const values = {};
      if (Array.isArray(configs)) {
        configs.forEach((item) => {
          if (item.key === 'analytics_enabled') {
            values[item.key] = item.value === 'true' || item.value === true;
          } else {
            values[item.key] = item.value;
          }
        });
      } else if (typeof configs === 'object') {
        Object.entries(configs).forEach(([key, value]) => {
          if (key === 'analytics_enabled') {
            values[key] = value === 'true' || value === true;
          } else {
            values[key] = value;
          }
        });
      }
      form.setFieldsValue(values);
    } catch {
      message.error('获取配置失败');
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const promises = configFields.map((field) => {
        const value = field.type === 'switch'
          ? String(!!values[field.key])
          : (values[field.key] || '');
        return configApi.set(field.key, value);
      });

      await Promise.all(promises);
      message.success('保存成功');
    } catch (err) {
      if (err.errorFields) {
        message.error('请检查表单填写');
      } else {
        message.error('保存失败');
      }
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'textarea':
        return <TextArea rows={3} placeholder={field.placeholder} />;
      case 'switch':
        return <Switch />;
      default:
        return <Input placeholder={field.placeholder} />;
    }
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>系统设置</h2>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            保存设置
          </Button>
        </div>

        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            style={{ maxWidth: 600 }}
          >
            {configFields.map((field) => (
              <Form.Item
                key={field.key}
                label={field.label}
                name={field.key}
                valuePropName={field.type === 'switch' ? 'checked' : 'value'}
              >
                {renderField(field)}
              </Form.Item>
            ))}
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default Settings;
