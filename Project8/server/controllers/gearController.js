const FishingGear = require('../models/FishingGear');
const User = require('../models/User');
const StatusLog = require('../models/StatusLog');
const { Op } = require('sequelize');

const statusMap = {
  pending: '待审核',
  consigning: '寄售中',
  sold: '已售出',
  cancelled: '已取消'
};

exports.getList = async (ctx) => {
  const { page = 1, pageSize = 10, category, status, keyword } = ctx.query;
  const where = {};
  
  if (category) where.category = category;
  if (status) where.status = status;
  if (keyword) {
    where[Op.or] = [
      { title: { [Op.like]: `%${keyword}%` } },
      { description: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const { count, rows } = await FishingGear.findAndCountAll({
    where,
    include: [{ model: User, as: 'owner', attributes: ['id', 'username', 'phone'] }],
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: parseInt(pageSize)
  });

  ctx.body = {
    success: true,
    data: {
      list: rows.map(item => ({
        ...item.toJSON(),
        statusText: statusMap[item.status]
      })),
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  };
};

exports.getDetail = async (ctx) => {
  const { id } = ctx.params;
  const gear = await FishingGear.findByPk(id, {
    include: [
      { model: User, as: 'owner', attributes: ['id', 'username', 'phone'] }
    ]
  });

  if (!gear) {
    ctx.status = 404;
    ctx.body = { success: false, message: '渔具信息不存在' };
    return;
  }

  await gear.increment('viewCount');

  const statusLogs = await StatusLog.findAll({
    where: { gearId: id },
    order: [['createdAt', 'DESC']]
  });

  ctx.body = {
    success: true,
    data: {
      ...gear.toJSON(),
      statusText: statusMap[gear.status],
      statusLogs: statusLogs.map(log => ({
        ...log.toJSON(),
        fromStatusText: log.fromStatus ? statusMap[log.fromStatus] : '',
        toStatusText: statusMap[log.toStatus]
      }))
    }
  };
};

exports.create = async (ctx) => {
  const { title, description, category, brand, price, originalPrice, condition, images, location, ownerId } = ctx.request.body;

  if (!title || !description || !category || !price || !condition || !ownerId) {
    ctx.status = 400;
    ctx.body = { success: false, message: '缺少必要参数' };
    return;
  }

  const gear = await FishingGear.create({
    title,
    description,
    category,
    brand: brand || '',
    price,
    originalPrice: originalPrice || null,
    condition,
    images: images || '',
    location: location || '',
    ownerId,
    status: 'consigning'
  });

  await StatusLog.create({
    gearId: gear.id,
    fromStatus: null,
    toStatus: 'consigning',
    remark: '发布成功，自动进入寄售状态',
    operator: '系统'
  });

  ctx.body = {
    success: true,
    data: gear
  };
};

exports.updateStatus = async (ctx) => {
  const { id } = ctx.params;
  const { status, remark } = ctx.request.body;

  const gear = await FishingGear.findByPk(id);
  if (!gear) {
    ctx.status = 404;
    ctx.body = { success: false, message: '渔具信息不存在' };
    return;
  }

  const oldStatus = gear.status;
  gear.status = status;
  await gear.save();

  await StatusLog.create({
    gearId: id,
    fromStatus: oldStatus,
    toStatus: status,
    remark: remark || '状态变更',
    operator: '用户'
  });

  ctx.body = {
    success: true,
    data: gear
  };
};

exports.getMyGears = async (ctx) => {
  const { userId } = ctx.params;
  const { page = 1, pageSize = 10 } = ctx.query;

  const { count, rows } = await FishingGear.findAndCountAll({
    where: { ownerId: userId },
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: parseInt(pageSize)
  });

  ctx.body = {
    success: true,
    data: {
      list: rows.map(item => ({
        ...item.toJSON(),
        statusText: statusMap[item.status]
      })),
      total: count
    }
  };
};
