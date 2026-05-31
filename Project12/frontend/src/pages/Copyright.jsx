import React, { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Modal, Form, Input, Select, message, Statistic, Row, Col, Card, Descriptions, Timeline } from 'antd'
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  EyeOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { copyrightApi, heritageApi } from '../services/api.js'

const { Option } = Select
const { TextArea } = Input

export default function Copyright() {
  const [records, setRecords] = useState([])
  const [heritageList, setHeritageList] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [recordsRes, heritageRes] = await Promise.all([
        copyrightApi.list(),
        heritageApi.list()
      ])
      setRecords(recordsRes.data)
      setHeritageList(heritageRes.data)
    } catch (error) {
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    try {
      const values = await form.validateFields()
      await copyrightApi.register(values)
      message.success('版权存证成功')
      setIsModalOpen(false)
      form.resetFields()
      loadData()
    } catch (error) {
      if (error.errorFields) return
      message.error('版权存证失败')
    }
  }

  const handleSimulateRegister = async () => {
    try {
      await copyrightApi.simulateRegister()
      message.success('批量版权存证完成')
      loadData()
    } catch (error) {
      message.error('批量存证失败')
    }
  }

  const handleVerify = async (id) => {
    try {
      const res = await copyrightApi.verify(id)
      if (res.data.valid) {
        message.success('版权验证通过')
      } else {
        message.warning('版权验证失败')
      }
    } catch (error) {
      message.error('验证失败')
    }
  }

  const handleViewDetail = (record) => {
    setSelectedRecord(record)
    setDetailModalOpen(true)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    message.success('已复制到剪贴板')
  }

  const getHeritageName = (heritageId) => {
    const heritage = heritageList.find(h => h.id === heritageId)
    return heritage ? heritage.name : '-'
  }

  const columns = [
    {
      title: '作品名称',
      dataIndex: 'work_name',
      key: 'work_name',
      ellipsis: true
    },
    {
      title: '关联文物',
      dataIndex: 'heritage_id',
      key: 'heritage_id',
      render: (heritageId) => getHeritageName(heritageId)
    },
    {
      title: '权利人',
      dataIndex: 'author',
      key: 'author'
    },
    {
      title: '存证状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color="purple" icon={<SafetyCertificateOutlined />}>
          {status === 'registered' ? '已存证' : status}
        </Tag>
      )
    },
    {
      title: '存证时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time) => time ? new Date(time).toLocaleDateString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button 
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleVerify(record.id)}
          >
            验证
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">数字版权存证</h1>
        <p className="page-description">
          基于区块链技术的非遗文物数字版权存证服务，确保数字资产的版权归属和可追溯性
        </p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic 
              title="存证总数" 
              value={records.length}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic 
              title="有效存证" 
              value={records.filter(r => r.status === 'registered').length}
              valueStyle={{ color: '#7c3aed' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic 
              title="覆盖文物" 
              value={new Set(records.map(r => r.heritage_id)).size}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="版权存证记录"
        extra={
          <Space>
            <Button 
              icon={<ThunderboltOutlined />}
              onClick={handleSimulateRegister}
            >
              批量存证
            </Button>
            <Button 
              type="primary"
              icon={<SafetyCertificateOutlined />}
              onClick={() => setIsModalOpen(true)}
            >
              申请存证
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={records}
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
        title="申请版权存证"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleRegister}>
          <Form.Item 
            name="heritage_id" 
            label="选择文物" 
            rules={[{ required: true, message: '请选择文物' }]}
          >
            <Select placeholder="请选择要存证的文物">
              {heritageList.map(h => (
                <Option key={h.id} value={h.id}>{h.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            name="work_name" 
            label="作品名称" 
            rules={[{ required: true, message: '请输入作品名称' }]}
          >
            <Input placeholder="请输入作品名称" />
          </Form.Item>
          <Form.Item 
            name="author" 
            label="权利人" 
            rules={[{ required: true, message: '请输入权利人' }]}
          >
            <Input placeholder="请输入权利人名称" />
          </Form.Item>
          <Form.Item name="creation_date" label="创作日期">
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              提交存证
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="版权存证详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        width={600}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedRecord && (
          <div>
            <div className="certificate-card" style={{ marginBottom: 24 }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <SafetyCertificateOutlined style={{ fontSize: 48, color: '#7c3aed' }} />
                <h3 style={{ marginTop: 8, marginBottom: 0 }}>{selectedRecord.work_name}</h3>
              </div>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="权利人">{selectedRecord.author}</Descriptions.Item>
                <Descriptions.Item label="创作日期">{selectedRecord.creation_date || '-'}</Descriptions.Item>
                <Descriptions.Item label="关联文物">{getHeritageName(selectedRecord.heritage_id)}</Descriptions.Item>
              </Descriptions>
            </div>

            <Descriptions title="区块链存证信息" column={1} size="small" bordered>
              <Descriptions.Item 
                label="存证哈希"
                extra={
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(selectedRecord.register_hash)}
                  />
                }
              >
                <span className="hash-text">{selectedRecord.register_hash}</span>
              </Descriptions.Item>
              <Descriptions.Item label="交易ID">
                <span className="hash-text">{selectedRecord.transaction_id}</span>
              </Descriptions.Item>
              <Descriptions.Item label="区块号">{selectedRecord.block_number}</Descriptions.Item>
              <Descriptions.Item label="存证时间">
                {selectedRecord.timestamp ? new Date(selectedRecord.timestamp).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="存证状态">
                <Tag color="purple">已存证</Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}
