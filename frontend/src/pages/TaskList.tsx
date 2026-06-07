import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Space, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { SupervisionTask, TaskStatus, TaskType, Store } from '../types';
import { apiService } from '../services/api';

const { Option } = Select;
const { RangePicker } = DatePicker;

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<SupervisionTask[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<SupervisionTask | null>(null);
  const [selectedTask, setSelectedTask] = useState<SupervisionTask | null>(null);
  const [form] = Form.useForm();
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const statusMap: Record<TaskStatus, { text: string; color: string }> = {
    pending: { text: '待执行', color: 'orange' },
    in_progress: { text: '进行中', color: 'blue' },
    completed: { text: '已完成', color: 'green' },
    cancelled: { text: '已取消', color: 'default' },
  };

  const typeMap: Record<TaskType, string> = {
    routine: '例行检查',
    special: '专项检查',
    recheck: '复检',
  };

  useEffect(() => {
    loadTasks();
    loadStores();
  }, [page, pageSize]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const result = await apiService.getTaskList({ page, pageSize });
      setTasks(result.list || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStores = async () => {
    try {
      const result = await apiService.getStoreList({ pageSize: 100 });
      setStores(result.list || []);
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  };

  const handleAdd = () => {
    setEditingTask(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (task: SupervisionTask) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      dateRange: [dayjs(task.startDate), dayjs(task.endDate)],
    });
    setModalVisible(true);
  };

  const handleView = async (task: SupervisionTask) => {
    try {
      const detail = await apiService.getTaskDetail(task.id);
      setSelectedTask(detail);
      setDetailVisible(true);
    } catch (error) {
      console.error('Failed to load task detail:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteTask(id);
      message.success('删除成功');
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleChangeStatus = async (task: SupervisionTask, status: TaskStatus) => {
    try {
      await apiService.changeTaskStatus(task.id, status);
      message.success('状态更新成功');
      loadTasks();
    } catch (error) {
      console.error('Failed to change status:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const taskData = {
        ...values,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
      };
      delete taskData.dateRange;

      if (editingTask) {
        await apiService.updateTask(editingTask.id, taskData);
        message.success('更新成功');
      } else {
        await apiService.createTask(taskData);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadTasks();
    } catch (error) {
      console.error('Failed to submit task:', error);
    }
  };

  const columns = [
    { title: '任务编号', dataIndex: 'taskNo', key: 'taskNo' },
    { title: '任务名称', dataIndex: 'name', key: 'name' },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      key: 'taskType',
      render: (type: TaskType) => typeMap[type],
    },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate' },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: TaskStatus) => <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: SupervisionTask) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          {record.status === 'pending' && (
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              编辑
            </Button>
          )}
          {record.status === 'pending' && (
            <Button type="link" icon={<CheckCircleOutlined />} onClick={() => handleChangeStatus(record, 'in_progress')}>
              开始
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button type="link" icon={<CheckCircleOutlined />} onClick={() => handleChangeStatus(record, 'completed')}>
              完成
            </Button>
          )}
          {record.status === 'pending' && (
            <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>督导任务</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增任务
        </Button>
      </div>

      <Table
        loading={loading}
        columns={columns}
        dataSource={tasks}
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
        title={editingTask ? '编辑任务' : '新增任务'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="任务名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="taskType" label="任务类型" rules={[{ required: true }]}>
            <Select>
              <Option value="routine">例行检查</Option>
              <Option value="special">专项检查</Option>
              <Option value="recheck">复检</Option>
            </Select>
          </Form.Item>
          <Form.Item name="supervisorId" label="督导员" rules={[{ required: true }]}>
            <Select>
              <Option value={3}>李督导</Option>
              <Option value={4}>张督导</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="任务日期" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="storeIds" label="分配门店" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="请选择门店">
              {stores.map((store) => (
                <Option key={store.id} value={store.id}>
                  {store.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="任务描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="任务详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedTask && (
          <div>
            <p><strong>任务编号：</strong>{selectedTask.taskNo}</p>
            <p><strong>任务名称：</strong>{selectedTask.name}</p>
            <p><strong>任务类型：</strong>{typeMap[selectedTask.taskType]}</p>
            <p><strong>日期范围：</strong>{selectedTask.startDate} ~ {selectedTask.endDate}</p>
            <p><strong>状态：</strong>{statusMap[selectedTask.status].text}</p>
            <p><strong>描述：</strong>{selectedTask.description || '-'}</p>
            <h4 style={{ marginTop: 16 }}>关联门店</h4>
            <Table
              dataSource={selectedTask.stores || []}
              columns={[
                { title: '门店名称', dataIndex: 'storeName', key: 'storeName' },
                {
                  title: '检查状态',
                  dataIndex: 'checkStatus',
                  key: 'checkStatus',
                  render: (s: string) => {
                    const map: Record<string, string> = {
                      pending: '待检查',
                      checked: '已检查',
                      recheck_needed: '需复检',
                    };
                    return map[s] || s;
                  },
                },
                { title: '检查时间', dataIndex: 'checkedAt', key: 'checkedAt' },
              ]}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TaskList;
