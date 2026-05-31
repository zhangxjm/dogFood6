import type { Member, MonthlyStat } from '@/types';

export const CURRENT_MEMBER: Member = {
  id: 1,
  name: '张明华',
  phone: '138****6688',
  level: 'gold',
  balance: 3280.00,
  totalSpent: 12680.00,
  visitCount: 36,
  avatar: 'https://picsum.photos/id/64/200/200'
};

export const MONTHLY_STATS: MonthlyStat[] = [
  { month: '2025-12', amount: 1280, count: 5 },
  { month: '2026-01', amount: 960, count: 3 },
  { month: '2026-02', amount: 1560, count: 6 },
  { month: '2026-03', amount: 880, count: 3 },
  { month: '2026-04', amount: 2100, count: 8 },
  { month: '2026-05', amount: 1420, count: 5 }
];
