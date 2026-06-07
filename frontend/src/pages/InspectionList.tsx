import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message, Progress } from 'antd';
import { PlusOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { InspectionReport, ReportStatus } from '../types';
import { apiService } from '../services/api';

const InspectionList: React.FC = () => {
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const statusMap: Record<ReportStatus, { text: string; color: string }> = {
    draft: { text: '草稿', color: 'default' },
    submitted: { text: '已提交', color: 'blue' },
    confirmed: { text: '已确认', color: 'green' },
  };

  useEffect(() => {
    loadReports();
  }, [page, pageSize]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const result = await apiService.getInspectionList({ page, pageSize });
      setReports(result.list || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: number) => {
    navigate(`/inspections/${id}`);
  };

  const handleConfirm = async (id: number) => {
    try {
      await apiService.confirmInspection(id);
      message.success('确认成功');
      loadReports();
    } catch (error) {
      console.error('Failed to confirm report:', error);
    }
  };

  const columns = [
    { title: '报告编号', dataIndex: 'reportNo', key: 'reportNo' },
    { title: '门店名称', dataIndex: 'storeName', key: 'storeName' },
    { title: '任务名称', dataIndex: 'taskName', key: 'taskName' },
    { title: '检查日期', dataIndex: 'inspectionDate', key: 'inspectionDate' },
    {
      title: '得分率',
      dataIndex: 'scoreRate',
      key: 'scoreRate',
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          status={rate >= 60 ? 'normal' : 'exception'}
        />
      ),
    },
    {
      title: '是否合格',
      dataIndex: 'isPass',
      key: 'isPass',
      render: (isPass: number) => (
        <Tag color={isPass ? 'green' : 'red'}>{isPass ? '合格' : '不合格'}</Tag>
      ),
    },
    { title: '问题数量', dataIndex: 'problemCount', key: 'problemCount' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: ReportStatus) => <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: InspectionReport) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record.id)}>
            查看
          </Button>
          {record.status === 'submitted' && (
            <Button type="link" icon={<CheckCircleOutlined />} onClick={() => handleConfirm(record.id)}>
              确认
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>检查报告</h2>
      </div>

      <Table
        loading={loading}
        columns={columns}
        dataSource={reports}
        rowKey="id"
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps || 10);
          },
        }}
      />
    </div>
  );
};

export default InspectionList;
