import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Progress, List, Tag, Button, Space } from 'antd'
import {
  DatabaseOutlined,
  CloudServerOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { heritageApi, pointcloudApi, textureApi, copyrightApi } from '../services/api.js'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    heritageCount: 0,
    restoredCount: 0,
    copyrightCount: 0,
    pointcloudCount: 0
  })
  const [recentHeritage, setRecentHeritage] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [heritageRes, pointcloudRes, copyrightRes] = await Promise.all([
        heritageApi.list({ limit: 20 }),
        pointcloudApi.list({ limit: 10 }),
        copyrightApi.list()
      ])

      const heritageList = heritageRes.data
      const restoredCount = heritageList.filter(h => h.is_restored).length

      setStats({
        heritageCount: heritageList.length,
        restoredCount,
        copyrightCount: copyrightRes.data.length,
        pointcloudCount: pointcloudRes.data.length
      })

      setRecentHeritage(heritageList.slice(0, 5))
      setRecentTasks(pointcloudRes.data.slice(0, 5))
    } catch (error) {
      console.error('Load dashboard data failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessSample = async () => {
    try {
      await pointcloudApi.processSample()
      loadData()
    } catch (error) {
      console.error('Process sample failed:', error)
    }
  }

  const handleSimulateCopyright = async () => {
    try {
      await copyrightApi.simulateRegister()
      loadData()
    } catch (error) {
      console.error('Simulate copyright failed:', error)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">平台概览</h1>
        <p className="page-description">非遗数字化三维复原平台 - 提供文物三维建模、纹理修复、数字版权存证服务</p>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <DatabaseOutlined />
            </div>
            <div className="stat-title">文物总数</div>
            <div className="stat-value">{stats.heritageCount}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
              <CheckCircleOutlined />
            </div>
            <div className="stat-title">已修复</div>
            <div className="stat-value">{stats.restoredCount}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
              <SafetyCertificateOutlined />
            </div>
            <div className="stat-title">版权存证</div>
            <div className="stat-value">{stats.copyrightCount}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
              <CloudServerOutlined />
            </div>
            <div className="stat-title">点云任务</div>
            <div className="stat-value">{stats.pointcloudCount}</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card 
            title="最近添加的文物" 
            extra={
              <Button type="link" onClick={() => navigate('/heritage')}>
                查看全部 <ArrowRightOutlined />
              </Button>
            }
          >
            <List
              dataSource={recentHeritage}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  onClick={() => navigate(`/heritage/${item.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={
                      <Space>
                        <Tag color="gold">{item.category}</Tag>
                        <Tag color="blue">{item.dynasty}</Tag>
                        {item.is_restored ? (
                          <Tag color="green">已修复</Tag>
                        ) : (
                          <Tag color="red">待修复</Tag>
                        )}
                        {item.copyright_registered && (
                          <Tag color="purple">已存证</Tag>
                        )}
                      </Space>
                    }
                  />
                  <div style={{ color: '#9ca3af' }}>
                    {item.model_format || '未上传'}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="点云处理任务" 
            extra={
              <Button type="link" onClick={() => navigate('/pointcloud')}>
                查看全部 <ArrowRightOutlined />
              </Button>
            }
          >
            <List
              dataSource={recentTasks}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    title={item.task_name}
                    description={
                      <Space>
                        <Tag color={item.status === 'completed' ? 'green' : item.status === 'processing' ? 'blue' : 'orange'}>
                          {item.status === 'completed' ? '已完成' : item.status === 'processing' ? '处理中' : '等待中'}
                        </Tag>
                      </Space>
                    }
                  />
                  <Progress 
                    percent={Math.round(item.progress)} 
                    size="small"
                    status={item.status === 'completed' ? 'success' : item.status === 'processing' ? 'active' : 'normal'}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card title="快捷操作" style={{ marginTop: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                block 
                icon={<CloudServerOutlined />}
                onClick={handleProcessSample}
              >
                批量处理点云任务
              </Button>
              <Button 
                block 
                icon={<SafetyCertificateOutlined />}
                onClick={handleSimulateCopyright}
              >
                批量版权存证
              </Button>
              <Button 
                block 
                icon={<DatabaseOutlined />}
                onClick={() => navigate('/heritage')}
              >
                管理文物数据
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
