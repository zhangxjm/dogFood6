import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Space,
  Popconfirm,
  Tag,
  Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { petsAPI } from '../services/api';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PetList = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const response = await petsAPI.getAll();
      setPets(response.data);
    } catch (error) {
      message.error('获取宠物列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPet(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    form.setFieldsValue(pet);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await petsAPI.delete(id);
      message.success('删除成功');
      fetchPets();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingPet) {
        await petsAPI.update(editingPet.id, values);
        message.success('更新成功');
      } else {
        await petsAPI.create(values);
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchPets();
    } catch (error) {
      message.error(editingPet ? '更新失败' : '添加失败');
    }
  };

  const columns = [
    {
      title: '头像',
      key: 'avatar',
      width: 80,
      render: (_, record) => (
        <div className="pet-avatar" style={{ width: 40, height: 40, fontSize: 16 }}>
          {record.name.charAt(0)}
        </div>
      ),
    },
    {
      title: '名字',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '物种',
      dataIndex: 'species_display',
      key: 'species',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '品种',
      dataIndex: 'breed',
      key: 'breed',
    },
    {
      title: '性别',
      dataIndex: 'gender_display',
      key: 'gender',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      render: (age) => age ? `${age} 个月` : '-',
    },
    {
      title: '体重',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight) => weight ? `${weight} kg` : '-',
    },
    {
      title: '毛色',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这只宠物吗？"
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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>宠物管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加宠物
        </Button>
      </div>

      <div style={{ padding: 24 }}>
        <Table
          columns={columns}
          dataSource={pets}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title={editingPet ? '编辑宠物' : '添加宠物'}
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
            label="宠物名称"
            rules={[{ required: true, message: '请输入宠物名称' }]}
          >
            <Input placeholder="请输入宠物名称" />
          </Form.Item>

          <Form.Item
            name="species"
            label="物种"
            rules={[{ required: true, message: '请选择物种' }]}
          >
            <Select placeholder="请选择物种">
              <Option value="dog">狗</Option>
              <Option value="cat">猫</Option>
              <Option value="bird">鸟</Option>
              <Option value="rabbit">兔子</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item name="breed" label="品种">
            <Input placeholder="请输入品种" />
          </Form.Item>

          <Form.Item name="gender" label="性别">
            <Select placeholder="请选择性别">
              <Option value="male">公</Option>
              <Option value="female">母</Option>
              <Option value="unknown">未知</Option>
            </Select>
          </Form.Item>

          <Form.Item name="age" label="年龄（月）">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入年龄" />
          </Form.Item>

          <Form.Item name="weight" label="体重（kg）">
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="请输入体重" />
          </Form.Item>

          <Form.Item name="color" label="毛色">
            <Input placeholder="请输入毛色" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingPet ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PetList;
