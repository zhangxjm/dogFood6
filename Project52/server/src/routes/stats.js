const express = require('express');
const dayjs = require('dayjs');
const { getAsync, allAsync } = require('../db/init');

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const experimentCounts = await allAsync('SELECT status, COUNT(*) as count FROM experiments GROUP BY status');

    const statusMap = {
      draft: '草稿',
      prepared: '已准备',
      running: '进行中',
      collecting: '采集中',
      analyzing: '分析中',
      completed: '已完成',
      abnormal: '异常'
    };

    const experimentStats = experimentCounts.map(item => ({
      status: item.status,
      label: statusMap[item.status] || item.status,
      count: item.count
    }));

    const deviceCounts = await allAsync('SELECT status, COUNT(*) as count FROM devices GROUP BY status');

    const deviceStatusMap = {
      idle: '空闲',
      running: '运行中',
      maintenance: '维护中',
      offline: '离线'
    };

    const deviceStats = deviceCounts.map(item => ({
      status: item.status,
      label: deviceStatusMap[item.status] || item.status,
      count: item.count
    }));

    const recentActivities = await allAsync(`
      SELECT 'experiment' as type, id, name, status, updated_at as time FROM experiments
      UNION ALL
      SELECT 'data' as type, id, file_name as name, collection_status as status, created_at as time FROM experiment_data
      ORDER BY time DESC LIMIT 10
    `);

    const typeLabelMap = {
      experiment: '试验',
      data: '数据'
    };

    const activities = recentActivities.map(a => ({
      type: a.type,
      type_label: typeLabelMap[a.type] || a.type,
      id: a.id,
      name: a.name,
      status: a.status,
      time: a.time
    }));

    const totalExperiments = await getAsync('SELECT COUNT(*) as count FROM experiments');
    const totalDevices = await getAsync('SELECT COUNT(*) as count FROM devices');
    const totalDataPoints = await getAsync('SELECT COALESCE(SUM(data_points), 0) as count FROM experiment_data');
    const totalReports = await getAsync('SELECT COUNT(*) as count FROM reports');

    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const nextDate = dayjs(date).add(1, 'day').format('YYYY-MM-DD');
      const dataPointsRow = await getAsync(`
        SELECT COALESCE(SUM(data_points), 0) as count FROM experiment_data
        WHERE created_at >= ? AND created_at < ?
      `, [date, nextDate]);
      const fileCountRow = await getAsync(`
        SELECT COUNT(*) as count FROM experiment_data
        WHERE created_at >= ? AND created_at < ?
      `, [date, nextDate]);
      trend.push({ date, data_points: dataPointsRow.count, file_count: fileCountRow.count });
    }

    res.json({
      code: 0,
      message: '获取仪表盘统计数据成功',
      data: {
        summary: {
          totalExperiments: totalExperiments.count,
          totalDevices: totalDevices.count,
          totalDataPoints: totalDataPoints.count,
          totalReports: totalReports.count
        },
        experimentStats,
        deviceStats,
        recentActivities: activities,
        dataTrend: trend
      }
    });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.get('/trend', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const trend = [];

    for (let i = Number(days) - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const nextDate = dayjs(date).add(1, 'day').format('YYYY-MM-DD');

      const dataPointsRow = await getAsync(`
        SELECT COALESCE(SUM(data_points), 0) as count FROM experiment_data
        WHERE created_at >= ? AND created_at < ?
      `, [date, nextDate]);

      const fileCountRow = await getAsync(`
        SELECT COUNT(*) as count FROM experiment_data
        WHERE created_at >= ? AND created_at < ?
      `, [date, nextDate]);

      const experimentCountRow = await getAsync(`
        SELECT COUNT(*) as count FROM experiments
        WHERE created_at >= ? AND created_at < ?
      `, [date, nextDate]);

      trend.push({
        date,
        data_points: dataPointsRow.count,
        file_count: fileCountRow.count,
        experiment_count: experimentCountRow.count
      });
    }

    res.json({
      code: 0,
      message: '获取数据趋势成功',
      data: { trend, days: Number(days) }
    });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

module.exports = router;
