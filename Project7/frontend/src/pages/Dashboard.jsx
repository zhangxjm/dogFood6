import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import {
  ShopOutlined,
  FileTextOutlined,
  MoneyCollectOutlined,
  WarningOutlined,
  RiseOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { dashboardAPI, billsAPI, shopsAPI } from '../api/index.js';

const { Title } = Typography;

function Dashboard() {
  const [stats, setStats] = useState({
    total_shops: 0,
    total_unpaid_bills: 0,
    total_unpaid_amount: 0,
    total_monthly_revenue: 0,
    overdue_count: 0,
    overdue_amount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '费用统计',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: stats.total_monthly_revenue, name: '本月收入', itemStyle: { color: '#52c41a' } },
          { value: stats.total_unpaid_amount, name: '未收费用', itemStyle: { color: '#faad14' } },
          { value: stats.overdue_amount, name: '逾期欠费', itemStyle: { color: '#ff4d4f' } },
        ],
      },
    ],
  };

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>数据概览</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card loading={loading}>
            <Statistic
              title="商铺总数"
              value={stats.total_shops}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card loading={loading}>
            <Statistic
              title="未缴账单数"
              value={stats.total_unpaid_bills}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card loading={loading}>
            <Statistic
              title="未缴总金额"
              value={stats.total_unpaid_amount}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card loading={loading}>
            <Statistic
              title="本月收入"
              value={stats.total_monthly_revenue}
              prefix={<RiseOutlined />}
              suffix="元"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card loading={loading}>
            <Statistic
              title="逾期账单数"
              value={stats.overdue_count}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card loading={loading}>
            <Statistic
              title="逾期总金额"
              value={stats.overdue_amount}
              prefix={<WarningOutlined />}
              suffix="元"
              precision={2}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="费用构成分析" loading={loading}>
            <ReactECharts option={chartOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="系统说明" loading={loading}>
            <div style={{ lineHeight: 2 }}>
              <p><strong>商铺管理：</strong>管理所有入驻商铺的基本信息，包括商铺编号、名称、业主、联系方式等。</p>
              <p><strong>水电读数：</strong>每月录入各商铺的水电表读数，系统自动计算用量。</p>
              <p><strong>费用核算：</strong>根据水电读数和单价自动生成账单，支持手动调整。</p>
              <p><strong>缴费记录：</strong>记录商铺的缴费信息，支持多种缴费方式。</p>
              <p><strong>欠费提醒：</strong>查看所有逾期未缴的账单，便于催缴工作。</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
