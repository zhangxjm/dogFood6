import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Tag, Button, Input, Modal, Form, Select, message, List, Empty } from 'antd';
import { SearchOutlined, DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { certificateAPI, courseAPI, userAPI } from '../services/api';
import { Certificate, Course, User } from '../types';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const Certificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  const [verifiedCertificate, setVerifiedCertificate] = useState<Certificate | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form] = Form.useForm();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isTeacherOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userId = currentUser.role === 'student' ? currentUser.id : undefined;
      const [certData, courseData, userData] = await Promise.all([
        certificateAPI.getAll(userId),
        courseAPI.getAll(),
        isTeacherOrAdmin ? userAPI.getAll() : Promise.resolve([]),
      ]);
      setCertificates(certData);
      setFilteredCertificates(certData);
      setCourses(courseData);
      setUsers(userData.filter(u => u.role === 'student'));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (certificateNumber: string) => {
    try {
      const cert = await certificateAPI.verify(certificateNumber);
      setVerifiedCertificate(cert);
      setVerifyModalVisible(true);
    } catch (error) {
      message.error('证书不存在或已作废');
    }
  };

  const handleIssue = async (values: any) => {
    try {
      await certificateAPI.create({
        ...values,
        content: `兹证明 ${users.find(u => u.id === values.userId)?.name} 已完成《${courses.find(c => c.id === values.courseId)?.title}》课程学习，考核合格，特发此证。`,
      });
      message.success('证书颁发成功！');
      setIssueModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error('颁发失败！');
    }
  };

  const handleInvalidate = async (id: number) => {
    try {
      await certificateAPI.invalidate(id);
      message.success('证书已作废');
      loadData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleSearch = (value: string) => {
    if (!value) {
      setFilteredCertificates(certificates);
      return;
    }
    const filtered = certificates.filter(c =>
      c.title.toLowerCase().includes(value.toLowerCase()) ||
      c.certificateNumber.toLowerCase().includes(value.toLowerCase()) ||
      c.user?.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCertificates(filtered);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0 }}>证书中心</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Search
            placeholder="搜索证书..."
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 250 }}
            onSearch={handleSearch}
          />
          <Button onClick={() => setVerifyModalVisible(true)}>
            验证证书
          </Button>
          {isTeacherOrAdmin && (
            <Button type="primary" onClick={() => setIssueModalVisible(true)}>
              颁发证书
            </Button>
          )}
        </div>
      </div>

      {filteredCertificates.length === 0 ? (
        <Empty description="暂无证书" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredCertificates.map((cert) => (
            <Col xs={24} sm={12} lg={8} key={cert.id}>
              <Card className="card-hover">
                <div className="certificate-preview">
                  <h2>{cert.title}</h2>
                  <p style={{ fontSize: 12, opacity: 0.9 }}>{cert.certificateNumber}</p>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color={cert.isValid ? 'green' : 'red'}>
                      {cert.isValid ? '有效' : '已作废'}
                    </Tag>
                    {cert.isValid && isTeacherOrAdmin && (
                      <Button type="link" danger size="small" onClick={() => handleInvalidate(cert.id)}>
                        作废
                      </Button>
                    )}
                  </div>
                  <p style={{ marginBottom: 4 }}>
                    <strong>学员：</strong>{cert.user?.name || '未知'}
                  </p>
                  <p style={{ marginBottom: 4 }}>
                    <strong>课程：</strong>{cert.course?.title || '未知'}
                  </p>
                  <p style={{ marginBottom: 4 }}>
                    <strong>颁发日期：</strong>{dayjs(cert.issueDate).format('YYYY-MM-DD')}
                  </p>
                  {cert.validUntil && (
                    <p style={{ marginBottom: 8 }}>
                      <strong>有效期至：</strong>{dayjs(cert.validUntil).format('YYYY-MM-DD')}
                    </p>
                  )}
                  <Button icon={<DownloadOutlined />} block>
                    下载证书
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="验证证书"
        open={verifyModalVisible}
        onCancel={() => {
          setVerifyModalVisible(false);
          setVerifiedCertificate(null);
        }}
        footer={null}
        width={500}
      >
        {!verifiedCertificate ? (
          <div>
            <Search
              placeholder="请输入证书编号"
              enterButton="验证"
              size="large"
              onSearch={handleVerify}
              style={{ marginBottom: 16 }}
            />
            <p style={{ color: '#888', fontSize: 12 }}>请输入证书编号进行验证</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
            <h3>证书有效</h3>
            <Card style={{ textAlign: 'left', marginTop: 16 }}>
              <p><strong>证书编号：</strong>{verifiedCertificate.certificateNumber}</p>
              <p><strong>证书名称：</strong>{verifiedCertificate.title}</p>
              <p><strong>持证人：</strong>{verifiedCertificate.user?.name}</p>
              <p><strong>课程：</strong>{verifiedCertificate.course?.title}</p>
              <p><strong>颁发日期：</strong>{dayjs(verifiedCertificate.issueDate).format('YYYY-MM-DD')}</p>
            </Card>
          </div>
        )}
      </Modal>

      <Modal
        title="颁发证书"
        open={issueModalVisible}
        onCancel={() => setIssueModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleIssue}>
          <Form.Item name="userId" label="选择学员" rules={[{ required: true, message: '请选择学员' }]}>
            <Select placeholder="请选择学员">
              {users.map(user => (
                <Option key={user.id} value={user.id}>{user.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="courseId" label="选择课程" rules={[{ required: true, message: '请选择课程' }]}>
            <Select placeholder="请选择课程">
              {courses.map(course => (
                <Option key={course.id} value={course.id}>{course.title}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="title" label="证书名称" rules={[{ required: true, message: '请输入证书名称' }]}>
            <Input placeholder="如：结业证书、荣誉证书等" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setIssueModalVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              颁发
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Certificates;
