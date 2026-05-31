import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, List, Tag, Space, Typography } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { diagnosisAPI, recordsAPI, petsAPI } from '../services/api';

const { Title } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, recordsRes, petsRes] = await Promise.all([
        diagnosisAPI.getStats(),
        recordsAPI.getAll(),
        petsAPI.getAll(),
      ]);
      setStats(statsRes.data);
      setRecords(recordsRes.data.slice(0, 5));
      setPets(petsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = stats?.by_severity?.map((item) => ({
    name: item.severity_level,
    value: item.count,
  })) || [];

  const barData = stats?.top_diseases?.map((item) => ({
    name: item.top_disease_name,
    count: item.count,
  })) || [];

  const COLORS = ['#52c41a', '#faad14', '#fa8c16', '#f5222d', '#1890ff'];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      diagnosed: 'blue',
      confirmed: 'green',
      archived: 'gray',
    };
    return colors[status] || 'gray';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: '待诊断',
      diagnosed: '已诊断',
      confirmed: '已确认',
      archived: '已归档',
    };
    return texts[status] || status;
  };

  return (
    <div>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>仪表盘</Title>
      </div>

      <div style={{ padding: 24 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="总诊断数"
                value={stats?.total_diagnoses || 0}
                prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="待审核"
                value={stats?.pending_review || 0}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="宠物数量"
                value={pets.length}
                prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="医疗记录"
                value={records.length}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="诊断严重程度分布" loading={loading}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="常见病症统计" loading={loading}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1890ff" name="病例数" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="最近医疗记录" loading={loading}>
              <List
                dataSource={records}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      avatar={<AlertOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                      title={item.title}
                      description={
                        <Space>
                          <Tag color={getStatusColor(item.status)}>{getStatusText(item.status)}</Tag>
                          <span style={{ color: '#999' }}>{item.pet_name}</span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="我的宠物" loading={loading}>
              <List
                dataSource={pets}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      avatar={
                        <div className="pet-avatar">
                          {item.name.charAt(0)}
                        </div>
                      }
                      title={item.name}
                      description={
                        <Space>
                          <span>{item.species_display}</span>
                          <span style={{ color: '#999' }}>{item.breed || '未知品种'}</span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Dashboard;
