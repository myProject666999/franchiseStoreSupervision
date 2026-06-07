import React, { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';
import { CheckinRecord } from '../types';
import { apiService } from '../services/api';

const CheckinList: React.FC = () => {
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadRecords();
  }, [page, pageSize]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const result = await apiService.getCheckinList({ page, pageSize });
      setRecords(result.list || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error('Failed to load checkins:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '门店名称', dataIndex: 'storeName', key: 'storeName' },
    { title: '督导员', dataIndex: 'supervisorName', key: 'supervisorName' },
    { title: '打卡时间', dataIndex: 'checkinTime', key: 'checkinTime' },
    { title: '距离(米)', dataIndex: 'distance', key: 'distance' },
    { title: '经度', dataIndex: 'longitude', key: 'longitude' },
    { title: '纬度', dataIndex: 'latitude', key: 'latitude' },
    { title: '是否有效', dataIndex: 'isValid', key: 'isValid', render: (v: number) => <Tag color={v ? 'green' : 'red'}>{v ? '有效' : '无效'}</Tag> },
    { title: '无效原因', dataIndex: 'invalidReason', key: 'invalidReason' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}><h2 style={{ margin: 0 }}>打卡记录</h2></div>
      <Table loading={loading} columns={columns} dataSource={records} rowKey="id"
        pagination={{ current: page, pageSize, total, onChange: (p, ps) => { setPage(p); setPageSize(ps || 10); } }} />
    </div>
  );
};

export default CheckinList;
