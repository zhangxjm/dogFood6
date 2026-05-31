import React, { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Modal, Form, Select, Progress, message, Statistic, Row, Col, Card, Progress as AntProgress } from 'antd'
import {
  CloudServerOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { pointcloudApi, heritageApi } from '../services/api.js'

const { Option } = Select

export default function PointCloud() {
  const [tasks, setTasks] = useState([])
  const [heritageList, setHeritageList] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [tasksRes, heritageRes] = await Promise.all([
        pointcloudApi.list(),
        heritageApi.list()
      ])
      setTasks(tasksRes.data)
      setHeritageList(heritageRes.data)
    } catch (error) {
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await pointcloudApi.create(values)
      message.success('任务创建成功')
      setIsModalOpen(false)
      form.resetFields()
      loadData()
    } catch (error) {
      if (error.errorFields) return
      message.error('创建任务失败')
    }
  }

  const handleStart = async (id) => {
    try {
      await pointcloudApi.start(id)
      message.success('任务已启动')
      loadData()
    } catch (error) {
      message.error('启动任务失败')
    }
  }

  const handleComplete = async (id) => {
    try {
      await pointcloudApi.complete(id)
      message.success('任务已完成')
      loadData()
    } catch (error) {
      message.error('完成任务失败')
    }
  }

  const handleProcessSample = async () => {
    try {
      await pointcloudApi.processSample()
      message.success('批量处理完成')
      loadData()
    } catch (error) {
      message.error('批量处理失败')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green'
      case 'processing': return 'blue'
      case 'failed': return 'red'
      default: return 'orange'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return '已完成'
      case 'processing': return '处理中'
      case 'failed': return '失败'
      default: return '等待中'
    }
  }

  const getHeritageName = (heritageId) => {
    const heritage = heritageList.find(h => h.id === heritageId)
    return heritage ? heritage.name : '-'
  }

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'task_name',
      key: 'task_name',
      ellipsis: true
    },
    {
      title: '关联文物',
      dataIndex: 'heritage_id',
      key: 'heritage_id',
      render: (heritageId) => getHeritageName(heritageId)
    },
    {
      title: '算法',
      dataIndex: 'algorithm',
      key: 'algorithm'
    },
    {
      title: '点云数量',
      dataIndex: 'point_count',
      key: 'point_count',
      render: (count) => count ? count.toLocaleString() : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={
          status === 'completed' ? <CheckCircleOutlined /> : 
          status === 'processing' ? <ClockCircleOutlined /> : 
          <ClockCircleOutlined />
        }>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress 
          percent={Math.round(progress)} 
          size="small"
          status={status === 'completed' ? 'success' : status === 'processing' ? 'active' : 'normal'}
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleDateString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Button 
              type="primary" 
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStart(record.id)}
            >
              启动
            </Button>
          )}
          {record.status === 'processing' && (
            <Button 
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record.id)}
            >
              完成
            </Button>
          )}
        </Space>
      )
    }
  ]

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    processing: tasks.filter(t => t.status === 'processing').length,
    pending: tasks.filter(t => t.status === 'pending').length
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">点云处理</h1>
        <p className="page-description">
          管理文物点云数据处理任务，支持点云去噪、配准、表面重建等功能
        </p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="总任务数" 
              value={stats.total}
              prefix={<CloudServerOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="已完成" 
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="处理中" 
              value={stats.processing}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="等待中" 
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="任务列表"
        extra={
          <Space>
            <Button 
              icon={<ThunderboltOutlined />}
              onClick={handleProcessSample}
            >
              批量处理
            </Button>
            <Button 
              type="primary"
              icon={<CloudServerOutlined />}
              onClick={() => setIsModalOpen(true)}
            >
              创建任务
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      <Modal
        title="创建点云处理任务"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item 
            name="heritage_id" 
            label="选择文物" 
            rules={[{ required: true, message: '请选择文物' }]}
          >
            <Select placeholder="请选择要处理的文物">
              {heritageList.map(h => (
                <Option key={h.id} value={h.id}>{h.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            name="task_name" 
            label="任务名称" 
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <input className="ant-input" placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item name="algorithm" label="处理算法">
            <Select placeholder="请选择处理算法">
              <Option value="泊松表面重建">泊松表面重建</Option>
              <Option value="统计滤波">统计滤波</Option>
              <Option value="ICP精配准">ICP精配准</Option>
              <Option value="半径滤波">半径滤波</Option>
              <Option value="体素下采样">体素下采样</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              创建任务
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
