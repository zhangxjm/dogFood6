import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, DatePicker, Switch, Space,
  message, Popconfirm, Card, Typography, Tag, Spin
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, RocketOutlined } from '@ant-design/icons';
import { satelliteAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const SatelliteList = () => {
  const [loading, setLoading] = useState(true);
  const [satellites, setSatellites] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSatellite, setEditingSatellite] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSatellites();
  }, []);

  const fetchSatellites = async () => {
    try {
      setLoading(true);
      const response = await satelliteAPI.getAll();
      setSatellites(response.data);
    } catch (err) {
      message.error('加载卫星列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSatellite(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSatellite(record);
    form.setFieldsValue({
      ...record,
      launch_date: record.launch_date ? dayjs(record.launch_date) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await satelliteAPI.delete(id);
      message.success('删除成功');
      fetchSatellites();
    } catch (err) {
      message.error('删除失败');
      console.error(err);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        launch_date: values.launch_date ? values.launch_date.toISOString() : null,
      };

      if (editingSatellite) {
        await satelliteAPI.update(editingSatellite.id, data);
        message.success('更新成功');
      } else {
        await satelliteAPI.create(data);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchSatellites();
    } catch (err) {
      message.error('操作失败');
      console.error(err);
    }
  };

  const columns = [
    {
      title: '卫星名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <RocketOutlined style={{ color: '#1890ff' }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'NORAD ID',
      dataIndex: 'norad_id',
      key: 'norad_id',
    },
    {
      title: '卫星类型',
      dataIndex: 'satellite_type',
      key: 'satellite_type',
      render: (type) => type || '-',
    },
    {
      title: '发射日期',
      dataIndex: 'launch_date',
      key: 'launch_date',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '运行状态',
      dataIndex: 'operational',
      key: 'operational',
      render: (op) => (
        <Tag color={op ? 'green' : 'red'}>
          {op ? '运行中' : '已停用'}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc) => desc || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这颗卫星吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2} className="page-header" style={{ margin: 0 }}>
          卫星管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加卫星
        </Button>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={satellites.map(function(s) { return { ...s, key: s.id }; })}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 颗卫星`,
            }}
          />
        )}
      </Card>

      <Modal
        title={editingSatellite ? '编辑卫星' : '添加卫星'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="卫星名称"
            rules={[{ required: true, message: '请输入卫星名称' }]}
          >
            <Input placeholder="请输入卫星名称" />
          </Form.Item>

          <Form.Item
            name="norad_id"
            label="NORAD ID"
            rules={[{ required: true, message: '请输入NORAD ID' }]}
          >
            <Input placeholder="请输入NORAD ID" />
          </Form.Item>

          <Form.Item name="satellite_type" label="卫星类型">
            <Input placeholder="请输入卫星类型" />
          </Form.Item>

          <Form.Item name="launch_date" label="发射日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="operational"
            label="运行状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="运行中" unCheckedChildren="已停用" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingSatellite ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SatelliteList;
