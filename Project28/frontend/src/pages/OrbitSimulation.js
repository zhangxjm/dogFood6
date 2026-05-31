import React, { useState, useEffect } from 'react';
import {
  Card, Form, InputNumber, Button, Select, Row, Col,
  Statistic, Typography, message, Space, Spin
} from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { orbitAPI, satelliteAPI } from '../services/api';
import OrbitVisualization from '../components/OrbitVisualization';

const { Title } = Typography;
const { Option } = Select;

const OrbitSimulation = () => {
  const [form] = Form.useForm();
  const [calculating, setCalculating] = useState(false);
  const [satellites, setSatellites] = useState([]);
  const [orbitResult, setOrbitResult] = useState(null);
  const [orbitElements, setOrbitElements] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [visualizationData, setVisualizationData] = useState([]);

  useEffect(() => {
    const fetchSatellites = async () => {
      try {
        const response = await satelliteAPI.getAll();
        setSatellites(response.data);
        if (response.data.length > 0) {
          loadSatelliteOrbit(response.data[0].id);
        }
      } catch (err) {
        message.error('加载卫星列表失败');
        console.error(err);
      }
    };

    fetchSatellites();
  }, []);

  const loadSatelliteOrbit = async (satelliteId) => {
    try {
      const orbitRes = await satelliteAPI.getOrbit(satelliteId);
      const orbit = orbitRes.data;

      form.setFieldsValue({
        semi_major_axis: orbit.semi_major_axis,
        eccentricity: orbit.eccentricity,
        inclination: orbit.inclination,
        raan: orbit.raan,
        arg_of_perigee: orbit.arg_of_perigee,
        true_anomaly: orbit.true_anomaly,
        time_step: 60,
        duration: 3600,
      });

      setSelectedSatellite(satelliteId);
      await calculateOrbit({
        semi_major_axis: orbit.semi_major_axis,
        eccentricity: orbit.eccentricity,
        inclination: orbit.inclination,
        raan: orbit.raan,
        arg_of_perigee: orbit.arg_of_perigee,
        true_anomaly: orbit.true_anomaly,
        time_step: 60,
        duration: 3600,
      });
    } catch (err) {
      console.error('加载轨道参数失败', err);
    }
  };

  const calculateOrbit = async (values) => {
    try {
      setCalculating(true);

      const [calcRes, elementsRes] = await Promise.all([
        orbitAPI.calculate(values),
        orbitAPI.getElements(values.semi_major_axis, values.eccentricity),
      ]);

      setOrbitResult(calcRes.data);
      setOrbitElements(elementsRes.data);

      const sat = satellites.find(s => s.id === selectedSatellite);
      const satName = sat ? sat.name : '自定义卫星';
      setVisualizationData([{
        name: satName,
        positions: calcRes.data.positions
      }]);

    } catch (err) {
      message.error('轨道计算失败');
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = (values) => {
    calculateOrbit(values);
  };

  const handleSatelliteChange = (satelliteId) => {
    loadSatelliteOrbit(satelliteId);
  };

  const handleReset = () => {
    form.resetFields();
    setOrbitResult(null);
    setOrbitElements(null);
    setVisualizationData([]);
  };

  return (
    <div>
      <Title level={2} className="page-header">轨道仿真</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="轨道参数设置" className="orbit-form-card">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                semi_major_axis: 6780,
                eccentricity: 0.001,
                inclination: 45,
                raan: 0,
                arg_of_perigee: 0,
                true_anomaly: 0,
                time_step: 60,
                duration: 3600,
              }}
            >
              <Form.Item label="选择卫星">
                <Select
                  placeholder="选择已有卫星加载轨道参数"
                  onChange={handleSatelliteChange}
                  value={selectedSatellite}
                  allowClear
                >
                  {satellites.map(sat => (
                    <Option key={sat.id} value={sat.id}>{sat.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="semi_major_axis"
                label="半长轴 (km)"
                rules={[{ required: true, message: '请输入半长轴' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={6500}
                  max={50000}
                  step={1}
                />
              </Form.Item>

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="eccentricity"
                    label="偏心率"
                    rules={[{ required: true, message: '请输入偏心率' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={0.9}
                      step={0.0001}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="inclination"
                    label="倾角 (°)"
                    rules={[{ required: true, message: '请输入倾角' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={180}
                      step={0.1}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="raan"
                    label="升交点赤经 (°)"
                    rules={[{ required: true, message: '请输入升交点赤经' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={360}
                      step={0.1}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="arg_of_perigee"
                    label="近地点幅角 (°)"
                    rules={[{ required: true, message: '请输入近地点幅角' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={360}
                      step={0.1}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="true_anomaly"
                label="真近点角 (°)"
                rules={[{ required: true, message: '请输入真近点角' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={360}
                  step={0.1}
                />
              </Form.Item>

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="time_step"
                    label="时间步长 (秒)"
                    rules={[{ required: true, message: '请输入时间步长' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={1}
                      max={3600}
                      step={1}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="duration"
                    label="仿真时长 (秒)"
                    rules={[{ required: true, message: '请输入仿真时长' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={60}
                      max={86400}
                      step={60}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={calculating}
                    block
                  >
                    开始计算
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    block
                  >
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          {orbitElements && (
            <Card title="轨道要素" style={{ marginTop: 16 }}>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Statistic
                    title="轨道周期 (分钟)"
                    value={orbitElements.orbital_period_minutes}
                    precision={2}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="近地点高度 (km)"
                    value={orbitElements.periapsis_altitude_km}
                    precision={1}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="远地点高度 (km)"
                    value={orbitElements.apoapsis_altitude_km}
                    precision={1}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="轨道点数"
                    value={orbitResult?.positions?.length || 0}
                  />
                </Col>
              </Row>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="3D 轨道仿真"
            extra={
              <Space>
                <Button
                  icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? '暂停' : '播放'}
                </Button>
                <Select
                  value={simulationSpeed}
                  onChange={setSimulationSpeed}
                  style={{ width: 100 }}
                >
                  <Option value={0.5}>0.5x</Option>
                  <Option value={1}>1x</Option>
                  <Option value={2}>2x</Option>
                  <Option value={5}>5x</Option>
                </Select>
              </Space>
            }
          >
            {calculating ? (
              <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size="large" />
                <p style={{ marginTop: 16 }}>正在计算轨道...</p>
              </div>
            ) : (
              <OrbitVisualization
                satellitesData={visualizationData}
                isPlaying={isPlaying}
                speed={simulationSpeed}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrbitSimulation;
