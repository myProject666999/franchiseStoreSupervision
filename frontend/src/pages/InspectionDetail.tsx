import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Table, Tag, Button, Space, Progress, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { InspectionReport, InspectionItemScore } from '../types';
import { apiService } from '../services/api';

const InspectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<InspectionReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadReport(Number(id));
    }
  }, [id]);

  const loadReport = async (reportId: number) => {
    setLoading(true);
    try {
      const data = await apiService.getInspectionDetail(reportId);
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const scoreColumns = [
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 120,
    },
    {
      title: '检查项',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 200,
    },
    {
      title: '得分',
      key: 'score',
      render: (_: any, record: InspectionItemScore) => (
        <span>
          {record.score} / {record.maxScore}
          {record.mustPass ? <Tag color="red" style={{ marginLeft: 8 }}>必过</Tag> : null}
        </span>
      ),
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      width: 80,
    },
    {
      title: '是否合格',
      dataIndex: 'isPass',
      key: 'isPass',
      width: 100,
      render: (isPass: number) => (
        <Tag color={isPass ? 'green' : 'red'}>{isPass ? '合格' : '不合格'}</Tag>
      ),
    },
    {
      title: '问题描述',
      dataIndex: 'problemDescription',
      key: 'problemDescription',
    },
  ];

  if (!report) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          返回
        </Button>
      </div>

      <Card title="检查报告详情" loading={loading}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="报告编号">{report.reportNo}</Descriptions.Item>
          <Descriptions.Item label="门店名称">{report.storeName}</Descriptions.Item>
          <Descriptions.Item label="任务名称">{report.taskName}</Descriptions.Item>
          <Descriptions.Item label="检查日期">{report.inspectionDate}</Descriptions.Item>
          <Descriptions.Item label="总得分">
            <strong style={{ fontSize: 18 }}>
              {report.totalScore} / {report.maxScore}
            </strong>
          </Descriptions.Item>
          <Descriptions.Item label="得分率">
            <Progress percent={report.scoreRate} status={report.scoreRate >= 60 ? 'normal' : 'exception'} />
          </Descriptions.Item>
          <Descriptions.Item label="是否合格">
            <Tag color={report.isPass ? 'green' : 'red'}>{report.isPass ? '合格' : '不合格'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="问题数量">{report.problemCount}</Descriptions.Item>
        </Descriptions>

        <Divider>检查项得分明细</Divider>

        <Table
          dataSource={report.itemScores || []}
          columns={scoreColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />

        {report.summary && (
          <>
            <Divider>总体评价</Divider>
            <p>{report.summary}</p>
          </>
        )}

        {report.improvementSuggestions && (
          <>
            <Divider>改进建议</Divider>
            <p>{report.improvementSuggestions}</p>
          </>
        )}
      </Card>
    </div>
  );
};

export default InspectionDetail;
