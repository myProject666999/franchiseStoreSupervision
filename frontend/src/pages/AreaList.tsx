import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tree } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Area } from '../types';
import { apiService } from '../services/api';

const { Option } = Select;

const AreaList: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [form] = Form.useForm();
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadAreas();
    loadAreaTree();
  }, [page, pageSize]);

  const loadAreas = async () => {
    setLoading(true);
    try {
      const result = await apiService.getAreaList({ page, pageSize });
      setAreas(result.list || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error('Failed to load areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAreaTree = async () => {
    try {
      const tree = await apiService.getAreaTree();
      setTreeData(tree);
    } catch (error) {
      console.error('Failed to load area tree:', error);
    }
  };

  const handleAdd = () => {
    setEditingArea(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    form.setFieldsValue(area);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteArea(id);
      message.success('删除成功');
      loadAreas();
      loadAreaTree();
    } catch (error) {
      console.error('Failed to delete area:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingArea) {
        await apiService.updateArea(editingArea.id, values);
        message.success('更新成功');
      } else {
        await apiService.createArea(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadAreas();
      loadAreaTree();
    } catch (error) {
      console.error('Failed to submit area:', error);
    }
  };

  const levelMap: Record<number, string> = {
    1: '大区',
    2: '城市',
    3: '片区',
  };

  const columns = [
    { title: '区域编码', dataIndex: 'code', key: 'code' },
    { title: '区域名称', dataIndex: 'name', key: 'name' },
    {
      title: '层级',
      dataIndex: 'level',
      key: 'level',
      render: (level: number) => levelMap[level] || level,
    },
    { title: '操作', key: 'action', render: (_: any, record: Area) => (
      <Space>
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
        <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>区域管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增区域</Button>
      </div>
      <Table loading={loading} columns={columns} dataSource={areas} rowKey="id"
        pagination={{ current: page, pageSize, total, onChange: (p, ps) => { setPage(p); setPageSize(ps || 10); } }} />
      <Modal title={editingArea ? '编辑区域' : '新增区域'} open={modalVisible} onOk={handleSubmit} onCancel={() => setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="区域编码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="区域名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="level" label="层级" rules={[{ required: true }]}>
            <Select><Option value={1}>大区</Option><Option value={2}>城市</Option><Option value={3}>片区</Option></Select>
          </Form.Item>
          <Form.Item name="parentId" label="上级区域"><Select placeholder="请选择"><Option value={null}>无</Option></Select></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AreaList;
