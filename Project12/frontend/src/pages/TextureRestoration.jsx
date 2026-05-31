import React, { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Modal, Form, Select, message, Statistic, Row, Col, Card, Progress } from 'antd'
import {
  FileTextOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { textureApi, heritageApi } from '../services/api.js'

const { Option } = Select

export default function TextureRestoration() {
  const [restorations, setRestorations] = useState([])
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
      const [restorationsRes, heritageRes] = await Promise.all([
        textureApi.list(),
        heritageApi.list()
      ])
      setRestorations(restorationsRes.data)
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
      await textureApi.create(values)
      message.success('修复任务创建成功')
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
      await textureApi.start(id)
      message.success('修复任务已启动')
      loadData()
    } catch (error) {
      message.error('启动任务失败')
    }
  }

  const handleSimulate = async (id) => {
    try {
      await textureApi.simulate(id)
      message.success('模拟修复完成')
      loadData()
    } catch (error) {
      message.error('模拟修复失败')
    }
  }

  const handleComplete = async (id) => {
    try {
      await textureApi.complete(id)
      message.success('修复任务已完成')
      loadData()
    } catch (error) {
      message.error('完成任务失败')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green'
      case 'in_progress': return 'blue'
      case 'failed': return 'red'
      default: return 'orange'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return '已完成'
      case 'in_progress': return '进行中'
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
      title: '修复类型',
      dataIndex: 'restoration_type',
      key: 'restoration_type'
    },
    {
      title: '关联文物',
      dataIndex: 'heritage_id',
      key: 'heritage_id',
      render: (heritageId) => getHeritageName(heritageId)
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence) => confidence 
        ? `${(confidence * 100).toFixed(1)}%` 
        : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={
          status === 'completed' ? <CheckCircleOutlined /> : 
          status === 'in_progress' ? <ClockCircleOutlined /> : 
          <ClockCircleOutlined />
        }>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleDateString('zh-CN')
    },
    {
      title: '完成时间',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (time) => time ? new Date(time).toLocaleDateString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button 
                type="primary" 
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStart(record.id)}
              >
                启动
              </Button>
              <Button 
                size="small"
                icon={<ThunderboltOutlined />}
                onClick={() => handleSimulate(record.id)}
              >
                模拟
              </Button>
            </>
          )}
          {record.status === 'in_progress' && (
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
    total: restorations.length,
    completed: restorations.filter(r => r.status === 'completed').length,
    inProgress: restorations.filter(r => r.status === 'in_progress').length,
    pending: restorations.filter(r => r.status === 'pending').length
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">纹理修复</h1>
        <p className="page-description">
          管理文物纹理修复任务，支持AI智能修复、裂纹修复、色彩还原等功能
        </p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="总任务数" 
              value={stats.total}
              prefix={<FileTextOutlined />}
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
              title="进行中" 
              value={stats.inProgress}
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
        title="修复任务列表"
        extra={
          <Button 
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            创建任务
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={restorations}
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
        title="创建纹理修复任务"
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
            <Select placeholder="请选择要修复的文物">
              {heritageList.map(h => (
                <Option key={h.id} value={h.id}>{h.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            name="restoration_type" 
            label="修复类型" 
            rules={[{ required: true, message: '请选择修复类型' }]}
          >
            <Select placeholder="请选择修复类型">
              <Option value="AI纹理修复">AI纹理修复</Option>
              <Option value="壁画裂纹修复">壁画裂纹修复</Option>
              <Option value="锈蚀纹理还原">锈蚀纹理还原</Option>
              <Option value="色彩增强">色彩增强</Option>
              <Option value="细节恢复">细节恢复</Option>
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
