import { getDatabase, queryAll, queryOne, runSql } from './database';

const SERVICES_DATA = [
  { name: '经典足浴', category: '足浴按摩', description: '传统足浴养生，温水浸泡配合足底穴位按摩，有效缓解疲劳，促进血液循环，改善睡眠质量。适合久站久坐人群。', price: 128, duration: 60, image: 'https://picsum.photos/id/598/300/300', status: 'active' },
  { name: '深度足底按摩', category: '足浴按摩', description: '专业技师深度按摩足底反射区，精准刺激穴位，疏通经络，调理脏腑功能，达到养生保健效果。', price: 198, duration: 90, image: 'https://picsum.photos/id/582/300/300', status: 'active' },
  { name: '中药足浴', category: '足浴按摩', description: '精选多味名贵中草药煎煮浸泡，药力渗透穴位，温经散寒，活血化瘀，祛湿除痹。', price: 168, duration: 75, image: 'https://picsum.photos/id/230/300/300', status: 'active' },
  { name: '全身精油SPA', category: '养生SPA', description: '采用进口天然植物精油，专业SPA手法全身舒缓按摩，放松身心，滋润肌肤，提升睡眠品质。', price: 388, duration: 120, image: 'https://picsum.photos/id/225/300/300', status: 'active' },
  { name: '肩颈舒缓SPA', category: '养生SPA', description: '针对肩颈僵硬酸痛，运用精油热敷与深层揉捏手法，缓解颈椎压力，放松肩颈肌肉群。', price: 228, duration: 60, image: 'https://picsum.photos/id/1015/300/300', status: 'active' },
  { name: '玫瑰花香SPA', category: '养生SPA', description: '精选大马士革玫瑰精油，芳香疗法配合轻柔按摩，舒缓压力，美白润肤，身心双重呵护。', price: 298, duration: 90, image: 'https://picsum.photos/id/1018/300/300', status: 'active' },
  { name: '经络推拿', category: '经络理疗', description: '传统中医经络推拿，沿经络走向施术，疏通气血，调理阴阳平衡，改善亚健康状态。', price: 188, duration: 60, image: 'https://picsum.photos/id/1036/300/300', status: 'active' },
  { name: '拔罐理疗', category: '经络理疗', description: '传统拔罐疗法，负压吸附穴位，行气活血，祛风散寒，消肿止痛，有效改善肩背酸痛。', price: 128, duration: 45, image: 'https://picsum.photos/id/1039/300/300', status: 'active' },
  { name: '刮痧理疗', category: '经络理疗', description: '专业刮痧手法，疏通腠理，驱邪外出，活血化瘀，改善肌肉酸痛和疲劳感。', price: 128, duration: 45, image: 'https://picsum.photos/id/1044/300/300', status: 'active' },
  { name: '温灸养生', category: '艾灸养生', description: '精选陈年艾绒，温和灸疗关元、气海等要穴，温补元气，扶正祛邪，增强免疫力。', price: 168, duration: 60, image: 'https://picsum.photos/id/570/300/300', status: 'active' },
  { name: '脐灸调理', category: '艾灸养生', description: '神阙穴（肚脐）隔药灸疗，药力直达脏腑，健脾和胃，温中散寒，调理消化系统。', price: 148, duration: 45, image: 'https://picsum.photos/id/431/300/300', status: 'active' },
  { name: '全身艾灸', category: '艾灸养生', description: '全身多穴位同步艾灸，温通全身经络，大补元气，改善体寒怕冷，增强体质。', price: 268, duration: 90, image: 'https://picsum.photos/id/312/300/300', status: 'active' },
];

const MEMBER_DATA = {
  name: '张明华',
  phone: '13800006688',
  level: 'gold',
  balance: 3280.00,
  total_spent: 12680.00,
  visit_count: 36,
  avatar: 'https://picsum.photos/id/64/200/200',
};

const APPOINTMENTS_DATA = [
  { member_name: '张明华', service_name: '经典足浴', service_price: 128, appointment_time: '2026-05-30 10:00', status: 'completed', duration: 65, amount: 128, note: '' },
  { member_name: '张明华', service_name: '全身精油SPA', service_price: 388, appointment_time: '2026-05-30 14:00', status: 'in_progress', duration: 0, amount: 388, note: '请安排女技师' },
  { member_name: '张明华', service_name: '经络推拿', service_price: 188, appointment_time: '2026-05-31 10:00', status: 'confirmed', duration: 0, amount: 188, note: '' },
  { member_name: '张明华', service_name: '肩颈舒缓SPA', service_price: 228, appointment_time: '2026-06-01 15:00', status: 'pending', duration: 0, amount: 228, note: '颈椎不舒服，重点肩颈' },
  { member_name: '张明华', service_name: '温灸养生', service_price: 168, appointment_time: '2026-05-28 11:00', status: 'completed', duration: 62, amount: 168, note: '' },
  { member_name: '张明华', service_name: '中药足浴', service_price: 168, appointment_time: '2026-05-27 16:00', status: 'cancelled', duration: 0, amount: 168, note: '临时有事' },
  { member_name: '张明华', service_name: '深度足底按摩', service_price: 198, appointment_time: '2026-05-25 14:00', status: 'completed', duration: 92, amount: 198, note: '' },
  { member_name: '张明华', service_name: '玫瑰花香SPA', service_price: 298, appointment_time: '2026-05-22 10:00', status: 'completed', duration: 88, amount: 298, note: '' },
];

const MONTHLY_STATS_DATA = [
  { month: '2025-12', amount: 1280, count: 5 },
  { month: '2026-01', amount: 960, count: 3 },
  { month: '2026-02', amount: 1560, count: 6 },
  { month: '2026-03', amount: 880, count: 3 },
  { month: '2026-04', amount: 2100, count: 8 },
  { month: '2026-05', amount: 1420, count: 5 },
];

export async function seedDatabase() {
  await getDatabase();

  const serviceCount = queryAll('SELECT COUNT(*) as count FROM services');
  if ((serviceCount[0] as any).count > 0) {
    console.log('[Seed] Data already exists, skipping seed');
    return;
  }

  console.log('[Seed] Seeding initial data...');

  for (const s of SERVICES_DATA) {
    runSql(
      'INSERT INTO services (name, category, description, price, duration, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [s.name, s.category, s.description, s.price, s.duration, s.image, s.status]
    );
  }

  runSql(
    'INSERT INTO members (name, phone, level, balance, total_spent, visit_count, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [MEMBER_DATA.name, MEMBER_DATA.phone, MEMBER_DATA.level, MEMBER_DATA.balance, MEMBER_DATA.total_spent, MEMBER_DATA.visit_count, MEMBER_DATA.avatar]
  );

  const memberId = 1;
  for (let i = 0; i < APPOINTMENTS_DATA.length; i++) {
    const a = APPOINTMENTS_DATA[i];
    const serviceId = i + 1;
    runSql(
      'INSERT INTO appointments (member_id, member_name, service_id, service_name, service_price, appointment_time, status, duration, amount, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [memberId, a.member_name, serviceId, a.service_name, a.service_price, a.appointment_time, a.status, a.duration, a.amount, a.note]
    );
  }

  for (const m of MONTHLY_STATS_DATA) {
    runSql(
      'INSERT INTO monthly_stats (month, amount, count) VALUES (?, ?, ?)',
      [m.month, m.amount, m.count]
    );
  }

  const completedAppointments = APPOINTMENTS_DATA.filter(a => a.status === 'completed');
  for (let i = 0; i < completedAppointments.length; i++) {
    const a = completedAppointments[i];
    runSql(
      'INSERT INTO consumption_records (member_id, appointment_id, amount, payment_method) VALUES (?, ?, ?, ?)',
      [memberId, i + 1, a.amount, 'balance']
    );
  }

  console.log('[Seed] Initial data seeded successfully');
}
