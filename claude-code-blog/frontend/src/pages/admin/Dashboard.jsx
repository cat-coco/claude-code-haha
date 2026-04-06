import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Spin, message } from 'antd';
import {
  EyeOutlined,
  UserOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { statsApi } from '../../api/index.js';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await statsApi.dashboard();
      setData(res.data || res);
    } catch (err) {
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statCards = [
    { title: '今日PV', value: data?.todayPV || 0, icon: <EyeOutlined />, color: '#667eea' },
    { title: '今日UV', value: data?.todayUV || 0, icon: <UserOutlined />, color: '#764ba2' },
    { title: '文章总数', value: data?.totalArticles || 0, icon: <FileTextOutlined />, color: '#f5576c' },
    { title: '总浏览量', value: data?.totalViews || 0, icon: <BarChartOutlined />, color: '#4facfe' },
  ];

  const pvUvOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['PV', 'UV'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: (data?.trend || []).map((item) => item.date),
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'PV',
        type: 'line',
        smooth: true,
        data: (data?.trend || []).map((item) => item.pv),
        itemStyle: { color: '#667eea' },
        areaStyle: { color: 'rgba(102,126,234,0.1)' },
      },
      {
        name: 'UV',
        type: 'line',
        smooth: true,
        data: (data?.trend || []).map((item) => item.uv),
        itemStyle: { color: '#f5576c' },
        areaStyle: { color: 'rgba(245,87,108,0.1)' },
      },
    ],
  };

  const deviceOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}: {d}%' },
        data: (data?.devices || [
          { name: 'PC', value: 60 },
          { name: 'Mobile', value: 30 },
          { name: 'Tablet', value: 10 },
        ]),
      },
    ],
  };

  const browserOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: (data?.browsers || []).map((item) => item.name),
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: (data?.browsers || []).map((item) => ({
          value: item.value,
          itemStyle: { color: '#667eea', borderRadius: [4, 4, 0, 0] },
        })),
        barWidth: '40%',
      },
    ],
  };

  const topArticleColumns = [
    { title: '排名', dataIndex: 'rank', key: 'rank', width: 60, render: (_, __, index) => index + 1 },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '浏览量', dataIndex: 'views', key: 'views', width: 100, sorter: (a, b) => a.views - b.views },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>仪表盘</h2>
        <Button icon={<ReloadOutlined />} onClick={fetchData}>
          刷新
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card>
              <Statistic
                title={card.title}
                value={card.value}
                prefix={React.cloneElement(card.icon, { style: { color: card.color } })}
                valueStyle={{ color: card.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="近30天PV/UV趋势">
            <ReactECharts option={pvUvOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="设备分布">
            <ReactECharts option={deviceOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="浏览器分布">
            <ReactECharts option={browserOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="热门文章 Top 10">
            <Table
              columns={topArticleColumns}
              dataSource={data?.topArticles || []}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default Dashboard;
