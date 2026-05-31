const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('fishing_gear', 'admin', 'admin123456', {
  host: 'localhost',
  port: 3307,
  dialect: 'mysql',
  timezone: '+08:00',
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
});

module.exports = sequelize;
