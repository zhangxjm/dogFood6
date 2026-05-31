const sequelize = require('./config/database');
const User = require('./models/User');
const FishingGear = require('./models/FishingGear');
const Message = require('./models/Message');
const StatusLog = require('./models/StatusLog');

async function initData() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ force: true });
    console.log('Database tables created.');

    const users = await User.bulkCreate([
      { username: '钓鱼达人', phone: '13800138001', avatar: '' },
      { username: '渔翁小李', phone: '13800138002', avatar: '' },
      { username: '垂钓爱好者', phone: '13800138003', avatar: '' },
      { username: '钓遍天下', phone: '13800138004', avatar: '' }
    ]);
    console.log('Users created:', users.length);

    const gears = await FishingGear.bulkCreate([
      {
        title: '达亿瓦新款路亚竿9成新',
        description: '达亿瓦2023款路亚竿，使用不到半年，因为升级装备转手。竿身完好，导环无损伤，手感极佳，适合淡水路亚。',
        category: '鱼竿',
        brand: '达亿瓦',
        price: 850.00,
        originalPrice: 1500.00,
        condition: '九成新',
        images: 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400',
        status: 'consigning',
        location: '北京市朝阳区',
        viewCount: 128,
        ownerId: 1
      },
      {
        title: '禧玛诺纺车轮2500型',
        description: '禧玛诺纳西2500型纺车轮，顺滑无卡顿，买回来只用过3次，几乎全新。适合新手入门，性价比超高。',
        category: '鱼线轮',
        brand: '禧玛诺',
        price: 320.00,
        originalPrice: 450.00,
        condition: '九成新',
        images: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=400',
        status: 'consigning',
        location: '上海市浦东新区',
        viewCount: 86,
        ownerId: 2
      },
      {
        title: '全套浮漂套装转让',
        description: '各种型号浮漂共20支，包括鲫鱼漂、鲤鱼漂、行程漂等，适合各种水情。其中5支全新未拆封，其余也很少使用。',
        category: '配件',
        brand: '民间艺人',
        price: 180.00,
        originalPrice: 350.00,
        condition: '八成新',
        images: 'https://images.unsplash.com/photo-1551913902-c92207136625?w=400',
        status: 'consigning',
        location: '广州市天河区',
        viewCount: 52,
        ownerId: 1
      },
      {
        title: '光威碳素手竿5.4米',
        description: '光威竹山三代，5.4米碳素手竿，经典款，皮实耐用。使用了一年多，保养良好，竿节无损伤。',
        category: '鱼竿',
        brand: '光威',
        price: 200.00,
        originalPrice: 380.00,
        condition: '八成新',
        images: 'https://images.unsplash.com/photo-1563192363-3407fc913e68?w=400',
        status: 'sold',
        location: '深圳市南山区',
        viewCount: 215,
        ownerId: 3
      },
      {
        title: '化氏鱼饵大礼包',
        description: '化氏饵料大套装，包括螺鲤、蓝鲫、九一八等经典饵料，还有小药添加剂。部分未开封，保质期到明年。',
        category: '鱼饵',
        brand: '化氏',
        price: 99.00,
        originalPrice: 180.00,
        condition: '全新',
        images: 'https://images.unsplash.com/photo-1580336591228-0ea8f8b71726?w=400',
        status: 'consigning',
        location: '杭州市西湖区',
        viewCount: 38,
        ownerId: 4
      },
      {
        title: '钓鱼装备收纳箱',
        description: '大号多功能钓鱼收纳箱，可以装下所有配件，带隔层设计，防水耐磨。用过几次，九成新。',
        category: '配件',
        brand: '连球',
        price: 150.00,
        originalPrice: 280.00,
        condition: '九成新',
        images: 'https://images.unsplash.com/photo-1587467512961-120760940315?w=400',
        status: 'cancelled',
        location: '成都市武侯区',
        viewCount: 45,
        ownerId: 2
      }
    ]);
    console.log('Fishing gears created:', gears.length);

    await StatusLog.bulkCreate([
      { gearId: 1, fromStatus: null, toStatus: 'consigning', remark: '发布成功，自动进入寄售状态', operator: '系统' },
      { gearId: 2, fromStatus: null, toStatus: 'consigning', remark: '发布成功，自动进入寄售状态', operator: '系统' },
      { gearId: 3, fromStatus: null, toStatus: 'consigning', remark: '发布成功，自动进入寄售状态', operator: '系统' },
      { gearId: 4, fromStatus: null, toStatus: 'consigning', remark: '发布成功，自动进入寄售状态', operator: '系统' },
      { gearId: 4, fromStatus: 'consigning', toStatus: 'sold', remark: '已完成交易，买家确认收货', operator: '用户' },
      { gearId: 5, fromStatus: null, toStatus: 'consigning', remark: '发布成功，自动进入寄售状态', operator: '系统' },
      { gearId: 6, fromStatus: null, toStatus: 'consigning', remark: '发布成功，自动进入寄售状态', operator: '系统' },
      { gearId: 6, fromStatus: 'consigning', toStatus: 'cancelled', remark: '卖家取消寄售', operator: '用户' }
    ]);
    console.log('Status logs created.');

    await Message.bulkCreate([
      { gearId: 1, senderId: 2, receiverId: 1, content: '你好，这根竿子还能再便宜点吗？', isRead: true },
      { gearId: 1, senderId: 1, receiverId: 2, content: '最低800，诚心要的话可以送一盘线', isRead: true },
      { gearId: 1, senderId: 2, receiverId: 1, content: '好的，那我要了，怎么交易？', isRead: false },
      { gearId: 2, senderId: 1, receiverId: 2, content: '这个轮子是深线杯还是浅线杯？', isRead: true },
      { gearId: 2, senderId: 2, receiverId: 1, content: '是浅线杯的，适合微物', isRead: false },
      { gearId: 4, senderId: 4, receiverId: 3, content: '请问这根竿子重量大概多少？', isRead: true },
      { gearId: 4, senderId: 3, receiverId: 4, content: '大概150克左右，手感很轻', isRead: true }
    ]);
    console.log('Messages created.');

    console.log('');
    console.log('========================================');
    console.log('  Data initialization completed!');
    console.log('========================================');
    console.log('');
    console.log('Test accounts:');
    users.forEach(u => {
      console.log(`  - ${u.username} (phone: ${u.phone})`);
    });
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Data initialization failed:', error);
    process.exit(1);
  }
}

initData();
