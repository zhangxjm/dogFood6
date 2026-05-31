import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Card,
  Tag,
  message,
  Select,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  ReloadOutlined, 
  CheckCircleOutlined,
  UndoOutlined,
  LoadingOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { apiService } from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

const SeataMonitor = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const result = await apiService.getSeataTransactions(params);
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      message.error('加载数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async (xid) => {
    try {
      await apiService.commitSeataTransaction(xid);
      message.success('事务提交成功');
      loadData();
    } catch (error) {
      message.error('提交失败: ' + error.message);
    }
  };

  const handleRollback = async (xid) => {
    try {
      await apiService.rollbackSeataTransaction(xid);
      message.success('事务回滚成功');
      loadData();
    } catch (error) {
      message.error('回滚失败: ' + error.message);
    }
  };

  const columns = [
    { 
      title: 'XID', 
      dataIndex: 'xid', 
      key: 'xid', 
      width: 200,
      ellipsis: true 
    },
    { title: '交易ID', dataIndex: 'transaction_id', key: 'transaction_id', width: 150, ellipsis: true },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        const statusMap = {
          begin: { color: 'blue', text: '开始', icon: <LoadingOutlined /> },
          committed: { color: 'green', text: '已提交', icon: <CheckCircleOutlined /> },
          rollback: { color: 'red', text: '已回滚', icon: <UndoOutlined /> }
        };
        const s = statusMap[status] || { color: 'default', text: status };
        return <Tag icon={s.icon} color={s.color}>{s.text}</Tag>;
      }
    },
    { 
      title: '创建时间', 
      dataIndex: 'created_at', 
      key: 'created_at',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
    { 
      title: '更新时间', 
      dataIndex: 'updated_at', 
      key: 'updated_at',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          {record.status === 'begin' && (
            <>
              <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleCommit(record.xid)}>
                提交
              </Button>
              <Button type="link" size="small" danger icon={<UndoOutlined />} onClick={() => handleRollback(record.xid)}>
                回滚
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  const statusCounts = {
    total: data.length,
    begin: data.filter(d => d.status === 'begin').length,
    committed: data.filter(d => d.status === 'committed').length,
    rollback: data.filter(d => d.status === 'rollback').length
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="事务总数" 
              value={statusCounts.total} 
              prefix={<DatabaseOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="进行中" 
              value={statusCounts.begin} 
              valueStyle={{ color: '#1890ff' }}
              prefix={<LoadingOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="已提交" 
              value={statusCounts.committed} 
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="已回滚" 
              value={statusCounts.rollback} 
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<UndoOutlined />} 
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Select
            placeholder="筛选状态"
            style={{ width: 150 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="begin">进行中</Option>
            <Option value="committed">已提交</Option>
            <Option value="rollback">已回滚</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
        </Space>
      </Card>

      <Table 
        columns={columns} 
        dataSource={data}
        rowKey="xid"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条记录` }}
      />
    </div>
  );
};

export default SeataMonitor;
