import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Typography,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { meterReadingsAPI, shopsAPI, billsAPI } from '../api/index.js';

const { Title } = Typography;
const { Option } = Select;

function MeterReadings() {
  const [readings, setReadings] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedShop, setSelectedShop] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [readingsData, shopsData] = await Promise.all([
        meterReadingsAPI.getReadings(),
        shopsAPI.getShops({ is_active: true }),
      ]);
      setReadings(readingsData);
      setShops(shopsData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setSelectedShop(null);
    setModalVisible(true);
  };

  const handleShopChange = async (shopId) => {
    setSelectedShop(shopId);
    try {
      const lastReading = await meterReadingsAPI.getLastReading(shopId);
      if (lastReading) {
        form.setFieldsValue({
          electric_previous: lastReading.electric_current,
          water_previous: lastReading.water_current,
        });
      } else {
        form.setFieldsValue({
          electric_previous: 0,
          water_previous: 0,
        });
      }
    } catch (error) {
      form.setFieldsValue({
        electric_previous: 0,
        water_previous: 0,
      });
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        reading_date: values.reading_date.format('YYYY-MM-DD'),
      };
      await meterReadingsAPI.createReading(data);
      message.success('录入成功');
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error('录入失败');
    }
  };

  const handleGenerateBill = async (readingId) => {
    try {
      await billsAPI.generateBill(readingId);
      message.success('账单生成成功');
    } catch (error) {
      message.error('账单生成失败');
    }
  };

  const getShopName = (shopId) => {
    const shop = shops.find((s) => s.id === shopId);
    return shop ? `${shop.shop_number} - ${shop.name}` : shopId;
  };

  const columns = [
    {
      title: '商铺',
      dataIndex: 'shop_id',
      key: 'shop_id',
      render: (shopId) => getShopName(shopId),
    },
    {
      title: '抄表日期',
      dataIndex: 'reading_date',
      key: 'reading_date',
    },
    {
      title: '上期电表',
      dataIndex: 'electric_previous',
      key: 'electric_previous',
    },
    {
      title: '本期电表',
      dataIndex: 'electric_current',
      key: 'electric_current',
    },
    {
      title: '用电量(度)',
      dataIndex: 'electric_usage',
      key: 'electric_usage',
      render: (val) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{val}</span>,
    },
    {
      title: '上期水表',
      dataIndex: 'water_previous',
      key: 'water_previous',
    },
    {
      title: '本期水表',
      dataIndex: 'water_current',
      key: 'water_current',
    },
    {
      title: '用水量(吨)',
      dataIndex: 'water_usage',
      key: 'water_usage',
      render: (val) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{val}</span>,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<FileTextOutlined />}
          onClick={() => handleGenerateBill(record.id)}
        >
          生成账单
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>水电读数</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          录入读数
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={readings}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="录入水电读数"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="shop_id"
            label="选择商铺"
            rules={[{ required: true, message: '请选择商铺' }]}
          >
            <Select placeholder="请选择商铺" onChange={handleShopChange}>
              {shops.map((shop) => (
                <Option key={shop.id} value={shop.id}>
                  {shop.shop_number} - {shop.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="reading_date"
            label="抄表日期"
            rules={[{ required: true, message: '请选择抄表日期' }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="electric_previous"
                label="上期电表读数(度)"
                initialValue={0}
              >
                <InputNumber style={{ width: '100%' }} readOnly />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="electric_current"
                label="本期电表读数(度)"
                rules={[{ required: true, message: '请输入本期电表读数' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="water_previous"
                label="上期水表读数(吨)"
                initialValue={0}
              >
                <InputNumber style={{ width: '100%' }} readOnly />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="water_current"
                label="本期水表读数(吨)"
                rules={[{ required: true, message: '请输入本期水表读数' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="electric_usage"
            label="预计用电量(度)"
            initialValue={0}
          >
            <InputNumber style={{ width: '100%' }} readOnly />
          </Form.Item>
          <Form.Item
            name="water_usage"
            label="预计用水量(吨)"
            initialValue={0}
          >
            <InputNumber style={{ width: '100%' }} readOnly />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MeterReadings;
