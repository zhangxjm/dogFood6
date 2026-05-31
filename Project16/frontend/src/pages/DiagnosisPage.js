import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Select,
  message,
  Spin,
  Row,
  Col,
  Progress,
  Tag,
  List,
  Space,
  Typography,
  Image,
  Alert,
  Descriptions,
} from 'antd';
import { ScanOutlined, UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { recordsAPI, petsAPI, diagnosisAPI } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const DiagnosisPage = () => {
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get('recordId');
  const navigate = useNavigate();

  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    if (recordId) {
      fetchRecordDetails(recordId);
    }
  }, [recordId]);

  const fetchPets = async () => {
    try {
      const response = await petsAPI.getAll();
      setPets(response.data);
    } catch (error) {
      message.error('获取宠物列表失败');
    }
  };

  const fetchRecords = async (petId) => {
    try {
      const response = await recordsAPI.getAll();
      const petRecords = response.data.filter((r) => r.pet === petId);
      setRecords(petRecords);
    } catch (error) {
      message.error('获取记录失败');
    }
  };

  const fetchRecordDetails = async (id) => {
    try {
      const response = await recordsAPI.getById(id);
      setSelectedRecord(response.data);
      if (response.data.images && response.data.images.length > 0) {
        setImagePreview(response.data.images[0].file_url);
      }
    } catch (error) {
      message.error('获取记录详情失败');
    }
  };

  const handlePetChange = async (petId) => {
    const pet = pets.find((p) => p.id === petId);
    setSelectedPet(pet);
    setSelectedRecord(null);
    setDiagnosisResult(null);
    setImagePreview(null);
    await fetchRecords(petId);
  };

  const handleRecordChange = (recordId) => {
    const record = records.find((r) => r.id === recordId);
    setSelectedRecord(record);
    setDiagnosisResult(null);
    if (record?.images?.length > 0) {
      setImagePreview(record.images[0].file_url);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnose = async () => {
    if (!selectedRecord) {
      message.error('请先选择医疗记录');
      return;
    }

    setLoading(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('image_type', 'xray');
        await recordsAPI.uploadImage(selectedRecord.id, formData);
      }

      const response = await diagnosisAPI.diagnose(selectedRecord.id);
      setDiagnosisResult(response.data);
      message.success('诊断完成');
    } catch (error) {
      message.error('诊断失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!diagnosisResult) return;
    try {
      await diagnosisAPI.review(diagnosisResult.id);
      message.success('审核完成');
      setDiagnosisResult({ ...diagnosisResult, doctor_reviewed: true });
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

  return (
    <div>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>AI影像诊断</Title>
      </div>

      <div style={{ padding: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="选择病例" loading={loading}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="选择宠物"
                  value={selectedPet?.id}
                  onChange={handlePetChange}
                >
                  {pets.map((pet) => (
                    <Option key={pet.id} value={pet.id}>
                      {pet.name} - {pet.species_display}
                    </Option>
                  ))}
                </Select>

                {records.length > 0 && (
                  <Select
                    style={{ width: '100%' }}
                    placeholder="选择医疗记录"
                    value={selectedRecord?.id}
                    onChange={handleRecordChange}
                  >
                    {records.map((record) => (
                      <Option key={record.id} value={record.id}>
                        {record.title} - {new Date(record.created_at).toLocaleDateString()}
                      </Option>
                    ))}
                  </Select>
                )}

                {!imagePreview && (
                  <div
                    className="image-upload-area"
                    onClick={() => document.getElementById('imageInput')?.click()}
                  >
                    <UploadOutlined style={{ fontSize: 48, color: '#999' }} />
                    <p style={{ marginTop: 16, color: '#666' }}>
                      点击或拖拽上传X光片
                    </p>
                    <p style={{ color: '#999', fontSize: 12 }}>支持 JPG、PNG 格式</p>
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                  </div>
                )}

                {imagePreview && (
                  <div style={{ textAlign: 'center' }}>
                    <Image
                      src={imagePreview}
                      alt="X光片预览"
                      className="image-preview"
                    />
                    <Button
                      style={{ marginTop: 16 }}
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                    >
                      重新上传
                    </Button>
                  </div>
                )}

                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<ScanOutlined />}
                  onClick={handleDiagnose}
                  loading={loading}
                  disabled={!selectedRecord || (!imagePreview && !selectedRecord?.images?.length)}
                >
                  开始AI诊断
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="诊断结果" loading={loading}>
              {!diagnosisResult ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  <ScanOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                  <p style={{ marginTop: 16 }}>选择病例并上传影像后开始诊断</p>
                </div>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Alert
                    message={`主要诊断：${diagnosisResult.top_disease_name}`}
                    description={`置信度：${diagnosisResult.confidence}%`}
                    type={diagnosisResult.severity_level === '正常' ? 'success' : 'warning'}
                    showIcon
                    icon={<Tag color={getSeverityColor(diagnosisResult.severity_level)} style={{ fontSize: 14 }}>
                      {diagnosisResult.severity_level}
                    </Tag>}
                  />

                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="宠物">
                      {diagnosisResult.pet_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="诊断标题">
                      {diagnosisResult.record_title}
                    </Descriptions.Item>
                    <Descriptions.Item label="诊断时间">
                      {new Date(diagnosisResult.created_at).toLocaleString('zh-CN')}
                    </Descriptions.Item>
                  </Descriptions>

                  <div>
                    <Text strong>AI诊断报告：</Text>
                    <Paragraph style={{ marginTop: 8 }}>
                      {diagnosisResult.ai_report}
                    </Paragraph>
                  </div>

                  <div>
                    <Text strong>所有预测结果：</Text>
                    <List
                      size="small"
                      dataSource={diagnosisResult.predictions?.slice(0, 5)}
                      renderItem={(item) => (
                        <List.Item>
                          <Space style={{ width: '100%' }}>
                            <span style={{ width: 100 }}>{item.disease_name}</span>
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

                  <div>
                    <Text strong>治疗建议：</Text>
                    <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                      {diagnosisResult.recommendations?.split('\n').map((rec, index) => (
                        <li key={index} style={{ marginBottom: 4 }}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  {!diagnosisResult.doctor_reviewed ? (
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={handleReview}
                    >
                      医生审核确认
                    </Button>
                  ) : (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      已由 {diagnosisResult.reviewed_by_name || '医生'} 审核确认
                    </Tag>
                  )}
                </Space>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DiagnosisPage;
