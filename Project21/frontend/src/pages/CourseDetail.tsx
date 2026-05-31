import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Tag, Descriptions, List, Upload, message, Empty, Modal, Form, Input, Select } from 'antd';
import { ArrowLeftOutlined, VideoCameraOutlined, UploadOutlined, FileTextOutlined, PlayCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import { courseAPI, coursewareAPI } from '../services/api';
import { Course, Courseware } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [coursewares, setCoursewares] = useState<Courseware[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (id) {
      loadCourseDetail();
    }
  }, [id]);

  const loadCourseDetail = async () => {
    try {
      const [courseData, coursewareData] = await Promise.all([
        courseAPI.getById(parseInt(id!)),
        coursewareAPI.getAll(parseInt(id!)),
      ]);
      setCourse(courseData);
      setCoursewares(coursewareData);
    } catch (error) {
      console.error('Failed to load course detail:', error);
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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
      case 'image': return <FileTextOutlined style={{ fontSize: 24, color: '#52c41a' }} />;
      case 'audio': return <FileTextOutlined style={{ fontSize: 24, color: '#722ed1' }} />;
      default: return <FileTextOutlined style={{ fontSize: 24, color: '#fa8c16' }} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleUpload = async () => {
    if (!selectedFile || !course) return;
    
    setUploading(true);
    try {
      await coursewareAPI.upload(course.id, selectedFile, selectedFile.name);
      message.success('上传成功！');
      setUploadModalVisible(false);
      setSelectedFile(null);
      loadCourseDetail();
    } catch (error) {
      message.error('上传失败！');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (courseware: Courseware) => {
    try {
      if (courseware.fileUrl) {
        const link = document.createElement('a');
        link.href = courseware.fileUrl;
        link.download = courseware.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success('开始下载...');
      } else {
        message.warning('文件地址无效');
      }
    } catch (error) {
      message.error('下载失败');
    }
  };

  const isTeacher = currentUser.role === 'teacher' || currentUser.role === 'admin';

  if (loading) {
    return <div className="page-container">加载中...</div>;
  }

  if (!course) {
    return <div className="page-container"><Empty description="课程不存在" /></div>;
  }

  return (
    <div className="page-container">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        返回
      </Button>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Tag color={getStatusColor(course.status)} style={{ marginBottom: 8 }}>{getStatusText(course.status)}</Tag>
              <h1 style={{ marginBottom: 8 }}>{course.title}</h1>
              <p style={{ color: '#666' }}>{course.description}</p>
            </div>

            <Descriptions column={2} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="分类">{course.category || '未分类'}</Descriptions.Item>
              <Descriptions.Item label="时长">{course.duration} 分钟</Descriptions.Item>
              <Descriptions.Item label="讲师">{course.teacher?.name || '暂无'}</Descriptions.Item>
              <Descriptions.Item label="学员数">{course.currentStudents}/{course.maxStudents} 人</Descriptions.Item>
              {course.startTime && (
                <Descriptions.Item label="开始时间">{dayjs(course.startTime).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
              )}
              {course.endTime && (
                <Descriptions.Item label="结束时间">{dayjs(course.endTime).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>课程课件</h3>
                {isTeacher && (
                  <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadModalVisible(true)}>
                    上传课件
                  </Button>
                )}
              </div>

              {coursewares.length === 0 ? (
                <Empty description="暂无课件" />
              ) : (
                <List
                  dataSource={coursewares}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button type="link" icon={<DownloadOutlined />} onClick={() => handleDownload(item)}>下载</Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={getFileIcon(item.type)}
                        title={item.title}
                        description={
                          <div>
                            <span>{item.fileName}</span>
                            <span style={{ marginLeft: 16, color: '#999' }}>{formatFileSize(item.fileSize)}</span>
                            <span style={{ marginLeft: 16, color: '#999' }}>{dayjs(item.createdAt).format('YYYY-MM-DD')}</span>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="课程操作"
            actions={[
              course.status === 'ongoing' && (
                <Button type="primary" icon={<VideoCameraOutlined />} block onClick={() => navigate(`/live/${course.id}`)}>
                  进入直播课堂
                </Button>
              ),
            ].filter(Boolean)}
          >
            <p style={{ color: '#666' }}>
              {course.status === 'published' && '课程已发布，等待开始...'}
              {course.status === 'ongoing' && '课程正在进行中，点击下方按钮进入直播课堂'}
              {course.status === 'completed' && '课程已完成，您可以查看课程资料和下载课件'}
              {course.status === 'draft' && '课程尚未发布，请等待讲师发布'}
            </p>
          </Card>

          {course.customFields && Object.keys(course.customFields).length > 0 && (
            <Card title="自定义字段" style={{ marginTop: 16 }}>
              <Descriptions column={1} size="small">
                {Object.entries(course.customFields).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>{String(value)}</Descriptions.Item>
                ))}
              </Descriptions>
            </Card>
          )}
        </Col>
      </Row>

      <Modal
        title="上传课件"
        open={uploadModalVisible}
        onCancel={() => { setUploadModalVisible(false); setSelectedFile(null); }}
        onOk={handleUpload}
        confirmLoading={uploading}
        okText="上传"
      >
        <Upload
          beforeUpload={(file) => {
            setSelectedFile(file);
            return false;
          }}
          onRemove={() => setSelectedFile(null)}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
        {selectedFile && (
          <p style={{ marginTop: 16 }}>已选择：{selectedFile.name} ({formatFileSize(selectedFile.size)})</p>
        )}
      </Modal>
    </div>
  );
};

export default CourseDetail;
