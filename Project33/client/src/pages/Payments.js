import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Tag, 
  message, 
  Popconfirm,
  Card,
  Row,
  Col,
  Descriptions,
  Statistic,
  Spin,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  ReloadOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  UndoOutlined
} from '@ant-design/icons';
import { apiService } from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const Payments = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const currencies = ['CNY', 'USD', 'EUR', 'GBP', 'JPY', 'HKD'];
  const transactionTypes = [
    { value: 'exchange', label: '货币兑换' },
    { value: 'cross_border', label: '跨境支付' },
    { value: 'withdrawal', label: '提现' },
    { value: 'deposit', label: '充值' }
  ];
  const paymentMethods = [
    { value: 'bank_transfer', label: '银行转账' },
    { value: 'swift', label: 'SWIFT汇款' },
    { value: 'alipay', label: '支付宝' },
    { value: 'wechat', label: '微信支付' }
  ];

  useEffect(() => {
    loadUsers();
    loadData();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await apiService.getUsers();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('加载用户失败:', error);
    }
  };

  const loadData = async (params = {}) => {
    try {
      setLoading(true);
      const result = await apiService.getTransactions({
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize,
        ...params
      });
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      message.error('加载数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const result = await apiService.createPayment(values);
      if (result.success) {
        message.success('创建支付订单成功');
        if (result.data.blocked) {
          message.warning('交易已被风控系统拦截');
        }
        setCreateModalVisible(false);
        form.resetFields();
        loadData();
      }
    } catch (error) {
      message.error('创建失败: ' + error.message);
    }
  };

  const handleProcess = async (id) => {
    try {
      const result = await apiService.processPayment(id);
      if (result.success) {
        message.success('支付处理成功');
        loadData();
      }
    } catch (error) {
      message.error('处理失败: ' + error.message);
    }
  };

  const handleRefund = async (id) => {
    try {
      const result = await apiService.refundPayment(id, { reason: '用户申请退款' });
      if (result.success) {
        message.success('退款成功');
        loadData();
      }
    } catch (error) {
      message.error('退款失败: ' + error.message);
    }
  };

  const columns = [
    { 
      title: '交易ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: 180, 
      ellipsis: true,
      render: (text) => <Tooltip title={text}>{text.slice(0, 15)}...</Tooltip>
    },
    { title: '用户', dataIndex: 'real_name', key: 'real_name' },
    { 
      title: '金额', 
      key: 'amount',
      render: (_, record) => (
        <div>
          <div>{record.from_currency} {Number(record.amount).toLocaleString()}</div>
          {record.from_currency !== record.to_currency && (
            <div style={{ color: '#999', fontSize: 12 }}>
              → {record.to_currency} {Number(record.converted_amount || 0).toLocaleString()}
            </div>
          )}
        </div>
      )
    },
    { 
      title: '手续费', 
      dataIndex: 'fee', 
      key: 'fee',
      render: (fee) => fee ? Number(fee).toFixed(2) : '0.00'
    },
    { 
      title: '类型', 
      dataIndex: 'transaction_type', 
      key: 'transaction_type',
      render: (type) => {
        const typeMap = {
          exchange: '货币兑换',
          cross_border: '跨境支付',
          withdrawal: '提现',
          deposit: '充值'
        };
        return typeMap[type] || type;
      }
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        const statusMap = {
          completed: { color: 'green', text: '已完成', icon: <CheckCircleOutlined /> },
          pending: { color: 'orange', text: '处理中', icon: <ClockCircleOutlined /> },
          processing: { color: 'blue', text: '处理中', icon: <ClockCircleOutlined /> },
          failed: { color: 'red', text: '失败', icon: <CloseCircleOutlined /> },
          blocked: { color: 'purple', text: '已拦截', icon: <StopOutlined /> },
          refunded: { color: 'cyan', text: '已退款', icon: <UndoOutlined /> }
        };
        const s = statusMap[status] || { color: 'default', text: status };
        return <Tag icon={s.icon} color={s.color}>{s.text}</Tag>;
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
          high: { color: 'red', text: '高' },
          critical: { color: 'purple', text: '极高' }
        };
        const l = levelMap[level] || { color: 'default', text: level };
        return <Tag color={l.color}>{l.text}</Tag>;
      }
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
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentTransaction(record);
              setDetailModalVisible(true);
            }}
          >
            详情
          </Button>
          {record.status === 'pending' && record.is_blocked !== 1 && (
            <Popconfirm title="确认处理此交易？" onConfirm={() => handleProcess(record.id)}>
              <Button type="link" size="small" icon={<PlayCircleOutlined />}>处理</Button>
            </Popconfirm>
          )}
          {record.status === 'completed' && (
            <Popconfirm title="确认退款此交易？" onConfirm={() => handleRefund(record.id)}>
              <Button type="link" size="small" danger icon={<UndoOutlined />}>退款</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
            创建支付
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => loadData()}>
            刷新
          </Button>
        </Space>
      </Card>

      <Table 
        columns={columns} 
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        onChange={(pag) => setPagination(pag)}
      />

      <Modal
        title="创建支付订单"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="user_id" label="用户" rules={[{ required: true, message: '请选择用户' }]}>
                <Select placeholder="请选择用户">
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>{user.real_name} ({user.username})</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="transaction_type" label="交易类型" rules={[{ required: true, message: '请选择交易类型' }]}>
                <Select placeholder="请选择交易类型">
                  {transactionTypes.map(type => (
                    <Option key={type.value} value={type.value}>{type.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="from_currency" label="源货币" rules={[{ required: true, message: '请选择源货币' }]}>
                <Select placeholder="请选择源货币">
                  {currencies.map(currency => (
                    <Option key={currency} value={currency}>{currency}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="to_currency" label="目标货币" rules={[{ required: true, message: '请选择目标货币' }]}>
                <Select placeholder="请选择目标货币">
                  {currencies.map(currency => (
                    <Option key={currency} value={currency}>{currency}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
                <InputNumber style={{ width: '100%' }} min={0.01} step={100} placeholder="请输入金额" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="payment_method" label="支付方式" rules={[{ required: true, message: '请选择支付方式' }]}>
                <Select placeholder="请选择支付方式">
                  {paymentMethods.map(method => (
                    <Option key={method.value} value={method.value}>{method.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" onClick={handleCreate} block>
              创建支付订单
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="交易详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {currentTransaction && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="交易ID" span={2}>{currentTransaction.id}</Descriptions.Item>
            <Descriptions.Item label="用户">{currentTransaction.real_name}</Descriptions.Item>
            <Descriptions.Item label="类型">
              {transactionTypes.find(t => t.value === currentTransaction.transaction_type)?.label || currentTransaction.transaction_type}
            </Descriptions.Item>
            <Descriptions.Item label="源金额">
              {currentTransaction.from_currency} {Number(currentTransaction.amount).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="目标金额">
              {currentTransaction.to_currency} {Number(currentTransaction.converted_amount || 0).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="汇率">{currentTransaction.exchange_rate || 1}</Descriptions.Item>
            <Descriptions.Item label="手续费">{Number(currentTransaction.fee || 0).toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="支付方式">
              {paymentMethods.find(m => m.value === currentTransaction.payment_method)?.label || currentTransaction.payment_method}
            </Descriptions.Item>
            <Descriptions.Item label="状态" span={2}>
              <Tag color={currentTransaction.status === 'completed' ? 'green' : 'orange'}>
                {currentTransaction.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="风险等级" span={2}>
              <Tag color={currentTransaction.risk_level === 'low' ? 'green' : currentTransaction.risk_level === 'medium' ? 'orange' : 'red'}>
                {currentTransaction.risk_level}
              </Tag>
              {currentTransaction.risk_score && ` (分数: ${currentTransaction.risk_score})`}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>
              {dayjs(currentTransaction.created_at).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            {currentTransaction.seata_xid && (
              <Descriptions.Item label="Seata XID" span={2}>{currentTransaction.seata_xid}</Descriptions.Item>
            )}
            {currentTransaction.block_reason && (
              <Descriptions.Item label="拦截原因" span={2}>{currentTransaction.block_reason}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Payments;
