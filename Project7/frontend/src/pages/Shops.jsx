import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { shopsAPI } from '../api/index.js';

const { Title } = Typography;

function Shops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    setLoading(true);
    try {
      const data = await shopsAPI.getShops();
      setShops(data);
    } catch (error) {
      message.error('加载商铺列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingShop(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (shop) => {
    setEditingShop(shop);
    form.setFieldsValue(shop);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await shopsAPI.deleteShop(id);
      message.success('删除成功');
      loadShops();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingShop) {
        await shopsAPI.updateShop(editingShop.id, values);
        message.success('更新成功');
      } else {
        await shopsAPI.createShop(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadShops();
    } catch (error) {
      message.error(editingShop ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '商铺编号',
      dataIndex: 'shop_number',
      key: 'shop_number',
    },
    {
      title: '商铺名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '业主姓名',
      dataIndex: 'owner_name',
      key: 'owner_name',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '面积(㎡)',
      dataIndex: 'area',
      key: 'area',
    },
    {
      title: '电费单价(元/度)',
      dataIndex: 'electric_rate',
      key: 'electric_rate',
    },
    {
      title: '水费单价(元/吨)',
      dataIndex: 'water_rate',
      key: 'water_rate',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (active ? '营业中' : '已停业'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该商铺吗？"
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>商铺管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增商铺
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={shops}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingShop ? '编辑商铺' : '新增商铺'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="shop_number"
            label="商铺编号"
            rules={[{ required: true, message: '请输入商铺编号' }]}
          >
            <Input placeholder="请输入商铺编号" />
          </Form.Item>
          <Form.Item
            name="name"
            label="商铺名称"
            rules={[{ required: true, message: '请输入商铺名称' }]}
          >
            <Input placeholder="请输入商铺名称" />
          </Form.Item>
          <Form.Item name="owner_name" label="业主姓名">
            <Input placeholder="请输入业主姓名" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="area" label="面积(平方米)">
            <InputNumber style={{ width: '100%' }} placeholder="请输入面积" />
          </Form.Item>
          <Form.Item
            name="electric_rate"
            label="电费单价(元/度)"
            initialValue={1.2}
          >
            <InputNumber style={{ width: '100%' }} step={0.1} />
          </Form.Item>
          <Form.Item
            name="water_rate"
            label="水费单价(元/吨)"
            initialValue={4.5}
          >
            <InputNumber style={{ width: '100%' }} step={0.1} />
          </Form.Item>
          <Form.Item
            name="is_active"
            label="营业状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="营业中" unCheckedChildren="已停业" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingShop ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Shops;
