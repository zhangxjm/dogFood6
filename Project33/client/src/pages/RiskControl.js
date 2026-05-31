import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
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
  Statistic,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  ReloadOutlined, 
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SafetyCertificateOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { apiService } from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const RiskControl = () => {
  const [rules, setRules] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState({ rules: false, alerts: false });
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form] = Form.useForm();

  const ruleTypes = [
    { value: 'amount_threshold', label: '金额阈值' },
    { value: 'frequency', label: '交易频率' },
    { value: 'country_restriction', label: '国家限制' },
    { value: 'suspicious_pattern', label: '可疑模式' },
    { value: 'balance_check', label: '余额检查' },
    { value: 'night_time', label: '夜间交易' },
    { value: 'velocity', label: '交易速度' },
    { value: 'round_amount', label: '整数金额' },
    { value: 'new_account', label: '新账户' }
  ];

  const actions = [
    { value: 'alert', label: '告警' },
    { value: 'block', label: '拦截' }
  ];

  useEffect(() => {
    loadRules();
    loadAlerts();
    loadStatistics();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(prev => ({ ...prev, rules: true }));
      const result = await apiService.getRiskRules();
      if (result.success) {
        setRules(result.data);
      }
    } catch (error) {
      message.error('加载规则失败: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, rules: false }));
    }
  };

  const loadAlerts = async () => {
    try {
      setLoading(prev => ({ ...prev, alerts: true }));
      const result = await apiService.getRiskAlerts({ limit: 50 });
      if (result.success) {
        setAlerts(result.data);
      }
    } catch (error) {
      message.error('加载告警失败: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, alerts: false }));
    }
  };

  const loadStatistics = async () => {
    try {
      const result = await apiService.getRiskStatistics();
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    form.resetFields();
    setRuleModalVisible(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    form.setFieldsValue(rule);
    setRuleModalVisible(true);
  };

  const handleSaveRule = async () => {
    try {
      const values = await form.validateFields();
      if (editingRule) {
        await apiService.updateRiskRule(editingRule.id, values);
        message.success('规则更新成功');
      } else {
        await apiService.createRiskRule(values);
        message.success('规则创建成功');
      }
      setRuleModalVisible(false);
      form.resetFields();
      loadRules();
    } catch (error) {
      message.error('保存失败: ' + error.message);
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      await apiService.deleteRiskRule(id);
      message.success('规则删除成功');
      loadRules();
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      await apiService.resolveRiskAlert(id);
      message.success('告警已处理');
      loadAlerts();
      loadStatistics();
    } catch (error) {
      message.error('处理失败: ' + error.message);
    }
  };

  const handleUnblockTransaction = async (transactionId) => {
    try {
      await apiService.unblockTransaction(transactionId);
      message.success('交易已解锁');
      loadAlerts();
      loadStatistics();
    } catch (error) {
      message.error('解锁失败: ' + error.message);
    }
  };

  const rulesColumns = [
    { title: '规则名称', dataIndex: 'rule_name', key: 'rule_name' },
    { 
      title: '规则类型', 
      dataIndex: 'rule_type', 
      key: 'rule_type',
      render: (type) => ruleTypes.find(t => t.value === type)?.label || type
    },
    { title: '阈值', dataIndex: 'threshold', key: 'threshold', render: (v) => v || '-' },
    { 
      title: '动作', 
      dataIndex: 'action', 
      key: 'action',
      render: (action) => (
        <Tag color={action === 'block' ? 'red' : 'orange'}>
          {actions.find(a => a.value === action)?.label || action}
        </Tag>
      )
    },
    { title: '优先级', dataIndex: 'priority', key: 'priority' },
    { 
      title: '状态', 
      dataIndex: 'is_active', 
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'default'}>{active ? '启用' : '禁用'}</Tag>
      )
    },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditRule(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除此规则？" onConfirm={() => handleDeleteRule(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const alertsColumns = [
    { title: '告警ID', dataIndex: 'id', key: 'id' },
    { 
      title: '交易ID', 
      dataIndex: 'transaction_id', 
      key: 'transaction_id', 
      width: 150,
      ellipsis: true,
      render: (text) => <Tooltip title={text}>{text?.slice(0, 15)}...</Tooltip>
    },
    { title: '用户', dataIndex: 'username', key: 'username' },
    { 
      title: '类型', 
      dataIndex: 'alert_type', 
      key: 'alert_type',
      render: (type) => <Tag color={type === 'block' ? 'red' : 'orange'}>{type === 'block' ? '拦截' : '警告'}</Tag>
    },
    { 
      title: '级别', 
      dataIndex: 'alert_level', 
      key: 'alert_level',
      render: (level) => {
        const levelMap = {
          warning: { color: 'orange', text: '警告' },
          high: { color: 'red', text: '高危' },
          critical: { color: 'purple', text: '严重' }
        };
        const l = levelMap[level] || { color: 'default', text: level };
        return <Tag color={l.color}>{l.text}</Tag>;
      }
    },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { 
      title: '状态', 
      dataIndex: 'is_resolved', 
      key: 'is_resolved',
      render: (resolved) => (
        <Tag color={resolved ? 'green' : 'red'}>{resolved ? '已处理' : '未处理'}</Tag>
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
      width: 150,
      render: (_, record) => (
        <Space>
          {!record.is_resolved && (
            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleResolveAlert(record.id)}>
              处理
            </Button>
          )}
          {record.alert_type === 'block' && (
            <Popconfirm title="确认解锁此交易？" onConfirm={() => handleUnblockTransaction(record.transaction_id)}>
              <Button type="link" size="small" icon={<UnlockOutlined />}>解锁交易</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="告警总数" 
              value={statistics?.alerts?.total_alerts || 0} 
              prefix={<WarningOutlined style={{ color: '#faad14' }} />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="未处理告警" 
              value={statistics?.alerts?.unresolved_alerts || 0} 
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<SafetyCertificateOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="严重告警" 
              value={statistics?.alerts?.critical_alerts || 0} 
              valueStyle={{ color: '#722ed1' }}
              prefix={<WarningOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="风控规则数" 
              value={rules.length} 
              prefix={<SafetyCertificateOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        items={[
          {
            key: 'alerts',
            label: '风控告警',
            children: (
              <>
                <Card style={{ marginBottom: 16 }}>
                  <Space>
                    <Button icon={<ReloadOutlined />} onClick={loadAlerts}>刷新</Button>
                  </Space>
                </Card>
                <Table 
                  columns={alertsColumns} 
                  dataSource={alerts}
                  rowKey="id"
                  loading={loading.alerts}
                  pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条记录` }}
                />
              </>
            )
          },
          {
            key: 'rules',
            label: '风控规则',
            children: (
              <>
                <Card style={{ marginBottom: 16 }}>
                  <Space>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateRule}>
                      新增规则
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={loadRules}>刷新</Button>
                  </Space>
                </Card>
                <Table 
                  columns={rulesColumns} 
                  dataSource={rules}
                  rowKey="id"
                  loading={loading.rules}
                  pagination={false}
                />
              </>
            )
          }
        ]}
      />

      <Modal
        title={editingRule ? '编辑风控规则' : '新增风控规则'}
        open={ruleModalVisible}
        onCancel={() => setRuleModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="rule_name" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
                <Input placeholder="请输入规则名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="rule_type" label="规则类型" rules={[{ required: true, message: '请选择规则类型' }]}>
                <Select placeholder="请选择规则类型">
                  {ruleTypes.map(type => (
                    <Option key={type.value} value={type.value}>{type.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="threshold" label="阈值">
                <InputNumber style={{ width: '100%' }} placeholder="请输入阈值" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="action" label="触发动作" rules={[{ required: true, message: '请选择动作' }]}>
                <Select placeholder="请选择动作">
                  {actions.map(action => (
                    <Option key={action.value} value={action.value}>{action.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="priority" label="优先级" rules={[{ required: true, message: '请输入优先级' }]}>
                <InputNumber style={{ width: '100%' }} min={0} max={10} placeholder="0-10" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_active" label="状态" initialValue={1}>
                <Select>
                  <Option value={1}>启用</Option>
                  <Option value={0}>禁用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="condition" label="条件表达式" rules={[{ required: true, message: '请输入条件' }]}>
            <Input placeholder="例如: amount > threshold" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入规则描述" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleSaveRule} block>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RiskControl;
