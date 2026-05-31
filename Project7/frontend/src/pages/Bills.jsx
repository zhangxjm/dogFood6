import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  message,
  Typography,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { billsAPI, shopsAPI } from '../api/index.js';

const { Title } = Typography;
const { Option } = Select;

function Bills() {
  const [bills, setBills] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterShop, setFilterShop] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterMonth, setFilterMonth] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (params = {}) => {
    setLoading(true);
    try {
      const [billsData, shopsData] = await Promise.all([
        billsAPI.getBills(params),
        shopsAPI.getShops(),
      ]);
      setBills(billsData);
      setShops(shopsData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = {};
    if (filterShop) params.shop_id = filterShop;
    if (filterStatus !== null) params.is_paid = filterStatus;
    if (filterMonth) params.bill_month = filterMonth;
    loadData(params);
  };

  const handleReset = () => {
    setFilterShop(null);
    setFilterStatus(null);
    setFilterMonth(null);
    loadData();
  };

  const getShopName = (shopId) => {
    const shop = shops.find((s) => s.id === shopId);
    return shop ? `${shop.shop_number} - ${shop.name}` : shopId;
  };

  const columns = [
    {
      title: '账期',
      dataIndex: 'bill_month',
      key: 'bill_month',
      width: 120,
    },
    {
      title: '商铺',
      dataIndex: 'shop_id',
      key: 'shop_id',
      render: (shopId) => getShopName(shopId),
    },
    {
      title: '用电量(度)',
      dataIndex: 'electric_usage',
      key: 'electric_usage',
      width: 120,
    },
    {
      title: '电费(元)',
      dataIndex: 'electric_amount',
      key: 'electric_amount',
      width: 120,
      render: (val) => `¥${val.toFixed(2)}`,
    },
    {
      title: '用水量(吨)',
      dataIndex: 'water_usage',
      key: 'water_usage',
      width: 120,
    },
    {
      title: '水费(元)',
      dataIndex: 'water_amount',
      key: 'water_amount',
      width: 120,
      render: (val) => `¥${val.toFixed(2)}`,
    },
    {
      title: '总费用(元)',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 130,
      render: (val) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          ¥{val.toFixed(2)}
        </span>
      ),
    },
    {
      title: '缴费截止日期',
      dataIndex: 'payment_deadline',
      key: 'payment_deadline',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'is_paid',
      key: 'is_paid',
      width: 100,
      render: (paid) =>
        paid ? (
          <Tag color="green">已缴费</Tag>
        ) : (
          <Tag color="red">未缴费</Tag>
        ),
    },
  ];

  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>费用核算</Title>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Select
          placeholder="选择商铺"
          style={{ width: 200 }}
          allowClear
          value={filterShop}
          onChange={setFilterShop}
        >
          {shops.map((shop) => (
            <Option key={shop.id} value={shop.id}>
              {shop.shop_number} - {shop.name}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="缴费状态"
          style={{ width: 150 }}
          allowClear
          value={filterStatus}
          onChange={setFilterStatus}
        >
          <Option value={false}>未缴费</Option>
          <Option value={true}>已缴费</Option>
        </Select>
        <Select
          placeholder="选择月份"
          style={{ width: 150 }}
          allowClear
          value={filterMonth}
          onChange={setFilterMonth}
        >
          {months.map((m) => (
            <Option key={m} value={m}>
              {m}
            </Option>
          ))}
        </Select>
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          搜索
        </Button>
        <Button onClick={handleReset}>重置</Button>
      </div>

      <Table
        columns={columns}
        dataSource={bills}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
      />
    </div>
  );
}

export default Bills;
