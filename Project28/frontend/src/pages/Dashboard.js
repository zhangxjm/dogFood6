import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Spin, Alert } from 'antd';
import { RocketOutlined, WarningOutlined, GlobalOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { satelliteAPI, collisionAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSatellites: 0,
    operationalSatellites: 0,
    activeAlerts: 0,
    criticalAlerts: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [satellites, setSatellites] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [satellitesRes, alertsRes] = await Promise.all([
        satelliteAPI.getAll(),
        collisionAPI.getAlerts(0, 5, false),
      ]);

      const sats = satellitesRes.data;
      const alerts = alertsRes.data;

      const operationalCount = sats.filter(s => s.operational).length;
      const criticalCount = alerts.filter(a => a.alert_level === 'critical' && !a.resolved).length;

      setStats({
        totalSatellites: sats.length,
        operationalSatellites: operationalCount,
        activeAlerts: alerts.length,
        criticalAlerts: criticalCount,
      });

      setRecentAlerts(alerts.slice(0, 5));
      setSatellites(sats.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('加载数据失败，请检查后端服务是否正常运行');
    } finally {
      setLoading(false);
    }
  };

  const alertColumns = [
    {
      title: '卫星1',
      dataIndex: 'satellite1_id',
      key: 'satellite1_id',
    },
    {
      title: '卫星2',
      dataIndex: 'satellite2_id',
      key: 'satellite2_id',
    },
    {
      title: '预警级别',
      dataIndex: 'alert_level',
      key: 'alert_level',
      render: (level) => {
        const colorMap = {
          critical: 'red',
          warning: 'orange',
          advisory: 'blue',
        };
        const textMap = {
          critical: '严重',
          warning: '警告',
          advisory: '注意',
        };
        return <Tag color={colorMap[level]}>{textMap[level] || level}</Tag>;
      },
    },
    {
      title: '碰撞概率',
      dataIndex: 'probability',
      key: 'probability',
      render: (prob) => `${(prob * 100).toFixed(2)}%`,
    },
    {
      title: '碰撞时间',
      dataIndex: 'collision_time',
      key: 'collision_time',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
  ];

  const satelliteColumns = [
    {
      title: '卫星名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'NORAD ID',
      dataIndex: 'norad_id',
      key: 'norad_id',
    },
    {
      title: '类型',
      dataIndex: 'satellite_type',
      key: 'satellite_type',
    },
    {
      title: '状态',
      dataIndex: 'operational',
      key: 'operational',
      render: (op) => (
        <Tag color={op ? 'green' : 'red'}>
          {op ? '运行中' : '已停用'}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>加载中...</p>
      </div>
    );
  }

  return (
    <div>
      <Title level={2} className="page-header">数据概览</Title>

      {error && (
        <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="卫星总数"
              value={stats.totalSatellites}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="在轨运行"
              value={stats.operationalSatellites}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="活动预警"
              value={stats.activeAlerts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="严重预警"
              value={stats.criticalAlerts}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最近预警信息" extra={<Link to="/collision">查看全部</Link>}>
            <Table
              columns={alertColumns}
              dataSource={recentAlerts.map(function(a) { return { ...a, key: a.id }; })}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="卫星列表" extra={<Link to="/satellites">管理卫星</Link>}>
            <Table
              columns={satelliteColumns}
              dataSource={satellites.map(function(s) { return { ...s, key: s.id }; })}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
