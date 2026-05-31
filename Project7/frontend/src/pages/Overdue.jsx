import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Statistic,
  Row,
  Col,
  Button,
  Tag,
  message,
  Typography,
  Modal,
  Form,
  Input,
} from 'antd';
import { WarningOutlined, PhoneOutlined, SendOutlined } from '@ant-design/icons';
import { billsAPI, shopsAPI } from '../api/index.js';

const { Title } = Typography;

function Overdue() {
  const [overdueBills, setOverdueBills] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifyModalVisible, setNotifyModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [billsData, shopsData] = await Promise.all([
        billsAPI.getOverdueBills(),
        shopsAPI.getShops(),
      ]);
      setOverdueBills(billsData);
      setShops(shopsData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getShopInfo = (shopId) => {
    return shops.find((s) => s.id === shopId);
  };

  const handleNotify = (bill) => {
    const shop = getShopInfo(bill.shop_id);
    setSelectedBill({ ...bill, shop });
    form.resetFields();
    setNotifyModalVisible(true);
  };

  const handleSendNotify = (values) => {
    message.success('催缴通知已发送');
    setNotifyModalVisible(false);
  };

  const totalOverdueAmount = overdueBills.reduce((sum, bill) => sum + bill.total_amount, 0);

  const columns = [
    {
      title: '账期',
      dataIndex: 'bill_month',
      key: 'bill_month',
      width: 100,
    },
    {
      title: '商铺编号',
      key: 'shop_number',
      render: (_, record) => {
        const shop = getShopInfo(record.shop_id);
        return shop ? shop.shop_number : '-';
      },
    },
    {
      title: '商铺名称',
      key: 'shop_name',
      render: (_, record) => {
        const shop = getShopInfo(record.shop_id);
        return shop ? shop.name : '-';
      },
    },
    {
      title: '业主姓名',
      key: 'owner_name',
      render: (_, record) => {
        const shop = getShopInfo(record.shop_id);
        return shop ? shop.owner_name : '-';
      },
    },
    {
      title: '联系电话',
      key: 'phone',
      render: (_, record) => {
        const shop = getShopInfo(record.shop_id);
        return shop ? shop.phone : '-';
      },
    },
    {
      title: '欠费金额(元)',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (val) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: 16 }}>
          ¥{val.toFixed(2)}
        </span>
      ),
    },
    {
      title: '缴费截止日期',
      dataIndex: 'payment_deadline',
      key: 'payment_deadline',
    },
    {
      title: '状态',
      key: 'status',
      render: () => <Tag color="red">已逾期</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          danger
          icon={<SendOutlined />}
          size="small"
          onClick={() => handleNotify(record)}
        >
          发送催缴
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        <WarningOutlined style={{ color: '#ff4d4f' }} /> 欠费提醒
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="逾期账单数"
              value={overdueBills.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="逾期总金额"
              value={totalOverdueAmount}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="涉及商铺数"
              value={new Set(overdueBills.map((b) => b.shop_id)).size}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {overdueBills.length > 0 ? (
        <div style={{ background: '#fff2f0', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <p style={{ margin: 0, color: '#ff4d4f' }}>
            <WarningOutlined /> 共有 <strong>{overdueBills.length}</strong> 笔账单已逾期，
            涉及 <strong>{new Set(overdueBills.map((b) => b.shop_id)).size}</strong> 家商铺，
            逾期总金额 <strong>¥{totalOverdueAmount.toFixed(2)}</strong>，请及时催缴。
          </p>
        </div>
      ) : (
        <div style={{ background: '#f6ffed', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <p style={{ margin: 0, color: '#52c41a' }}>
            暂无逾期账单，所有商铺均已按时缴费！
          </p>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={overdueBills}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="发送催缴通知"
        open={notifyModalVisible}
        onCancel={() => setNotifyModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedBill && (
          <div>
            <Card size="small" style={{ marginBottom: 16, background: '#fff2f0' }}>
              <p><strong>商铺：</strong>{selectedBill.shop?.shop_number} - {selectedBill.shop?.name}</p>
              <p><strong>业主：</strong>{selectedBill.shop?.owner_name}</p>
              <p><strong>电话：</strong>{selectedBill.shop?.phone}</p>
              <p><strong>账期：</strong>{selectedBill.bill_month}</p>
              <p><strong>欠费金额：</strong><span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{selectedBill.total_amount.toFixed(2)}</span></p>
              <p><strong>截止日期：</strong>{selectedBill.payment_deadline}</p>
            </Card>
            <Form form={form} layout="vertical" onFinish={handleSendNotify}>
              <Form.Item
                name="notify_type"
                label="通知方式"
                initialValue="短信"
              >
                <Input.Group compact>
                  <Button icon={<PhoneOutlined />}>短信通知</Button>
                  <Button>电话通知</Button>
                  <Button>上门通知</Button>
                </Input.Group>
              </Form.Item>
              <Form.Item name="remark" label="备注">
                <Input.TextArea rows={3} placeholder="请输入备注信息" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" danger htmlType="submit" icon={<SendOutlined />}>
                  确认发送
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Overdue;
