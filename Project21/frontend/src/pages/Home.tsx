import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Statistic, Tag, List, Avatar } from 'antd';
import { BookOutlined, UserOutlined, TrophyOutlined, VideoCameraOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { courseAPI, certificateAPI } from '../services/api';
import { Course, Certificate } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [courseData, certData] = await Promise.all([
        courseAPI.getAll(),
        certificateAPI.getAll(currentUser.role === 'student' ? currentUser.id : undefined),
      ]);
      setCourses(courseData.slice(0, 6));
      setCertificates(certData.slice(0, 5));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'blue';
      case 'ongoing': return 'green';
      case 'completed': return 'gray';
      case 'draft': return 'orange';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return '已发布';
      case 'ongoing': return '进行中';
      case 'completed': return '已完成';
      case 'draft': return '草稿';
      default: return status;
    }
  };

  const ongoingCourses = courses.filter(c => c.status === 'ongoing').length;
  const publishedCourses = courses.filter(c => c.status === 'published').length;

  return (
    <div>
      <div className="hero-section">
        <h1>非遗研学沉浸式互动课程平台</h1>
        <p>传承中华文明，体验非遗魅力，开启您的研学之旅</p>
        <Button type="primary" size="large" onClick={() => navigate('/courses')}>
          探索课程 <ArrowRightOutlined />
        </Button>
      </div>

      <div className="page-container">
        <Row gutter={[16, 16]} style={{ marginBottom: 32, marginTop: -60 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="课程总数"
                value={courses.length}
                prefix={<BookOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="正在直播"
                value={ongoingCourses}
                prefix={<VideoCameraOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="待学习课程"
                value={publishedCourses}
                prefix={<BookOutlined style={{ color: '#fa8c16' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="获得证书"
                value={certificates.filter(c => c.isValid).length}
                prefix={<TrophyOutlined style={{ color: '#722ed1' }} />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
              title="热门课程"
              extra={<Button type="link" onClick={() => navigate('/courses')}>查看全部</Button>}
            >
              <Row gutter={[16, 16]}>
                {courses.map((course) => (
                  <Col xs={24} sm={12} key={course.id}>
                    <Card
                      hoverable
                      className="card-hover"
                      size="small"
                      cover={
                        <div style={{ height: 120, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 32 }}>
                          <BookOutlined />
                        </div>
                      }
                      onClick={() => navigate('/courses/' + course.id)}
                    >
                      <Tag color={getStatusColor(course.status)} style={{ marginBottom: 8 }}>
                        {getStatusText(course.status)}
                      </Tag>
                      <h4 style={{ marginBottom: 4 }}>{course.title}</h4>
                      <p style={{ color: '#999', fontSize: 12, margin: 0 }}>
                        讲师：{course.teacher?.name || '暂无'}
                      </p>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title="我的证书"
              extra={<Button type="link" onClick={() => navigate('/certificates')}>查看全部</Button>}
            >
              {certificates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  <TrophyOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }} />
                  <p>暂无证书，完成课程学习即可获得</p>
                </div>
              ) : (
                <List
                  dataSource={certificates}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<TrophyOutlined />} style={{ backgroundColor: item.isValid ? '#52c41a' : '#ff4d4f' }} />}
                        title={item.title}
                        description={
                          <div>
                            <span>{item.course?.title}</span>
                            <Tag color={item.isValid ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                              {item.isValid ? '有效' : '已作废'}
                            </Tag>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home;
