const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const FishingGear = require('./FishingGear');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  gearId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: FishingGear,
      key: 'id'
    },
    comment: '渔具ID'
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    comment: '发送者ID'
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    comment: '接收者ID'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '消息内容'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否已读'
  }
}, {
  tableName: 'messages',
  comment: '意向沟通消息表'
});

Message.belongsTo(FishingGear, { foreignKey: 'gearId', as: 'gear' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

module.exports = Message;
