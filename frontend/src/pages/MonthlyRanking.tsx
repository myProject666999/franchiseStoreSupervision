import React, { useEffect, useState } from 'react';
import { Table, Button, Select, Space, message, Card, Row, Col, Statistic } from 'antd';
import { TrophyOutlined, ReloadOutlined } from '@ant-design/icons';
import { MonthlyScore } from '../types';
import { apiService } from '../services/api';
import ReactECharts from 'echarts-for-react';

const { Option } = Select;

const MonthlyRanking: React.FC = () => {
  const [data, setData] = useState<MonthlyScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadData();
  }, [year, month, page, pageSize]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await apiService.getMonthlyRanking({ year, month, page, pageSize });
      setData(result.list || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error('Failed to load ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    try {
      await apiService.calculateMonthly({ year, month });
      message.success('计算完成');
      loadData();
    } catch (error) {
      console.error('Failed to calculate:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <TrophyOutlined style={{ color: '#faad14', fontSize: 20 }} />;
    if (rank === 2) return <TrophyOutlined style={{ color: '#d9d9d9', fontSize: 18 }} />;
    if (rank === 3) return <TrophyOutlined style={{ color: '#ad6800', fontSize: 16 }} />;
    return rank;
  };

  const chartData = data.slice(0, 10);
  const chartOption = {
    title: { text: '门店得分率排名', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', max: 100 },
    yAxis: {
      type: 'category',
      data: chartData.length > 0
        ? chartData.map(d => d.storeName || d.store?.name || '未知门店').reverse()
        : [],
    },
    series: [{
      type: 'bar',
      data: chartData.length > 0
        ? chartData.map(d => Number(d.avgScoreRate) || 0).reverse()
        : [],
      itemStyle: { color: '#1890ff' },
    }],
  };

  const columns = [
    { title: '排名', dataIndex: 'rankInArea', key: 'rankInArea', width: 80, render: (rank: number) => getRankIcon(rank) },
    { title: '门店名称', dataIndex: 'storeName', key: 'storeName', render: (v: any, r: any) => v || r.store?.name || '-' },
    { title: '检查次数', dataIndex: 'inspectionCount', key: 'inspectionCount' },
    { title: '平均得分', dataIndex: 'avgScore', key: 'avgScore', render: (v: any) => Number(v) || 0 },
    { title: '得分率(%)', dataIndex: 'avgScoreRate', key: 'avgScoreRate', render: (v: any) => { const n = Number(v); return isNaN(n) ? 0 : n; } },
    { title: '合格次数', dataIndex: 'passCount', key: 'passCount' },
    { title: '不合格次数', dataIndex: 'failCount', key: 'failCount' },
    { title: '问题总数', dataIndex: 'problemCount', key: 'problemCount' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>月度排名</h2>
        <Space>
          <Select value={year} onChange={setYear} style={{ width: 100 }}>
            {[2024, 2025, 2026].map(y => <Option key={y} value={y}>{y}年</Option>)}
          </Select>
          <Select value={month} onChange={setMonth} style={{ width: 100 }}>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <Option key={m} value={m}>{m}月</Option>)}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={handleCalculate}>重新计算</Button>
        </Space>
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="参与门店" value={data.length} /></Card></Col>
        <Col span={6}><Card><Statistic
          title="平均得分率"
          value={data.length ? (() => {
            const sum = data.reduce((s, d) => s + (Number(d.avgScoreRate) || 0), 0);
            const avg = sum / data.length;
            return isNaN(avg) ? '0.0' : avg.toFixed(1);
          })() : '0.0'}
          suffix="%"
        /></Card></Col>
        <Col span={6}><Card><Statistic title="总检查次数" value={data.reduce((s, d) => s + (Number(d.inspectionCount) || 0), 0)} /></Card></Col>
        <Col span={6}><Card><Statistic
          title="合格率"
          value={data.length ? (() => {
            const passTotal = data.reduce((s, d) => s + (Number(d.passCount) || 0), 0);
            const inspTotal = data.reduce((s, d) => s + (Number(d.inspectionCount) || 0), 0);
            const rate = inspTotal > 0 ? (passTotal / inspTotal) * 100 : 0;
            return isNaN(rate) ? '0.0' : rate.toFixed(1);
          })() : '0.0'}
          suffix="%"
        /></Card></Col>
      </Row>
      <Card style={{ marginBottom: 16 }}><ReactECharts option={chartOption} style={{ height: 350 }} /></Card>
      <Table loading={loading} columns={columns} dataSource={data} rowKey="id"
        pagination={{ current: page, pageSize, total, onChange: (p, ps) => { setPage(p); setPageSize(ps || 10); } }} />
    </div>
  );
};

export default MonthlyRanking;
