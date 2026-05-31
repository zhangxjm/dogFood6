import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Space,
  Tag,
  Typography,
  Image,
} from 'antd';
import { PlusOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import { recordsAPI, petsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const RecordList = () => {
  const [records, setRecords] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recordsRes, petsRes] = await Promise.all([
        recordsAPI.getAll(),
        petsAPI.getAll(),
      ]);
      setRecords(recordsRes.data);
      setPets(petsRes.data);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const recordRes = await recordsAPI.create(values);
      if (values.images && values.images.length > 0) {
        for (const file of values.images) {
          if (file.originFileObj) {
            const formData = new FormData();
            formData.append('image', file.originFileObj);
            formData.append('image_type', 'xray');
            await recordsAPI.uploadImage(recordRes.data.id, formData);
          }
        }
      }
      message.success('创建成功');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('创建失败');
    }
  };

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

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const columns = [
    {
      title: '宠物',
      dataIndex: 'pet_name',
      key: 'pet_name',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '症状',
      dataIndex: 'symptoms',
      key: 'symptoms',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: '影像数量',
      key: 'images',
      render: (_, record) => record.images?.length || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/diagnosis?recordId=${record.id}`)}
          >
            查看/诊断
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>医疗记录</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          创建记录
        </Button>
      </div>

      <div style={{ padding: 24 }}>
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          expandedRowRender={(record) => (
            <div style={{ padding: 16 }}>
              <p><strong>症状描述：</strong>{record.symptoms}</p>
              {record.diagnosis && (
                <p><strong>医生诊断：</strong>{record.diagnosis}</p>
              )}
              {record.treatment && (
                <p><strong>治疗方案：</strong>{record.treatment}</p>
              )}
              {record.images?.length > 0 && (
                <div>
                  <strong>相关影像：</strong>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {record.images.map((img) => (
                      <Image
                        key={img.id}
                        width={100}
                        height={100}
                        src={img.file_url}
                        style={{ objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        />
      </div>

      <Modal
        title="创建医疗记录"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="pet"
            label="选择宠物"
            rules={[{ required: true, message: '请选择宠物' }]}
          >
            <Select placeholder="请选择宠物">
              {pets.map((pet) => (
                <Option key={pet.id} value={pet.id}>
                  {pet.name} - {pet.species_display}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="诊断标题"
            rules={[{ required: true, message: '请输入诊断标题' }]}
          >
            <Input placeholder="请输入诊断标题" />
          </Form.Item>

          <Form.Item
            name="symptoms"
            label="症状描述"
            rules={[{ required: true, message: '请输入症状描述' }]}
          >
            <TextArea rows={4} placeholder="请详细描述宠物的症状" />
          </Form.Item>

          <Form.Item
            name="images"
            label="上传X光片/影像"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              listType="picture"
              beforeUpload={() => false}
              multiple
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>选择图片</Button>
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">创建</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RecordList;
