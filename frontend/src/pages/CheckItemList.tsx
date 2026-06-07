import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Collapse, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { CheckCategory, CheckItem } from '../types';
import { apiService } from '../services/api';

const { Option } = Select;
const { Panel } = Collapse;

const CheckItemList: React.FC = () => {
  const [categories, setCategories] = useState<CheckCategory[]>([]);
  const [items, setItems] = useState<{ category: CheckCategory; items: CheckItem[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CheckCategory | null>(null);
  const [editingItem, setEditingItem] = useState<CheckItem | null>(null);
  const [categoryForm] = Form.useForm();
  const [itemForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, itemTree] = await Promise.all([
        apiService.getCategoryList(),
        apiService.getCheckItemTree(),
      ]);
      setCategories(cats);
      setItems(itemTree);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    setCategoryModalVisible(true);
  };

  const handleEditCategory = (cat: CheckCategory) => {
    setEditingCategory(cat);
    categoryForm.setFieldsValue(cat);
    setCategoryModalVisible(true);
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await apiService.deleteCategory(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleSubmitCategory = async () => {
    try {
      const values = await categoryForm.validateFields();
      if (editingCategory) {
        await apiService.updateCategory(editingCategory.id, values);
        message.success('更新成功');
      } else {
        await apiService.createCategory(values);
        message.success('创建成功');
      }
      setCategoryModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Failed to submit category:', error);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    itemForm.resetFields();
    setItemModalVisible(true);
  };

  const handleEditItem = (item: CheckItem) => {
    setEditingItem(item);
    itemForm.setFieldsValue(item);
    setItemModalVisible(true);
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await apiService.deleteCheckItem(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleSubmitItem = async () => {
    try {
      const values = await itemForm.validateFields();
      if (editingItem) {
        await apiService.updateCheckItem(editingItem.id, values);
        message.success('更新成功');
      } else {
        await apiService.createCheckItem(values);
        message.success('创建成功');
      }
      setItemModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Failed to submit item:', error);
    }
  };

  const itemColumns = [
    { title: '检查项名称', dataIndex: 'name', key: 'name' },
    { title: '权重', dataIndex: 'weight', key: 'weight', width: 80 },
    { title: '满分', dataIndex: 'maxScore', key: 'maxScore', width: 80 },
    { title: '必过项', dataIndex: 'mustPass', key: 'mustPass', width: 80, render: (v: number) => v ? '是' : '否' },
    { title: '操作', key: 'action', width: 150, render: (_: any, record: CheckItem) => (
      <Space size="small">
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditItem(record)}>编辑</Button>
        <Popconfirm title="确定删除?" onConfirm={() => handleDeleteItem(record.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>检查项管理</h2>
        <Space>
          <Button icon={<PlusOutlined />} onClick={handleAddCategory}>新增分类</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>新增检查项</Button>
        </Space>
      </div>
      <Collapse defaultActiveKey={items.map((_, i) => String(i))}>
        {items.map((group, index) => (
          <Panel header={`${group.category.name} (${group.items.length}项)`} key={index}>
            <Table dataSource={group.items} columns={itemColumns} rowKey="id" pagination={false} size="small" />
          </Panel>
        ))}
      </Collapse>
      <Modal title={editingCategory ? '编辑分类' : '新增分类'} open={categoryModalVisible} onOk={handleSubmitCategory} onCancel={() => setCategoryModalVisible(false)}>
        <Form form={categoryForm} layout="vertical">
          <Form.Item name="name" label="分类名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="code" label="分类编码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="sortOrder" label="排序" initialValue={0}><InputNumber /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea /></Form.Item>
        </Form>
      </Modal>
      <Modal title={editingItem ? '编辑检查项' : '新增检查项'} open={itemModalVisible} onOk={handleSubmitItem} onCancel={() => setItemModalVisible(false)} width={600}>
        <Form form={itemForm} layout="vertical">
          <Form.Item name="categoryId" label="所属分类" rules={[{ required: true }]}>
            <Select>{categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}</Select>
          </Form.Item>
          <Form.Item name="name" label="检查项名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="scoringCriteria" label="评分标准" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="weight" label="权重" initialValue={1}><InputNumber min={0} step={0.1} /></Form.Item>
          <Form.Item name="maxScore" label="满分" initialValue={10}><InputNumber min={0} /></Form.Item>
          <Form.Item name="mustPass" label="必过项" initialValue={0}><Select><Option value={0}>否</Option><Option value={1}>是</Option></Select></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CheckItemList;
