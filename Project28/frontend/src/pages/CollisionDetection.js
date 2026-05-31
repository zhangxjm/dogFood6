import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Select, InputNumber,
  message, Tag, Space, Typography, Popconfirm, Spin, Row, Col, Statistic
} from 'antd';
import {
  WarningOutlined, SafetyOutlined, SearchOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { collisionAPI, satelliteAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const CollisionDetection = () => {
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [satellites, setSatellites] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [alertsRes, satellitesRes] = await Promise.all([
        collisionAPI.getAlerts(0, 50, false),
        satelliteAPI.getAll(),
      ]);

      setAlerts(alertsRes.data);
      setSatellites(satellitesRes.data);
    } catch (err) {
      message.error('加载数据失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanAll = async () => {
    try {
      setScanning(true);
      const response = await collisionAPI.scanAll();
      message.success(response.data.message);
      fetchData();
    } catch (err) {
      message.error('扫描失败');
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleCheckCollision = async (values) => {
    try {
      setScanning(true);
      await collisionAPI.check(values);
      message.success('碰撞检测完成');
      setModalVisible(false);
      fetchData();
    } catch (err) {
      if (err.response?.status === 404) {
        message.info('未检测到碰撞风险');
      } else {
        message.error('碰撞检测失败');
      }
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await collisionAPI.resolve(id);
      message.success('预警已标记为已处理');
      fetchData();
    } catch (err) {
      message.error('操作失败');
      console.error(err);
    }
  };

  const getAlertLevelConfig = (level) => {
    const configs = {
      critical: { color: 'red', text: '严重', icon: <ExclamationCircleOutlined /> },
      warning: { color: 'orange', text: '警告', icon: <WarningOutlined /> },
      advisory: { color: 'blue', text: '注意', icon: <SafetyOutlined /> },
    };
    return configs[level] || { color: 'default', text: level, icon: null };
  };

  const getSatelliteName = (id) => {
    const sat = satellites.find(s => s.id === id);
    return sat ? sat.name : `卫星 #${id}`;
  };

  const criticalCount = alerts.filter(a => a.alert_level === 'critical').length;
  const warningCount = alerts.filter(a => a.alert_level === 'warning').length;

  const columns = [
    {
      title: '预警级别',
      dataIndex: 'alert_level',
      key: 'alert_level',
      width: 100,
      render: (level) => {
        const config = getAlertLevelConfig(level);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '卫星 1',
      dataIndex: 'satellite1_id',
      key: 'satellite1_id',
      render: (id) => getSatelliteName(id),
    },
    {
      title: '卫星 2',
      dataIndex: 'satellite2_id',
      key: 'satellite2_id',
      render: (id) => getSatelliteName(id),
    },
    {
      title: '碰撞概率',
      dataIndex: 'probability',
      key: 'probability',
      width: 100,
      render: (prob) => (
        <span style={{
          color: prob > 0.5 ? '#ff4d4f' : prob > 0.1 ? '#faad14' : '#52c41a',
          fontWeight: 'bold'
        }}>
          {(prob * 100).toFixed(2)}%
        </span>
      ),
    },
    {
      title: '最小距离 (km)',
      dataIndex: 'miss_distance',
      key: 'miss_distance',
      width: 120,
      render: (dist) => dist ? dist.toFixed(3) : '-',
    },
    {
      title: '相对速度 (km/s)',
      dataIndex: 'relative_velocity',
      key: 'relative_velocity',
      width: 130,
      render: (vel) => vel ? vel.toFixed(2) : '-',
    },
    {
      title: '预计碰撞时间',
      dataIndex: 'collision_time',
      key: 'collision_time',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="确定将此预警标记为已处理？"
            onConfirm={() => handleResolve(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
            >
              标记处理
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} className="page-header" style={{ margin: 0 }}>
          碰撞预警
        </Title>
        <Space>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => setModalVisible(true)}
          >
            指定卫星检测
          </Button>
          <Button
            danger
            icon={<WarningOutlined />}
            onClick={handleScanAll}
            loading={scanning}
          >
            全域碰撞扫描
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="活动预警总数"
              value={alerts.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="严重预警"
              value={criticalCount}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="警告预警"
              value={warningCount}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={alerts.map(function(a) { return { ...a, key: a.id }; })}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条预警`,
            }}
            rowClassName={(record) => {
              if (record.alert_level === 'critical') return 'collision-alert-critical';
              if (record.alert_level === 'warning') return 'collision-alert-warning';
              return 'collision-alert-advisory';
            }}
          />
        )}
      </Card>

      <Modal
        title="指定卫星碰撞检测"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCheckCollision}
          initialValues={{
            time_window: 86400,
            threshold_distance: 10,
          }}
        >
          <Form.Item
            name="satellite1_id"
            label="卫星 1"
            rules={[{ required: true, message: '请选择卫星' }]}
          >
            <Select placeholder="请选择第一颗卫星">
              {satellites.map(sat => (
                <Option key={sat.id} value={sat.id}>{sat.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="satellite2_id"
            label="卫星 2"
            rules={[{ required: true, message: '请选择卫星' }]}
          >
            <Select placeholder="请选择第二颗卫星">
              {satellites.map(sat => (
                <Option key={sat.id} value={sat.id}>{sat.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
                name="time_window"
                label="时间窗口 (秒)"
                rules={[{ required: true, message: '请输入时间窗口' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={3600}
                  max={604800}
                  step={3600}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="threshold_distance"
                label="预警阈值 (km)"
                rules={[{ required: true, message: '请输入预警阈值' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={100}
                  step={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={scanning}>
                开始检测
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CollisionDetection;
