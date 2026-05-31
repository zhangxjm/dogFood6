import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Card,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  message,
  Row,
  Col,
  Descriptions,
  Statistic,
  Tooltip
} from 'antd';
import { 
  ReloadOutlined, 
  PlusOutlined, 
  EditOutlined,
  UserOutlined,
  BankOutlined
} from '@ant-design/icons';
import { apiService } from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const Users = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  const currencies = ['CNY', 'USD', 'EUR', 'GBP', 'JPY', 'HKD'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await apiService.getUsers();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      message.error('加载数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserAccounts = async (userId) => {
    try {
      const result = await apiService.getUserAccounts(userId);
      if (result.success) {
        setAccounts(result.data);
      }
    } catch (error) {
      message.error('加载账户失败: ' + error.message);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleViewAccounts = async (user) => {
    setSelectedUser(user);
    await loadUserAccounts(user.id);
    setAccountModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await apiService.updateUser(editingUser.id, values);
        message.success('用户更新成功');
      } else {
        await apiService.createUser(values);
        message.success('用户创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error('保存失败: ' + error.message);
    }
  };

  const columns = [
    { title: '用户ID', dataIndex: 'id', key: 'id' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '真实姓名', dataIndex: 'real_name', key: 'real_name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '禁用'}
        </Tag>
      )
    },
    { 
      title: '创建时间', 
      dataIndex: 'created_at', 
      key: 'created_at',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small" 
            icon={<BankOutlined />}
            onClick={() => handleViewAccounts(record)}
          >
            账户
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
        </Space>
      )
    }
  ];

  const accountColumns = [
    { title: '账户ID', dataIndex: 'id', key: 'id' },
    { title: '货币', dataIndex: 'currency', key: 'currency' },
    { 
      title: '余额', 
      dataIndex: 'balance', 
      key: 'balance',
      render: (balance, record) => (
        <span style={{ fontWeight: 'bold' }}>
          {record.currency} {Number(balance).toLocaleString()}
        </span>
      )
    },
    { 
      title: '冻结金额', 
      dataIndex: 'frozen_amount', 
      key: 'frozen_amount',
      render: (amount, record) => (
        <span style={{ color: '#faad14' }}>
          {record.currency} {Number(amount || 0).toLocaleString()}
        </span>
      )
    },
    { 
      title: '账户类型', 
      dataIndex: 'account_type', 
      key: 'account_type',
      render: (type) => {
        const typeMap = {
          admin: { color: 'purple', text: '管理员' },
          vip: { color: 'gold', text: 'VIP' },
          normal: { color: 'blue', text: '普通' },
          high_risk: { color: 'red', text: '高风险' }
        };
        const t = typeMap[type] || { color: 'default', text: type };
        return <Tag color={t.color}>{t.text}</Tag>;
      }
    },
    { 
      title: '风险等级', 
      dataIndex: 'risk_level', 
      key: 'risk_level',
      render: (level) => {
        const levelMap = {
          low: { color: 'green', text: '低' },
          medium: { color: 'orange', text: '中' },
          high: { color: 'red', text: '高' }
        };
        const l = levelMap[level] || { color: 'default', text: level };
        return <Tag color={l.color}>{l.text}</Tag>;
      }
    }
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增用户
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
        </Space>
      </Card>

      <Table 
        columns={columns} 
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条记录` }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical">
          {!editingUser && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input placeholder="请输入用户名" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                    <Input.Password placeholder="请输入密码" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="real_name" label="真实姓名" rules={[{ required: true, message: '请输入真实姓名' }]}>
                <Input placeholder="请输入真实姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="手机号">
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" initialValue="active">
                <Select>
                  <Option value="active">正常</Option>
                  <Option value="disabled">禁用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" onClick={handleSave} block>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${selectedUser?.real_name || ''} 的账户列表`}
        open={accountModalVisible}
        onCancel={() => setAccountModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table 
          columns={accountColumns} 
          dataSource={accounts}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  );
};

export default Users;
