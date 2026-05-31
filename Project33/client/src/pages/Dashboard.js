import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Space, Spin, message } from 'antd';
import { 
  UserOutlined, 
  BankOutlined, 
  TransactionOutlined, 
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { apiService } from '../services/api';
import dayjs from 'dayjs';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await apiService.getDashboard();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      message.error('加载数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const recentTransactionsColumns = [
    { title: '交易ID', dataIndex: 'id', key: 'id', width: 200, ellipsis: true },
    { title: '用户', dataIndex: 'real_name', key: 'real_name' },
    { 
      title: '金额', 
      key: 'amount',
      render: (_, record) => (
        <span>{record.from_currency} {Number(record.amount).toLocaleString()}</span>
      )
    },
    { 
      title: '兑换后', 
      key: 'converted',
      render: (_, record) => record.from_currency !== record.to_currency ? (
        <span>{record.to_currency} {Number(record.converted_amount || 0).toLocaleString()}</span>
      ) : '-'
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        const statusMap = {
          completed: { color: 'green', text: '已完成', icon: <CheckCircleOutlined /> },
          pending: { color: 'orange', text: '处理中', icon: <ClockCircleOutlined /> },
          failed: { color: 'red', text: '失败', icon: <CloseCircleOutlined /> },
          blocked: { color: 'purple', text: '已拦截', icon: <StopOutlined /> }
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
          low: { color: 'green', text: '低风险' },
          medium: { color: 'orange', text: '中风险' },
          high: { color: 'red', text: '高风险' },
          critical: { color: 'purple', text: '极高风险' }
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
    }
  ];

  const recentAlertsColumns = [
    { title: '告警ID', dataIndex: 'id', key: 'id' },
    { title: '交易ID', dataIndex: 'transaction_id', key: 'transaction_id', width: 150, ellipsis: true },
    { title: '用户', dataIndex: 'username', key: 'username' },
    { 
      title: '告警类型', 
      dataIndex: 'alert_type', 
      key: 'alert_type',
      render: (type) => <Tag color={type === 'block' ? 'red' : 'orange'}>{type === 'block' ? '拦截' : '警告'}</Tag>
    },
    { 
      title: '告警级别', 
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
      title: '创建时间', 
      dataIndex: 'created_at', 
      key: 'created_at',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    }
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-stat-card">
            <UserOutlined style={{ fontSize: 40, color: '#1890ff' }} />
            <div className="stat-value">{data?.users?.total || 0}</div>
            <div className="stat-label">用户总数</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-stat-card">
            <BankOutlined style={{ fontSize: 40, color: '#52c41a' }} />
            <div className="stat-value">{data?.accounts?.total || 0}</div>
            <div className="stat-label">账户总数</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-stat-card">
            <TransactionOutlined style={{ fontSize: 40, color: '#722ed1' }} />
            <div className="stat-value">{data?.transactions?.total_count || 0}</div>
            <div className="stat-label">交易总数</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="dashboard-stat-card">
            <WarningOutlined style={{ fontSize: 40, color: '#ff4d4f' }} />
            <div className="stat-value">{data?.alerts?.unresolved_alerts || 0}</div>
            <div className="stat-label">未处理告警</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="已完成交易" 
              value={data?.transactions?.completed_count || 0} 
              valueStyle={{ color: '#52c41a' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="处理中交易" 
              value={data?.transactions?.pending_count || 0} 
              valueStyle={{ color: '#faad14' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="已拦截交易" 
              value={data?.transactions?.blocked_count || 0} 
              valueStyle={{ color: '#722ed1' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="交易总金额" 
              value={data?.transactions?.total_amount || 0} 
              precision={2}
              prefix="¥"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="最近交易" extra={<a onClick={loadData}>刷新</a>}>
            <Table 
              columns={recentTransactionsColumns} 
              dataSource={data?.recent_transactions || []}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="最近告警" extra={<a onClick={loadData}>刷新</a>}>
            <Table 
              columns={recentAlertsColumns} 
              dataSource={data?.recent_alerts || []}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
