const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const FishingGear = sequelize.define('FishingGear', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '标题'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '详细描述'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '分类：鱼竿、鱼线轮、鱼饵、配件、其他'
  },
  brand: {
    type: DataTypes.STRING(100),
    defaultValue: '',
    comment: '品牌'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '寄售价格'
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '原价'
  },
  condition: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '成色：全新、九成新、八成新、七成新、六成新及以下'
  },
  images: {
    type: DataTypes.TEXT,
    comment: '图片URL，多个用逗号分隔'
  },
  status: {
    type: DataTypes.ENUM('pending', 'consigning', 'sold', 'cancelled'),
    defaultValue: 'pending',
    comment: '状态：待审核、寄售中、已售出、已取消'
  },
  location: {
    type: DataTypes.STRING(200),
    defaultValue: '',
    comment: '所在地区'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '浏览次数'
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    comment: '发布者ID'
  }
}, {
  tableName: 'fishing_gears',
  comment: '渔具寄售表'
});

FishingGear.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
User.hasMany(FishingGear, { foreignKey: 'ownerId' });

module.exports = FishingGear;
