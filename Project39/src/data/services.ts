import type { SpaService, CategoryItem } from '@/types';

export const CATEGORIES: CategoryItem[] = [
  { key: 'all', label: '全部' },
  { key: '足浴按摩', label: '足浴按摩' },
  { key: '养生SPA', label: '养生SPA' },
  { key: '经络理疗', label: '经络理疗' },
  { key: '艾灸养生', label: '艾灸养生' }
];

export const SERVICES: SpaService[] = [
  {
    id: 1,
    name: '经典足浴',
    category: '足浴按摩',
    description: '传统足浴养生，温水浸泡配合足底穴位按摩，有效缓解疲劳，促进血液循环，改善睡眠质量。适合久站久坐人群。',
    price: 128,
    duration: 60,
    image: 'https://picsum.photos/id/598/300/300',
    status: 'active'
  },
  {
    id: 2,
    name: '深度足底按摩',
    category: '足浴按摩',
    description: '专业技师深度按摩足底反射区，精准刺激穴位，疏通经络，调理脏腑功能，达到养生保健效果。',
    price: 198,
    duration: 90,
    image: 'https://picsum.photos/id/582/300/300',
    status: 'active'
  },
  {
    id: 3,
    name: '中药足浴',
    category: '足浴按摩',
    description: '精选多味名贵中草药煎煮浸泡，药力渗透穴位，温经散寒，活血化瘀，祛湿除痹。',
    price: 168,
    duration: 75,
    image: 'https://picsum.photos/id/230/300/300',
    status: 'active'
  },
  {
    id: 4,
    name: '全身精油SPA',
    category: '养生SPA',
    description: '采用进口天然植物精油，专业SPA手法全身舒缓按摩，放松身心，滋润肌肤，提升睡眠品质。',
    price: 388,
    duration: 120,
    image: 'https://picsum.photos/id/225/300/300',
    status: 'active'
  },
  {
    id: 5,
    name: '肩颈舒缓SPA',
    category: '养生SPA',
    description: '针对肩颈僵硬酸痛，运用精油热敷与深层揉捏手法，缓解颈椎压力，放松肩颈肌肉群。',
    price: 228,
    duration: 60,
    image: 'https://picsum.photos/id/1015/300/300',
    status: 'active'
  },
  {
    id: 6,
    name: '玫瑰花香SPA',
    category: '养生SPA',
    description: '精选大马士革玫瑰精油，芳香疗法配合轻柔按摩，舒缓压力，美白润肤，身心双重呵护。',
    price: 298,
    duration: 90,
    image: 'https://picsum.photos/id/1018/300/300',
    status: 'active'
  },
  {
    id: 7,
    name: '经络推拿',
    category: '经络理疗',
    description: '传统中医经络推拿，沿经络走向施术，疏通气血，调理阴阳平衡，改善亚健康状态。',
    price: 188,
    duration: 60,
    image: 'https://picsum.photos/id/1036/300/300',
    status: 'active'
  },
  {
    id: 8,
    name: '拔罐理疗',
    category: '经络理疗',
    description: '传统拔罐疗法，负压吸附穴位，行气活血，祛风散寒，消肿止痛，有效改善肩背酸痛。',
    price: 128,
    duration: 45,
    image: 'https://picsum.photos/id/1039/300/300',
    status: 'active'
  },
  {
    id: 9,
    name: '刮痧理疗',
    category: '经络理疗',
    description: '专业刮痧手法，疏通腠理，驱邪外出，活血化瘀，改善肌肉酸痛和疲劳感。',
    price: 128,
    duration: 45,
    image: 'https://picsum.photos/id/1044/300/300',
    status: 'active'
  },
  {
    id: 10,
    name: '温灸养生',
    category: '艾灸养生',
    description: '精选陈年艾绒，温和灸疗关元、气海等要穴，温补元气，扶正祛邪，增强免疫力。',
    price: 168,
    duration: 60,
    image: 'https://picsum.photos/id/570/300/300',
    status: 'active'
  },
  {
    id: 11,
    name: '脐灸调理',
    category: '艾灸养生',
    description: '神阙穴（肚脐）隔药灸疗，药力直达脏腑，健脾和胃，温中散寒，调理消化系统。',
    price: 148,
    duration: 45,
    image: 'https://picsum.photos/id/431/300/300',
    status: 'active'
  },
  {
    id: 12,
    name: '全身艾灸',
    category: '艾灸养生',
    description: '全身多穴位同步艾灸，温通全身经络，大补元气，改善体寒怕冷，增强体质。',
    price: 268,
    duration: 90,
    image: 'https://picsum.photos/id/312/300/300',
    status: 'active'
  }
];
