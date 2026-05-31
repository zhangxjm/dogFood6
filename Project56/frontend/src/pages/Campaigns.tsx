import { createSignal, onMount } from 'solid-js';
import { Gift, Users, Share2, Ticket } from 'lucide-solid';
import { apiFetch } from '../api/client';

interface Campaign { id: number; title: string; description: string; image: string; discount: string; }
interface Coupon { id: number; name: string; discount: string; min_spend: number; claimed: boolean; }
interface GroupBuy { id: number; product_name: string; original_price: number; group_price: number; current_members: number; target_members: number; image: string; }

const fallbackCampaigns: Campaign[] = [
  { id: 1, title: '端午非遗手作节', description: '精选传统手工艺品限时折扣', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dragon+boat+festival+craft+fair+Chinese&image_size=landscape_16_9', discount: '7折' },
  { id: 2, title: '非遗传承日', description: '大师作品首发专场', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+master+craftsman+heritage+day&image_size=landscape_16_9', discount: '8折' },
  { id: 3, title: '新品尝鲜', description: '新品上线限时特惠', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+new+product+launch+creative&image_size=landscape_16_9', discount: '9折' },
];
const fallbackCoupons: Coupon[] = [
  { id: 1, name: '新人专享券', discount: '满100减20', min_spend: 100, claimed: false },
  { id: 2, name: '会员日优惠券', discount: '满200减50', min_spend: 200, claimed: false },
  { id: 3, name: '非遗日特惠', discount: '满300减80', min_spend: 300, claimed: true },
];
const fallbackGroupBuys: GroupBuy[] = [
  { id: 1, product_name: '苏绣团扇三人团', original_price: 298, group_price: 199, current_members: 2, target_members: 3, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+embroidery+fan+group+buy&image_size=square' },
  { id: 2, product_name: '青花瓷五人团', original_price: 168, group_price: 99, current_members: 3, target_members: 5, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+porcelain+group+buy&image_size=square' },
];

export default function Campaigns() {
  const [campaigns, setCampaigns] = createSignal<Campaign[]>(fallbackCampaigns);
  const [coupons, setCoupons] = createSignal<Coupon[]>(fallbackCoupons);
  const [groupBuys, setGroupBuys] = createSignal<GroupBuy[]>(fallbackGroupBuys);
  const [shareOpen, setShareOpen] = createSignal(false);

  onMount(async () => {
    try {
      const camp = await apiFetch<any[]>('/campaigns/campaigns/');
      setCampaigns(camp);
    } catch {}
    try {
      const gb = await apiFetch<any[]>('/campaigns/group-buys/');
      setGroupBuys(gb);
    } catch {}
  });

  const handleClaimCoupon = async (id: number) => {
    try {
      await apiFetch(`/campaigns/coupons/${id}/claim/`, { method: 'POST' });
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, claimed: true } : c));
    } catch { alert('Claim failed'); }
  };
  const handleJoinGroupBuy = async (id: number) => {
    try {
      await apiFetch(`/campaigns/group-buys/${id}/join/`, { method: 'POST' });
      alert('Join success');
    } catch { alert('Join failed'); }
  };
  const handleShare = () => { setShareOpen(true); setTimeout(() => setShareOpen(false), 3000); };

  return (
    <div>
      <section class="mb-8">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><Gift size={20} style={{ color: 'var(--color-primary)' }} /> {'进行中的活动'}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaigns().map(c => (
            <div class="rounded-xl overflow-hidden transition-shadow hover:shadow-lg" style={{ background: 'var(--color-card)' }}>
              <img src={c.image} alt={c.title} class="w-full h-40 object-cover" />
              <div class="p-4">
                <div class="flex items-center justify-between mb-2"><h3 class="font-bold">{c.title}</h3><span class="text-sm font-bold px-2 py-0.5 rounded" style={{ background: 'var(--color-primary)', color: 'white' }}>{c.discount}</span></div>
                <p class="text-sm" style={{ color: 'var(--color-text-light)' }}>{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section class="mb-8">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><Ticket size={20} style={{ color: 'var(--color-accent)' }} /> {'优惠券领取'}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons().map(c => (
            <div class="rounded-xl p-5 flex items-center justify-between" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <div><p class="font-bold">{c.name}</p><p class="text-sm" style={{ color: 'var(--color-primary)' }}>{c.discount}</p></div>
              <button disabled={c.claimed} onClick={() => handleClaimCoupon(c.id)} class="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all" style={{ background: c.claimed ? 'var(--color-text-light)' : 'var(--color-primary)', cursor: c.claimed ? 'default' : 'pointer' }}>{c.claimed ? '已领取' : '领取'}</button>
            </div>
          ))}
        </div>
      </section>
      <section class="mb-8">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><Users size={20} style={{ color: 'var(--color-secondary)' }} /> {'拼团活动'}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupBuys().map(g => (
            <div class="rounded-xl flex overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <img src={g.image} alt={g.product_name} class="w-32 h-32 object-cover" />
              <div class="p-4 flex-1">
                <h3 class="font-bold mb-1">{g.product_name}</h3>
                <div class="flex items-center gap-2 mb-2"><span class="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>{'¥'}{g.group_price}</span><span class="text-sm line-through" style={{ color: 'var(--color-text-light)' }}>{'¥'}{g.original_price}</span></div>
                <div class="mb-2"><div class="h-2 rounded-full" style={{ background: 'var(--color-bg)' }}><div class="h-full rounded-full" style={{ width: (g.current_members / g.target_members * 100) + '%', background: 'var(--color-primary)' }} /></div><p class="text-xs mt-1" style={{ color: 'var(--color-text-light)' }}>{'已有'}{g.current_members}/{g.target_members}{'人参团'}</p></div>
                <button onClick={() => handleJoinGroupBuy(g.id)} class="px-4 py-1.5 rounded-lg text-sm text-white" style={{ background: 'var(--color-primary)' }}>{'参与拼团'}</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><Share2 size={20} style={{ color: 'var(--color-accent)' }} /> {'裂变分享'}</h2>
        <div class="rounded-xl p-6 text-center" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <p class="mb-4">{'分享给好友，双方均可获得50积分奖励'}</p>
          <button onClick={handleShare} class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90" style={{ background: 'var(--color-accent)' }}><Share2 size={18} /> {'分享给好友'}</button>
          {shareOpen() && <p class="mt-3 text-sm" style={{ color: 'var(--color-primary)' }}>{'分享链接已复制到剪贴板！'}</p>}
        </div>
      </section>
    </div>
  );
}
