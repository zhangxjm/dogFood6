import { createSignal } from 'solid-js';
import { DollarSign, Users, ShoppingBag, TrendingUp, Plus, Edit, Trash2 } from 'lucide-solid';

interface AdminProduct { id: number; name: string; price: number; category: string; stock: number; }

const mockProducts: AdminProduct[] = [
  { id: 1, name: '\u82CF\u7EE3\u56E2\u6247', price: 298, category: '\u523A\u7EE3', stock: 50 },
  { id: 2, name: '\u9752\u82B1\u74F7\u676F', price: 168, category: '\u9676\u74F7', stock: 120 },
  { id: 3, name: '\u526A\u7EB8\u6302\u753B', price: 128, category: '\u526A\u7EB8', stock: 80 },
  { id: 4, name: '\u6F06\u5668\u9996\u9970\u76D2', price: 458, category: '\u6F06\u5668', stock: 30 },
];

export default function Admin() {
  const [products] = createSignal<AdminProduct[]>(mockProducts);

  return (
    <div>
      <h1 class="text-2xl font-bold mb-6">{'\u7BA1\u7406\u540E\u53F0'}</h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#FEE2E2' }}><DollarSign size={20} style={{ color: 'var(--color-primary)' }} /></div><div><p class="text-sm" style={{ color: 'var(--color-text-light)' }}>{'\u603B\u9500\u552E\u989D'}</p><p class="text-xl font-bold">{'\u00A5'}128,650</p></div></div>
        </div>
        <div class="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#DBEAFE' }}><Users size={20} style={{ color: 'var(--color-secondary)' }} /></div><div><p class="text-sm" style={{ color: 'var(--color-text-light)' }}>{'\u7528\u6237\u6570'}</p><p class="text-xl font-bold">2,458</p></div></div>
        </div>
        <div class="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#FEF3C7' }}><ShoppingBag size={20} style={{ color: 'var(--color-accent)' }} /></div><div><p class="text-sm" style={{ color: 'var(--color-text-light)' }}>{'\u8BA2\u5355\u6570'}</p><p class="text-xl font-bold">1,032</p></div></div>
        </div>
        <div class="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#D1FAE5' }}><TrendingUp size={20} style={{ color: '#059669' }} /></div><div><p class="text-sm" style={{ color: 'var(--color-text-light)' }}>{'\u8F6C\u5316\u7387'}</p><p class="text-xl font-bold">12.5%</p></div></div>
        </div>
      </div>

      <div class="rounded-xl p-5 mb-8" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-lg">{'\u5546\u54C1\u7BA1\u7406'}</h2>
          <button class="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white" style={{ background: 'var(--color-primary)' }}><Plus size={16} /> {'\u6DFB\u52A0\u5546\u54C1'}</button>
        </div>
        <table class="w-full text-sm">
          <thead><tr style={{ 'border-bottom': '1px solid var(--color-border)' }}><th class="text-left py-3 font-medium" style={{ color: 'var(--color-text-light)' }}>{'\u5546\u54C1\u540D\u79F0'}</th><th class="text-left py-3 font-medium" style={{ color: 'var(--color-text-light)' }}>{'\u5206\u7C7B'}</th><th class="text-left py-3 font-medium" style={{ color: 'var(--color-text-light)' }}>{'\u4EF7\u683C'}</th><th class="text-left py-3 font-medium" style={{ color: 'var(--color-text-light)' }}>{'\u5E93\u5B58'}</th><th class="text-right py-3 font-medium" style={{ color: 'var(--color-text-light)' }}>{'\u64CD\u4F5C'}</th></tr></thead>
          <tbody>{products().map(p => (
            <tr style={{ 'border-bottom': '1px solid var(--color-border)' }}>
              <td class="py-3">{p.name}</td><td class="py-3">{p.category}</td><td class="py-3">{'\u00A5'}{p.price}</td><td class="py-3">{p.stock}</td>
              <td class="py-3 text-right"><button class="p-1 mr-2" style={{ color: 'var(--color-secondary)' }}><Edit size={16} /></button><button class="p-1" style={{ color: 'var(--color-primary)' }}><Trash2 size={16} /></button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <h2 class="font-bold text-lg mb-4">{'\u4F1A\u5458\u5206\u6790'}</h2>
          <div class="space-y-3">
            <div class="flex justify-between items-center"><span>{'\u9752\u94DC\u4F1A\u5458'}</span><span class="font-bold">1,205</span></div>
            <div class="flex justify-between items-center"><span>{'\u767D\u94F6\u4F1A\u5458'}</span><span class="font-bold">856</span></div>
            <div class="flex justify-between items-center"><span>{'\u9EC4\u91D1\u4F1A\u5458'}</span><span class="font-bold">312</span></div>
            <div class="flex justify-between items-center"><span>{'\u94C2\u91D1\u4F1A\u5458'}</span><span class="font-bold">68</span></div>
            <div class="flex justify-between items-center"><span>{'\u94BB\u77F3\u4F1A\u5458'}</span><span class="font-bold">17</span></div>
          </div>
        </div>
        <div class="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <h2 class="font-bold text-lg mb-4">{'\u8BA2\u5355\u7BA1\u7406'}</h2>
          <div class="space-y-3">
            <div class="flex justify-between items-center"><span>{'\u5F85\u652F\u4ED8'}</span><span class="font-bold" style={{ color: '#D4A843' }}>23</span></div>
            <div class="flex justify-between items-center"><span>{'\u5236\u4F5C\u4E2D'}</span><span class="font-bold" style={{ color: '#7C3AED' }}>45</span></div>
            <div class="flex justify-between items-center"><span>{'\u5DF2\u53D1\u8D27'}</span><span class="font-bold" style={{ color: '#0891B2' }}>12</span></div>
            <div class="flex justify-between items-center"><span>{'\u5DF2\u5B8C\u6210'}</span><span class="font-bold" style={{ color: '#059669' }}>952</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
