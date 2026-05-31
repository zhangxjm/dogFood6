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
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { paymentsAPI, shopsAPI, billsAPI } from '../api/index.js';

const { Title } = Typography;
const { Option } = Select;

function Payments() {
  const [payments, setPayments] = useState([]);
  const [shops, setShops] = useState([]);
  const [unpaidBills, setUnpaidBills] = useState([]);
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
      const [paymentsData, shopsData] = await Promise.all([
        paymentsAPI.getPayments(),
        shopsAPI.getShops(),
      ]);
      setPayments(paymentsData);
      setShops(shopsData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadUnpaidBills = async (shopId) => {
    try {
      const bills = await billsAPI.getBills({ shop_id: shopId, is_paid: false });
      setUnpaidBills(bills);
    } catch (error) {
      setUnpaidBills([]);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setSelectedShop(null);
    setUnpaidBills([]);
    setModalVisible(true);
  };

  const handleShopChange = (shopId) => {
    setSelectedShop(shopId);
    loadUnpaidBills(shopId);
    form.setFieldsValue({ bill_id: null, amount: null });
  };

  const handleBillChange = (billId) => {
    const bill = unpaidBills.find((b) => b.id === billId);
    if (bill) {
      form.setFieldsValue({ amount: bill.total_amount });
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        payment_date: values.payment_date.format('YYYY-MM-DD'),
      };
      await paymentsAPI.createPayment(data);
      message.success('缴费记录添加成功');
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error('添加失败');
    }
  };

  const getShopName = (shopId) => {
    const shop = shops.find((s) => s.id === shopId);
    return shop ? `${shop.shop_number} - ${shop.name}` : shopId;
  };

  const paymentMethods = ['现金', '银行转账', '微信支付', '支付宝', 'POS机'];

  const columns = [
    {
      title: '商铺',
      dataIndex: 'shop_id',
      key: 'shop_id',
      render: (shopId) => getShopName(shopId),
    },
    {
      title: '账单ID',
      dataIndex: 'bill_id',
      key: 'bill_id',
    },
    {
      title: '缴费日期',
      dataIndex: 'payment_date',
      key: 'payment_date',
    },
    {
      title: '缴费金额(元)',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          ¥{val.toFixed(2)}
        </span>
      ),
    },
    {
      title: '缴费方式',
      dataIndex: 'payment_method',
      key: 'payment_method',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>缴费记录</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          登记缴费
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={payments}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="登记缴费"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
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
            name="bill_id"
            label="选择账单"
            rules={[{ required: true, message: '请选择账单' }]}
          >
            <Select
              placeholder="请选择待缴费账单"
              disabled={!selectedShop}
              onChange={handleBillChange}
            >
              {unpaidBills.map((bill) => (
                <Option key={bill.id} value={bill.id}>
                  {bill.bill_month} - ¥{bill.total_amount.toFixed(2)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="payment_date"
            label="缴费日期"
            rules={[{ required: true, message: '请选择缴费日期' }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="amount"
            label="缴费金额(元)"
            rules={[{ required: true, message: '请输入缴费金额' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="payment_method" label="缴费方式">
            <Select placeholder="请选择缴费方式">
              {paymentMethods.map((method) => (
                <Option key={method} value={method}>
                  {method}
                </Option>
              ))}
            </Select>
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

export default Payments;
