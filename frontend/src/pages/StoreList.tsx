import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Store } from '../types';
import { apiService } from '../services/api';

const { Option } = Select;

const StoreList: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [form] = Form.useForm();
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadStores();
    loadAreas();
  }, [page, pageSize]);

  const loadStores = async () => {
    setLoading(true);
    try {
      const result = await apiService.getStoreList({ page, pageSize });
      setStores(result.list || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async () => {
    try {
      const tree = await apiService.getAreaTree();
      const flattenAreas = (arr: any[]): any[] => {
        let result: any[] = [];
        arr.forEach((item) => {
          result.push(item);
          if (item.children) {
            result = result.concat(flattenAreas(item.children));
          }
        });
        return result;
      };
      setAreas(flattenAreas(tree));
    } catch (error) {
      console.error('Failed to load areas:', error);
    }
  };

  const handleAdd = () => {
    setEditingStore(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    form.setFieldsValue(store);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteStore(id);
      message.success('删除成功');
      loadStores();
    } catch (error) {
      console.error('Failed to delete store:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingStore) {
        await apiService.updateStore(editingStore.id, values);
        message.success('更新成功');
      } else {
        await apiService.createStore(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadStores();
    } catch (error) {
      console.error('Failed to submit store:', error);
    }
  };

  const columns = [
    { title: '门店编码', dataIndex: 'code', key: 'code' },
    { title: '门店名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: '加盟商', dataIndex: 'franchiseeName', key: 'franchiseeName' },
    { title: '联系电话', dataIndex: 'franchiseePhone', key: 'franchiseePhone' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (status === 1 ? '正常营业' : '已关闭'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Store) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>门店管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增门店
        </Button>
      </div>

      <Table
        loading={loading}
        columns={columns}
        dataSource={stores}
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
        title={editingStore ? '编辑门店' : '新增门店'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="门店编码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="门店名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="areaId" label="所属区域" rules={[{ required: true }]}>
            <Select>
              {areas.map((area) => (
                <Option key={area.id} value={area.id}>
                  {area.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="address" label="门店地址" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="经纬度">
            <Space>
              <Form.Item name="longitude" noStyle rules={[{ required: true }]}>
                <InputNumber placeholder="经度" style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="latitude" noStyle rules={[{ required: true }]}>
                <InputNumber placeholder="纬度" style={{ width: 200 }} />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item name="checkinRadius" label="打卡有效半径(米)" initialValue={200}>
            <InputNumber min={50} max={1000} />
          </Form.Item>
          <Form.Item name="franchiseeName" label="加盟商姓名">
            <Input />
          </Form.Item>
          <Form.Item name="franchiseePhone" label="联系电话">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StoreList;
