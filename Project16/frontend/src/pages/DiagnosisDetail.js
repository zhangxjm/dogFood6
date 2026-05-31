import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  message,
  Spin,
  Tag,
  Row,
  Col,
  Progress,
  List,
  Image,
  Typography,
  Space,
  Alert,
} from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { diagnosisAPI } from '../services/api';

const { Title, Paragraph, Text } = Typography;

const DiagnosisDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiagnosis();
  }, [id]);

  const fetchDiagnosis = async () => {
    try {
      const response = await diagnosisAPI.getById(id);
      setDiagnosis(response.data);
    } catch (error) {
      message.error('获取诊断详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    try {
      await diagnosisAPI.review(id);
      message.success('审核完成');
      fetchDiagnosis();
    } catch (error) {
      message.error('审核失败');
    }
  };

  const getSeverityColor = (level) => {
    const colors = {
      '正常': 'green',
      '轻微': 'yellow',
      '中等': 'orange',
      '严重': 'red',
      '紧急': 'red',
    };
    return colors[level] || 'gray';
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>诊断记录不存在</p>
        <Button onClick={() => navigate('/diagnosis')}>返回诊断列表</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/diagnosis')}>
          返回
        </Button>
        <Title level={4} style={{ margin: 0 }}>诊断详情</Title>
      </div>

      <div style={{ padding: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="基本信息">
              <Descriptions column={1}>
                <Descriptions.Item label="宠物">
                  {diagnosis.pet_name}
                </Descriptions.Item>
                <Descriptions.Item label="诊断标题">
                  {diagnosis.record_title}
                </Descriptions.Item>
                <Descriptions.Item label="诊断时间">
                  {new Date(diagnosis.created_at).toLocaleString('zh-CN')}
                </Descriptions.Item>
                <Descriptions.Item label="主要诊断">
                  <Tag color={getSeverityColor(diagnosis.severity_level)}>
                    {diagnosis.top_disease_name}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="置信度">
                  <Progress
                    percent={diagnosis.confidence}
                    status={diagnosis.confidence > 80 ? 'success' : 'active'}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="严重程度">
                  <Tag color={getSeverityColor(diagnosis.severity_level)}>
                    {diagnosis.severity_level}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="审核状态">
                  {diagnosis.doctor_reviewed ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      已审核 - {diagnosis.reviewed_by_name || '医生'}
                    </Tag>
                  ) : (
                    <Tag color="orange">待审核</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {diagnosis.image_url && (
              <Card title="X光影像" style={{ marginTop: 24 }}>
                <Image
                  src={diagnosis.image_url}
                  alt="X光影像"
                  className="image-preview"
                />
              </Card>
            )}
          </Col>

          <Col xs={24} lg={12}>
            <Card title="AI诊断报告">
              <Alert
                message={`${diagnosis.top_disease_name} (${diagnosis.confidence}%)`}
                description={diagnosis.ai_report}
                type={diagnosis.severity_level === '正常' ? 'success' : 'warning'}
                showIcon
                style={{ marginBottom: 16 }}
              />

              <div style={{ marginBottom: 24 }}>
                <Text strong>病症预测详情：</Text>
                <List
                  style={{ marginTop: 8 }}
                  dataSource={diagnosis.predictions}
                  renderItem={(item) => (
                    <List.Item>
                      <Space style={{ width: '100%' }}>
                        <span style={{ width: 120 }}>{item.disease_name}</span>
                        <Progress
                          percent={item.confidence}
                          size="small"
                          style={{ flex: 1 }}
                        />
                      </Space>
                    </List.Item>
                  )}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <Text strong>治疗建议：</Text>
                <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                  {diagnosis.recommendations?.split('\n').map((rec, index) => (
                    <li key={index} style={{ marginBottom: 8 }}>{rec}</li>
                  ))}
                </ul>
              </div>

              {!diagnosis.doctor_reviewed && (
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<CheckCircleOutlined />}
                  onClick={handleReview}
                >
                  医生审核确认
                </Button>
              )}

              {diagnosis.doctor_reviewed && diagnosis.reviewed_at && (
                <div style={{ textAlign: 'center', padding: 16, background: '#f6ffed', borderRadius: 8 }}>
                  <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                  <p style={{ marginTop: 8, marginBottom: 0 }}>
                    已于 {new Date(diagnosis.reviewed_at).toLocaleString('zh-CN')} 审核确认
                  </p>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DiagnosisDetail;
