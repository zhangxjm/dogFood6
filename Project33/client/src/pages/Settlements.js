import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  message,
  Modal,
  Form,
  Select,
  Input,
  Popconfirm,
  Tooltip
} from 'antd';
import { 
  ReloadOutlined, 
  PlayCircleOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { apiService } from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const Settlements = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();

  const currencies = ['CNY', 'USD', 'EUR', 'GBP', 'JPY', 'HKD'];

  useEffect(() => {
    loadData();
    loadSummary();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await apiService.getSettlements({ limit: 50 });
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      message.error('加载数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const result = await apiService.getSettlementSummary();
      if (result.success) {
        setSummary(result.data);
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  const handleProcess = async (id) => {
    try {
      await apiService.processSettlement(id);
      message.success('结算处理成功');
      loadData();
      loadSummary();
    } catch (error) {
      message.error('处理失败: ' + error.message);
    }
  };

  const handleBatchProcess = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要处理的结算记录');
      return;
    }
    try {
      const result = await apiService.batchProcessSettlements(selectedRowKeys);
      if (result.success) {
        message.success('批量处理完成');
        setSelectedRowKeys([]);
        loadData();
        loadSummary();
      }
    } catch (error) {
      message.error('批量处理失败: ' + error.message);
    }
  };

  const handleAutoSettle = async () => {
    try {
      const result = await apiService.autoSettle();
      if (result.success) {
        message.success(`自动结算完成: 成功 ${result.data.successful} 条, 失败 ${result.data.failed} 条`);
        loadData();
        loadSummary();
      }
    } catch (error) {
      message.error('自动结算失败: ' + error.message);
    }
  };

  const handleCreateSettlement = async () => {
    try {
      const values = await form.validateFields();
      await apiService.createSettlement(values);
      message.success('创建结算记录成功');
      setCreateModalVisible(false);
      form.resetFields();
      loadData();
      loadSummary();
    } catch (error) {
      message.error('创建失败: ' + error.message);
    }
  };

  const columns = [
    { title: '结算ID', dataIndex: 'id', key: 'id' },
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
      title: '原交易金额', 
      key: 'amount',
      render: (_, record) => (
        <span>{record.from_currency} {Number(record.amount || 0).toLocaleString()}</span>
      )
    },
    { 
      title: '结算金额', 
      key: 'settlement',
      render: (_, record) => (
        <span style={{ fontWeight: 'bold' }}>
          {record.settlement_currency} {Number(record.settlement_amount || 0).toLocaleString()}
        </span>
      )
    },
    { 
      title: '状态', 
      dataIndex: 'settlement_status', 
      key: 'settlement_status',
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待结算', icon: <ClockCircleOutlined /> },
          settled: { color: 'green', text: '已结算', icon: <CheckCircleOutlined /> },
          failed: { color: 'red', text: '失败', icon: <CloseCircleOutlined /> }
        };
        const s = statusMap[status] || { color: 'default', text: status };
        return <Tag icon={s.icon} color={s.color}>{s.text}</Tag>;
      }
    },
    { 
      title: '结算时间', 
      dataIndex: 'settled_at', 
      key: 'settled_at',
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
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
      width: 100,
      render: (_, record) => (
        <Space>
          {record.settlement_status === 'pending' && (
            <Popconfirm title="确认处理此结算？" onConfirm={() => handleProcess(record.id)}>
              <Button type="link" size="small" icon={<PlayCircleOutlined />}>处理</Button>
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
              title="结算总数" 
              value={summary?.total_count || 0} 
              prefix={<DollarOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="已结算" 
              value={summary?.settled_count || 0} 
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="待结算" 
              value={summary?.pending_count || 0} 
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="结算总金额" 
              value={summary?.total_settlement_amount || 0} 
              precision={2}
              prefix="¥"
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button 
            type="primary" 
            icon={<ThunderboltOutlined />} 
            onClick={handleAutoSettle}
          >
            自动结算
          </Button>
          <Button 
            icon={<PlayCircleOutlined />} 
            onClick={handleBatchProcess}
            disabled={selectedRowKeys.length === 0}
          >
            批量结算{selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ''}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
          <Button type="primary" onClick={() => setCreateModalVisible(true)}>创建结算</Button>
        </Space>
      </Card>

      <Table 
        columns={columns} 
        dataSource={data}
        rowKey="id"
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          getCheckboxProps: (record) => ({
            disabled: record.settlement_status !== 'pending'
          })
        }}
        pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条记录` }}
      />

      <Modal
        title="创建结算记录"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="transaction_id" label="交易ID" rules={[{ required: true, message: '请输入交易ID' }]}>
            <Input placeholder="请输入交易ID" />
          </Form.Item>
          <Form.Item name="settlement_currency" label="结算货币" rules={[{ required: true, message: '请选择结算货币' }]}>
            <Select placeholder="请选择结算货币">
              {currencies.map(currency => (
                <Option key={currency} value={currency}>{currency}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleCreateSettlement} block>
              创建结算
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settlements;
