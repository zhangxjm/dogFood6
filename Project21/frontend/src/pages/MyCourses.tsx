import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, InputNumber, message, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { courseAPI } from '../services/api';
import { Course } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form] = Form.useForm();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await courseAPI.getAll(currentUser.id);
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCourse(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    form.setFieldsValue({
      ...course,
      startTime: course.startTime ? dayjs(course.startTime) : null,
      endTime: course.endTime ? dayjs(course.endTime) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await courseAPI.delete(id);
      message.success('删除成功！');
      loadCourses();
    } catch (error) {
      message.error('删除失败！');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const courseData: any = {
        title: values.title,
        description: values.description,
        category: values.category || null,
        status: values.status || 'draft',
        duration: values.duration || 0,
        maxStudents: values.maxStudents || 0,
        currentStudents: 0,
        teacherId: currentUser.id,
        startTime: values.startTime || null,
        endTime: values.endTime || null,
      };

      if (editingCourse) {
        await courseAPI.update(editingCourse.id, courseData);
        message.success('更新成功！');
      } else {
        await courseAPI.create(courseData);
        message.success('创建成功！');
      }
      setModalVisible(false);
      loadCourses();
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || (editingCourse ? '更新失败！' : '创建失败！');
      message.error(errMsg);
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

  const columns = [
    {
      title: '课程名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: '学员数',
      key: 'students',
      width: 100,
      render: (_: any, record: Course) => `${record.currentStudents}/${record.maxStudents}`,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: Course) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>我的课程</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          创建课程
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={courses}
        loading={loading}
      />

      <Modal
        title={editingCourse ? '编辑课程' : '创建课程'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="课程名称" rules={[{ required: true, message: '请输入课程名称' }]}>
            <Input placeholder="请输入课程名称" />
          </Form.Item>

          <Form.Item name="description" label="课程描述" rules={[{ required: true, message: '请输入课程描述' }]}>
            <TextArea rows={4} placeholder="请输入课程描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="category" label="课程分类">
                <Select placeholder="请选择分类">
                  <Option value="传统戏剧">传统戏剧</Option>
                  <Option value="书法艺术">书法艺术</Option>
                  <Option value="民间工艺">民间工艺</Option>
                  <Option value="传统技艺">传统技艺</Option>
                  <Option value="传统建筑">传统建筑</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="status" label="课程状态" initialValue="draft">
                <Select>
                  <Option value="draft">草稿</Option>
                  <Option value="published">已发布</Option>
                  <Option value="ongoing">进行中</Option>
                  <Option value="completed">已完成</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="duration" label="课程时长(分钟)" initialValue={60}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="maxStudents" label="最大学员数" initialValue={30}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="startTime" label="开始时间">
                <Input type="datetime-local" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="endTime" label="结束时间">
                <Input type="datetime-local" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">{editingCourse ? '保存' : '创建'}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyCourses;
