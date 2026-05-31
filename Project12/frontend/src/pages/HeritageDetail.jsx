import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Descriptions, Tag, Button, Upload, Space, Modal, Form, Input, Select, Progress, message, Tabs, List, Statistic } from 'antd'
import {
  ArrowLeftOutlined,
  UploadOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { heritageApi, pointcloudApi, textureApi, copyrightApi } from '../services/api.js'
import ModelViewer from '../components/ModelViewer.jsx'

const { Dragger } = Upload
const { Option } = Select
const { TextArea } = Input

export default function HeritageDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [heritage, setHeritage] = useState(null)
  const [modelUrl, setModelUrl] = useState(null)
  const [pointcloudTasks, setPointcloudTasks] = useState([])
  const [textureRestorations, setTextureRestorations] = useState([])
  const [copyrightRecords, setCopyrightRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [uploadType, setUploadType] = useState('model')
  const [copyrightModalVisible, setCopyrightModalVisible] = useState(false)
  const [copyrightForm] = Form.useForm()

  useEffect(() => {
    if (id) {
      loadHeritageDetail()
    }
  }, [id])

  const loadHeritageDetail = async () => {
    setLoading(true)
    try {
      const res = await heritageApi.get(id)
      setHeritage(res.data)

      try {
        const modelUrlRes = await heritageApi.getModelUrl(id)
        setModelUrl(modelUrlRes.data.model_url)
      } catch (e) {
        setModelUrl(null)
      }

      const [tasks, textures, copyrights] = await Promise.all([
        pointcloudApi.list({ heritage_id: id }).catch(() => ({ data: [] })),
        textureApi.list({ heritage_id: id }).catch(() => ({ data: [] })),
        copyrightApi.list({ heritage_id: id }).catch(() => ({ data: [] }))
      ])

      setPointcloudTasks(tasks.data)
      setTextureRestorations(textures.data)
      setCopyrightRecords(copyrights.data)
    } catch (error) {
      message.error('加载文物详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (file) => {
    try {
      if (uploadType === 'model') {
        await heritageApi.uploadModel(id, file)
        message.success('模型上传成功')
      } else {
        await heritageApi.uploadTexture(id, file)
        message.success('纹理上传成功')
      }
      setUploadModalVisible(false)
      loadHeritageDetail()
    } catch (error) {
      message.error('上传失败')
    }
  }

  const handleStartPointcloud = async () => {
    try {
      await pointcloudApi.create({
        heritage_id: parseInt(id),
        task_name: `${heritage.name} - 点云处理`,
        algorithm: '泊松表面重建'
      })
      message.success('点云处理任务已创建')
      loadHeritageDetail()
    } catch (error) {
      message.error('创建任务失败')
    }
  }

  const handleStartTexture = async () => {
    try {
      await textureApi.create({
        heritage_id: parseInt(id),
        restoration_type: 'AI纹理修复'
      })
      message.success('纹理修复任务已创建')
      loadHeritageDetail()
    } catch (error) {
      message.error('创建任务失败')
    }
  }

  const handleSimulateTexture = async (restorationId) => {
    try {
      await textureApi.simulate(restorationId)
      message.success('纹理修复模拟完成')
      loadHeritageDetail()
    } catch (error) {
      message.error('模拟失败')
    }
  }

  const handleRegisterCopyright = async () => {
    try {
      const values = await copyrightForm.validateFields()
      await copyrightApi.register({
        heritage_id: parseInt(id),
        ...values
      })
      message.success('版权存证成功')
      setCopyrightModalVisible(false)
      copyrightForm.resetFields()
      loadHeritageDetail()
    } catch (error) {
      if (error.errorFields) return
      message.error('版权存证失败')
    }
  }

  const uploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: (file) => {
      handleUpload(file)
      return false
    },
    accept: uploadType === 'model' 
      ? '.glb,.gltf,.obj,.fbx,.stl,.ply' 
      : '.jpg,.jpeg,.png,.webp,.bmp'
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 48 }}>加载中...</div>
  }

  if (!heritage) {
    return <div style={{ textAlign: 'center', padding: 48 }}>文物不存在</div>
  }

  return (
    <div>
      <div className="page-header">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/heritage')}
          style={{ marginBottom: 16 }}
        >
          返回列表
        </Button>
        <h1 className="page-title">{heritage.name}</h1>
        <p className="page-description">{heritage.description || '暂无描述'}</p>
        <Space style={{ marginTop: 8 }}>
          <Tag color="gold">{heritage.category || '未分类'}</Tag>
          <Tag color="blue">{heritage.dynasty || '未知'}</Tag>
          {heritage.is_restored ? (
            <Tag color="green" icon={<CheckCircleOutlined />}>已修复</Tag>
          ) : (
            <Tag color="red" icon={<ClockCircleOutlined />}>待修复</Tag>
          )}
          {heritage.copyright_registered && (
            <Tag color="purple" icon={<SafetyCertificateOutlined />}>已存证</Tag>
          )}
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card 
            title="三维模型预览" 
            extra={
              <Space>
                <Button 
                  icon={<UploadOutlined />} 
                  onClick={() => {
                    setUploadType('model')
                    setUploadModalVisible(true)
                  }}
                >
                  上传模型
                </Button>
                <Button 
                  icon={<UploadOutlined />} 
                  onClick={() => {
                    setUploadType('texture')
                    setUploadModalVisible(true)
                  }}
                >
                  上传纹理
                </Button>
              </Space>
            }
          >
            <ModelViewer 
              modelUrl={modelUrl} 
              format={heritage.model_format}
            />
          </Card>

          <Card title="基本信息" style={{ marginTop: 24 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="文物类别">{heritage.category || '-'}</Descriptions.Item>
              <Descriptions.Item label="所属朝代">{heritage.dynasty || '-'}</Descriptions.Item>
              <Descriptions.Item label="出土地点">{heritage.location || '-'}</Descriptions.Item>
              <Descriptions.Item label="模型格式">{heritage.model_format || '-'}</Descriptions.Item>
              <Descriptions.Item label="模型大小">
                {heritage.model_size ? `${heritage.model_size.toFixed(2)} MB` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="顶点数量">
                {heritage.vertex_count ? heritage.vertex_count.toLocaleString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="面片数量">
                {heritage.face_count ? heritage.face_count.toLocaleString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="纹理分辨率">{heritage.texture_resolution || '-'}</Descriptions.Item>
              <Descriptions.Item label="修复状态">
                {heritage.restoration_status === 'completed' ? '已完成' : 
                 heritage.restoration_status === 'in_progress' ? '进行中' : '待处理'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(heritage.created_at).toLocaleString('zh-CN')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title="操作面板" 
            style={{ marginBottom: 24 }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                block 
                icon={<CloudServerOutlined />}
                onClick={handleStartPointcloud}
              >
                发起点云处理
              </Button>
              <Button 
                block 
                icon={<CloudServerOutlined />}
                onClick={handleStartTexture}
              >
                发起纹理修复
              </Button>
              {!heritage.copyright_registered && (
                <Button 
                  block 
                  icon={<SafetyCertificateOutlined />}
                  onClick={() => setCopyrightModalVisible(true)}
                >
                  申请版权存证
                </Button>
              )}
            </Space>
          </Card>

          <Card title="状态统计" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title="点云任务" 
                  value={pointcloudTasks.length}
                  prefix={<CloudServerOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="纹理修复" 
                  value={textureRestorations.length}
                  prefix={<FileTextOutlined />}
                />
              </Col>
            </Row>
          </Card>

          <Card title="版权信息">
            {copyrightRecords.length > 0 ? (
              copyrightRecords.map((record) => (
                <div key={record.id} className="certificate-card">
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{record.work_name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                    权利人: {record.author}
                  </div>
                  <div className="hash-text" style={{ marginBottom: 8 }}>
                    存证哈希: {record.register_hash?.substring(0, 32)}...
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    区块号: {record.block_number}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>
                <SafetyCertificateOutlined style={{ fontSize: 32 }} />
                <p style={{ marginTop: 8 }}>暂无版权存证记录</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card title="任务记录" style={{ marginTop: 24 }}>
        <Tabs
          items={[
            {
              key: 'pointcloud',
              label: `点云处理 (${pointcloudTasks.length})`,
              children: (
                <List
                  dataSource={pointcloudTasks}
                  renderItem={(item) => (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        title={item.task_name}
                        description={
                          <Space>
                            <Tag color={item.status === 'completed' ? 'green' : item.status === 'processing' ? 'blue' : 'orange'}>
                              {item.status === 'completed' ? '已完成' : item.status === 'processing' ? '处理中' : '等待中'}
                            </Tag>
                            {item.algorithm && <span>算法: {item.algorithm}</span>}
                            {item.point_count && <span>点数: {item.point_count.toLocaleString()}</span>}
                          </Space>
                        }
                      />
                      <Progress 
                        percent={Math.round(item.progress)} 
                        style={{ width: 150 }}
                        status={item.status === 'completed' ? 'success' : item.status === 'processing' ? 'active' : 'normal'}
                      />
                    </List.Item>
                  )}
                />
              )
            },
            {
              key: 'texture',
              label: `纹理修复 (${textureRestorations.length})`,
              children: (
                <List
                  dataSource={textureRestorations}
                  renderItem={(item) => (
                    <List.Item
                      key={item.id}
                      actions={item.status === 'pending' ? [
                        <Button 
                          key="simulate" 
                          size="small"
                          type="primary"
                          onClick={() => handleSimulateTexture(item.id)}
                        >
                          模拟修复
                        </Button>
                      ] : null}
                    >
                      <List.Item.Meta
                        title={item.restoration_type}
                        description={
                          <Space>
                            <Tag color={item.status === 'completed' ? 'green' : item.status === 'in_progress' ? 'blue' : 'orange'}>
                              {item.status === 'completed' ? '已完成' : item.status === 'in_progress' ? '进行中' : '等待中'}
                            </Tag>
                            {item.confidence && <span>置信度: {(item.confidence * 100).toFixed(1)}%</span>}
                          </Space>
                        }
                      />
                      {item.completed_at && (
                        <span style={{ color: '#9ca3af', fontSize: 12 }}>
                          {new Date(item.completed_at).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                    </List.Item>
                  )}
                />
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={`上传${uploadType === 'model' ? '模型' : '纹理'}文件`}
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            {uploadType === 'model' 
              ? '支持格式: GLB, GLTF, OBJ, FBX, STL, PLY'
              : '支持格式: JPG, PNG, WEBP, BMP'}
          </p>
        </Dragger>
      </Modal>

      <Modal
        title="申请版权存证"
        open={copyrightModalVisible}
        onCancel={() => {
          setCopyrightModalVisible(false)
          copyrightForm.resetFields()
        }}
        footer={null}
      >
        <Form form={copyrightForm} layout="vertical" onFinish={handleRegisterCopyright}>
          <Form.Item 
            name="work_name" 
            label="作品名称" 
            rules={[{ required: true, message: '请输入作品名称' }]}
          >
            <Input placeholder={`${heritage.name}三维数字模型`} />
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
    </div>
  )
}
