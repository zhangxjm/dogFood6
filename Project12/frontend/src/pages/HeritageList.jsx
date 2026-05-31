import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Tag, Button, Space, Input, Select, Modal, Form, message, Popconfirm } from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { heritageApi } from '../services/api.js'

const { Option } = Select

export default function HeritageList() {
  const navigate = useNavigate()
  const [heritageList, setHeritageList] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadHeritage()
  }, [])

  const loadHeritage = async () => {
    setLoading(true)
    try {
      const params = {}
      if (categoryFilter) params.category = categoryFilter
      const res = await heritageApi.list(params)
      setHeritageList(res.data)
    } catch (error) {
      message.error('加载文物列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await heritageApi.create(values)
      message.success('创建成功')
      setIsModalOpen(false)
      form.resetFields()
      loadHeritage()
    } catch (error) {
      if (error.errorFields) return
      message.error('创建失败')
    }
  }

  const handleDelete = async (id) => {
    try {
      await heritageApi.delete(id)
      message.success('删除成功')
      loadHeritage()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const filteredList = heritageList.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchText.toLowerCase()))
  )

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">文物管理</h1>
        <p className="page-description">管理非遗文物的三维数字化数据、纹理修复和版权存证</p>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Space>
          <Input
            placeholder="搜索文物名称或描述"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="按类别筛选"
            style={{ width: 150 }}
            value={categoryFilter}
            onChange={(value) => {
              setCategoryFilter(value)
              setTimeout(loadHeritage, 0)
            }}
            allowClear
          >
            <Option value="青铜器">青铜器</Option>
            <Option value="陶俑">陶俑</Option>
            <Option value="漆器">漆器</Option>
            <Option value="壁画">壁画</Option>
            <Option value="瓷器">瓷器</Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            添加文物
          </Button>
        </Space>
      </Card>

      <Row gutter={[24, 24]}>
        {filteredList.map((item) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
            <Card
              className="heritage-card"
              hoverable
              onClick={() => navigate(`/heritage/${item.id}`)}
              actions={[
                <EyeOutlined key="view" onClick={(e) => { e.stopPropagation(); navigate(`/heritage/${item.id}`) }} />,
                <Popconfirm
                  key="delete"
                  title="确定删除该文物？"
                  onConfirm={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id)
                  }}
                  onCancel={(e) => e.stopPropagation()}
                >
                  <DeleteOutlined onClick={(e) => e.stopPropagation()} />
                </Popconfirm>
              ]}
            >
              <div className="heritage-card-image">
                <DatabaseOutlined />
              </div>
              <div className="heritage-card-content">
                <div className="heritage-card-title">{item.name}</div>
                <div className="heritage-card-meta">
                  <Tag className="tag-category">{item.category || '未分类'}</Tag>
                  <Tag className="tag-dynasty">{item.dynasty || '未知'}</Tag>
                </div>
                <div className="heritage-card-footer">
                  <Space>
                    {item.is_restored ? (
                      <Tag className="tag-restored" icon={<CheckCircleOutlined />}>已修复</Tag>
                    ) : (
                      <Tag className="tag-pending" icon={<ClockCircleOutlined />}>待修复</Tag>
                    )}
                    {item.copyright_registered && (
                      <Tag className="tag-copyright" icon={<SafetyCertificateOutlined />}>已存证</Tag>
                    )}
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredList.length === 0 && !loading && (
        <Card style={{ textAlign: 'center', padding: 48 }}>
          <DatabaseOutlined style={{ fontSize: 48, color: '#9ca3af' }} />
          <p style={{ marginTop: 16, color: '#6b7280' }}>暂无文物数据</p>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            添加第一个文物
          </Button>
        </Card>
      )}

      <Modal
        title="添加文物"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="文物名称" rules={[{ required: true, message: '请输入文物名称' }]}>
            <Input placeholder="请输入文物名称" />
          </Form.Item>
          <Form.Item name="category" label="文物类别">
            <Select placeholder="请选择文物类别">
              <Option value="青铜器">青铜器</Option>
              <Option value="陶俑">陶俑</Option>
              <Option value="漆器">漆器</Option>
              <Option value="壁画">壁画</Option>
              <Option value="瓷器">瓷器</Option>
              <Option value="玉器">玉器</Option>
              <Option value="书画">书画</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dynasty" label="所属朝代">
            <Input placeholder="请输入所属朝代" />
          </Form.Item>
          <Form.Item name="location" label="出土地点">
            <Input placeholder="请输入出土地点" />
          </Form.Item>
          <Form.Item name="description" label="文物描述">
            <Input.TextArea rows={4} placeholder="请输入文物描述" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
