const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const FishingGear = require('./FishingGear');

const StatusLog = sequelize.define('StatusLog', {
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
  fromStatus: {
    type: DataTypes.STRING(20),
    comment: '变更前状态'
  },
  toStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '变更后状态'
  },
  remark: {
    type: DataTypes.STRING(500),
    defaultValue: '',
    comment: '状态变更说明'
  },
  operator: {
    type: DataTypes.STRING(50),
    defaultValue: '系统',
    comment: '操作人'
  }
}, {
  tableName: 'status_logs',
  comment: '寄售状态变更日志表'
});

StatusLog.belongsTo(FishingGear, { foreignKey: 'gearId', as: 'gear' });

module.exports = StatusLog;
