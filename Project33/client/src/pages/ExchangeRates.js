import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Card,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Popconfirm,
  Row,
  Col,
  Descriptions
} from 'antd';
import { 
  ReloadOutlined, 
  PlusOutlined, 
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { apiService } from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const ExchangeRates = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const currencies = [
    { code: 'CNY', name: '人民币' },
    { code: 'USD', name: '美元' },
    { code: 'EUR', name: '欧元' },
    { code: 'GBP', name: '英镑' },
    { code: 'JPY', name: '日元' },
    { code: 'HKD', name: '港币' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await apiService.getExchangeRates();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      message.error('加载数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await apiService.createExchangeRate(values);
      message.success('汇率保存成功');
      setModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error('保存失败: ' + error.message);
    }
  };

  const columns = [
    { 
      title: '源货币', 
      dataIndex: 'from_currency', 
      key: 'from_currency',
      render: (code) => {
        const currency = currencies.find(c => c.code === code);
        return <span>{code} {currency ? `(${currency.name})` : ''}</span>;
      }
    },
    { 
      title: '目标货币', 
      dataIndex: 'to_currency', 
      key: 'to_currency',
      render: (code) => {
        const currency = currencies.find(c => c.code === code);
        return <span>{code} {currency ? `(${currency.name})` : ''}</span>;
      }
    },
    { 
      title: '汇率', 
      dataIndex: 'rate', 
      key: 'rate',
      render: (rate) => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{Number(rate).toFixed(4)}</span>
    },
    { 
      title: '更新时间', 
      dataIndex: 'updated_at', 
      key: 'updated_at',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    }
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            新增/更新汇率
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
        </Space>
      </Card>

      <Table 
        columns={columns} 
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title="新增/更新汇率"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="from_currency" label="源货币" rules={[{ required: true, message: '请选择源货币' }]}>
                <Select placeholder="请选择源货币">
                  {currencies.map(currency => (
                    <Option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="to_currency" label="目标货币" rules={[{ required: true, message: '请选择目标货币' }]}>
                <Select placeholder="请选择目标货币">
                  {currencies.map(currency => (
                    <Option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="rate" label="汇率" rules={[{ required: true, message: '请输入汇率' }]}>
            <InputNumber 
              style={{ width: '100%' }} 
              min={0} 
              step={0.0001} 
              precision={4}
              placeholder="请输入汇率" 
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleSave} block>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExchangeRates;
