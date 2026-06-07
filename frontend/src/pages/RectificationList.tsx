import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message, Modal, Form, Input, Select } from 'antd';
import { EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { RectificationOrder, RectificationStatus, RecheckResult } from '../types';
import { apiService } from '../services/api';

const { Option } = Select;

const RectificationList: React.FC = () => {
  const [orders, setOrders] = useState<RectificationOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [recheckModalVisible, setRecheckModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RectificationOrder | null>(null);
  const [form] = Form.useForm();
  const [recheckForm] = Form.useForm();
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const statusMap: Record<RectificationStatus, { text: string; color: string }> = {
    pending: { text: '待整改', color: 'orange' },
    rectified: { text: '已整改', color: 'blue' },
    rechecked: { text: '已复检', color: 'green' },
    overdue: { text: '已逾期', color: 'red' },
  };

  useEffect(() => {
    loadOrders();
  }, [page, pageSize]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const result = await apiService.getRectificationList({ page, pageSize });
      setOrders(result.list || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error('Failed to load rectifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRectification = (order: RectificationOrder) => {
    setSelectedOrder(order);
    form.resetFields();
    setSubmitModalVisible(true);
  };

  const handleSubmitConfirm = async () => {
    if (!selectedOrder) return;
    try {
      const values = await form.validateFields();
      await apiService.submitRectification(selectedOrder.id, values);
      message.success('提交成功');
      setSubmitModalVisible(false);
      loadOrders();
    } catch (error) {
      console.error('Failed to submit rectification:', error);
    }
  };

  const handleRecheck = (order: RectificationOrder) => {
    setSelectedOrder(order);
    recheckForm.resetFields();
    setRecheckModalVisible(true);
  };

  const handleRecheckConfirm = async () => {
    if (!selectedOrder) return;
    try {
      const values = await recheckForm.validateFields();
      await apiService.recheckRectification(selectedOrder.id, values);
      message.success('复检完成');
      setRecheckModalVisible(false);
      loadOrders();
    } catch (error) {
      console.error('Failed to recheck:', error);
    }
  };

  const columns = [
    { title: '整改单编号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '门店名称', dataIndex: 'storeName', key: 'storeName' },
    { title: '整改标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '整改期限', dataIndex: 'deadline', key: 'deadline' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: RectificationStatus) => (
        <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
      ),
    },
    {
      title: '复检结果',
      dataIndex: 'recheckResult',
      key: 'recheckResult',
      render: (result: RecheckResult) => {
        if (!result) return '-';
        return <Tag color={result === 'pass' ? 'green' : 'red'}>{result === 'pass' ? '通过' : '不通过'}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: RectificationOrder) => (
        <Space size="small">
          {record.status === 'pending' && (
            <Button type="link" onClick={() => handleSubmitRectification(record)}>
              提交整改
            </Button>
          )}
          {record.status === 'rectified' && (
            <Button type="link" icon={<CheckCircleOutlined />} onClick={() => handleRecheck(record)}>
              复检
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>整改管理</h2>
      </div>

      <Table
        loading={loading}
        columns={columns}
        dataSource={orders}
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

      <Modal
        title="提交整改"
        open={submitModalVisible}
        onOk={handleSubmitConfirm}
        onCancel={() => setSubmitModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="rectificationDescription" label="整改说明" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="请详细描述整改情况" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="复检"
        open={recheckModalVisible}
        onOk={handleRecheckConfirm}
        onCancel={() => setRecheckModalVisible(false)}
      >
        <Form form={recheckForm} layout="vertical">
          <Form.Item name="recheckResult" label="复检结果" rules={[{ required: true }]}>
            <Select>
              <Option value="pass">通过</Option>
              <Option value="fail">不通过</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RectificationList;
