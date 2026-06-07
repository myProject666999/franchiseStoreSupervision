import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import {
  ShopOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { apiService } from '../services/api';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>({});
  const [trendData, setTrendData] = useState<any[]>([]);
  const [problemData, setProblemData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overviewData, trend, problem] = await Promise.all([
        apiService.getAreaOverview(),
        apiService.getStoreTrend({ startDate: '2024-01-01', endDate: '2024-12-31' }),
        apiService.getProblemDistribution(),
      ]);
      setOverview(overviewData);
      setTrendData(trend);
      setProblemData(problem);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const trendChartOption = {
    title: { text: '月度检查趋势', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { data: ['检查次数', '合格次数'], bottom: 0 },
    xAxis: { type: 'category', data: trendData.map((d) => d.month || '1月') },
    yAxis: { type: 'value' },
    series: [
      { name: '检查次数', type: 'line', data: trendData.map((d) => d.inspectionCount || 0), smooth: true },
      { name: '合格次数', type: 'line', data: trendData.map((d) => d.passCount || 0), smooth: true },
    ],
  };

  const problemChartOption = {
    title: { text: '问题类别分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: problemData.length
          ? problemData.map((d) => ({ name: d.categoryName, value: d.count }))
          : [
              { name: '卫生', value: 12 },
              { name: '食材', value: 8 },
              { name: '出品', value: 5 },
              { name: '服务', value: 3 },
              { name: '员工形象', value: 2 },
            ],
      },
    ],
  };

  return (
    <div>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>数据概览</Title>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="门店总数"
              value={overview.totalStores || 5}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="本月检查次数"
              value={overview.monthlyInspections || 15}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="合格次数"
              value={overview.passCount || 12}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待整改"
              value={overview.pendingRectifications || 8}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={trendChartOption} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={problemChartOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
