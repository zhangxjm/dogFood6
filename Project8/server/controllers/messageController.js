const Message = require('../models/Message');
const User = require('../models/User');
const FishingGear = require('../models/FishingGear');
const { Op, fn, col, literal } = require('sequelize');

exports.getConversations = async (ctx) => {
  const { userId } = ctx.params;

  const messages = await Message.findAll({
    where: {
      [Op.or]: [{ senderId: userId }, { receiverId: userId }]
    },
    include: [
      { model: User, as: 'sender', attributes: ['id', 'username'] },
      { model: User, as: 'receiver', attributes: ['id', 'username'] },
      { model: FishingGear, as: 'gear', attributes: ['id', 'title'] }
    ],
    order: [['createdAt', 'DESC']]
  });

  const conversationMap = new Map();
  messages.forEach(msg => {
    const otherId = msg.senderId == userId ? msg.receiverId : msg.senderId;
    const key = `${msg.gearId}_${otherId}`;
    
    if (!conversationMap.has(key)) {
      conversationMap.set(key, {
        gearId: msg.gearId,
        gearTitle: msg.gear?.title,
        otherUserId: otherId,
        otherUserName: msg.senderId == userId ? msg.receiver?.username : msg.sender?.username,
        lastMessage: msg.content,
        lastMessageTime: msg.createdAt,
        unreadCount: 0
      });
    }
    
    if (msg.receiverId == userId && !msg.isRead) {
      conversationMap.get(key).unreadCount++;
    }
  });

  ctx.body = {
    success: true,
    data: Array.from(conversationMap.values())
  };
};

exports.getMessages = async (ctx) => {
  const { userId, otherUserId, gearId } = ctx.params;
  const { page = 1, pageSize = 50 } = ctx.query;

  const { count, rows } = await Message.findAndCountAll({
    where: {
      gearId,
      [Op.or]: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    },
    include: [
      { model: User, as: 'sender', attributes: ['id', 'username'] }
    ],
    order: [['createdAt', 'ASC']],
    offset: (page - 1) * pageSize,
    limit: parseInt(pageSize)
  });

  await Message.update(
    { isRead: true },
    {
      where: {
        gearId,
        senderId: otherUserId,
        receiverId: userId,
        isRead: false
      }
    }
  );

  ctx.body = {
    success: true,
    data: {
      list: rows,
      total: count
    }
  };
};

exports.sendMessage = async (ctx) => {
  const { gearId, senderId, receiverId, content } = ctx.request.body;

  if (!gearId || !senderId || !receiverId || !content) {
    ctx.status = 400;
    ctx.body = { success: false, message: '缺少必要参数' };
    return;
  }

  const message = await Message.create({
    gearId,
    senderId,
    receiverId,
    content,
    isRead: false
  });

  const msgWithSender = await Message.findByPk(message.id, {
    include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }]
  });

  ctx.body = {
    success: true,
    data: msgWithSender
  };
};

exports.getUnreadCount = async (ctx) => {
  const { userId } = ctx.params;

  const count = await Message.count({
    where: {
      receiverId: userId,
      isRead: false
    }
  });

  ctx.body = {
    success: true,
    data: { count }
  };
};
