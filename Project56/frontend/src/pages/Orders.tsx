import { createSignal, onMount } from 'solid-js';
import { apiFetch } from '../api/client';
import { Package } from 'lucide-solid';

interface OrderItem { product_name: string; quantity: number; price: number; }
interface Order { id: number; order_no: string; items: OrderItem[]; total: number; status: string; created_at: string; }

const statusLabels: Record<string, string> = { all: '\u5168\u90E8', pending: '\u5F85\u652F\u4ED8', paid: '\u5DF2\u652F\u4ED8', producing: '\u5236\u4F5C\u4E2D', shipped: '\u5DF2\u53D1\u8D27', completed: '\u5DF2\u5B8C\u6210' };
const statusColors: Record<string, string> = { pending: '#D4A843', paid: '#1A3A5C', producing: '#7C3AED', shipped: '#0891B2', completed: '#059669' };

const fallbackOrders: Order[] = [
  { id: 1, order_no: 'FH20260501001', items: [{ product_name: '\u82CF\u7EE3\u56E2\u6247', quantity: 1, price: 298 }], total: 298, status: 'completed', created_at: '2026-05-01' },
  { id: 2, order_no: 'FH20260515002', items: [{ product_name: '\u526A\u7EB8\u6302\u753B', quantity: 2, price: 128 }], total: 256, status: 'producing', created_at: '2026-05-15' },
  { id: 3, order_no: 'FH20260530003', items: [{ product_name: '\u6F06\u5668\u9996\u9970\u76D2', quantity: 1, price: 458 }], total: 458, status: 'pending', created_at: '2026-05-30' },
];

export default function Orders() {
  const [orders, setOrders] = createSignal<Order[]>(fallbackOrders);
  const [activeTab, setActiveTab] = createSignal('all');

  onMount(async () => { try { const data = await apiFetch<Order[]>('/orders'); setOrders(data); } catch {} });

  const filtered = () => activeTab() === 'all' ? orders() : orders().filter(o => o.status === activeTab());

  return (
    <div>
      <h1 class="text-2xl font-bold mb-6">{'\u6211\u7684\u8BA2\u5355'}</h1>
      <div class="flex gap-2 mb-6">
        {Object.entries(statusLabels).map(([key, label]) => (
          <button onClick={() => setActiveTab(key)} class="px-4 py-2 rounded-lg text-sm transition-all" style={{ background: activeTab() === key ? 'var(--color-secondary)' : 'var(--color-bg)', color: activeTab() === key ? 'white' : 'var(--color-text)', border: `1px solid ${activeTab() === key ? 'var(--color-secondary)' : 'var(--color-border)'}` }}>{label}</button>
        ))}
      </div>
      {filtered().length === 0 ? (
        <div class="text-center py-20" style={{ color: 'var(--color-text-light)' }}><Package size={48} class="mx-auto mb-4 opacity-50" /><p>{'\u6682\u65E0\u8BA2\u5355'}</p></div>
      ) : (
        <div class="space-y-4">
          {filtered().map(order => (
            <div class="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm" style={{ color: 'var(--color-text-light)' }}>{'\u8BA2\u5355\u53F7'}: {order.order_no}</span>
                <span class="text-sm font-medium px-3 py-1 rounded-full" style={{ background: statusColors[order.status] + '20', color: statusColors[order.status] }}>{statusLabels[order.status]}</span>
              </div>
              <div class="space-y-2 mb-3">{order.items.map(item => <div class="flex justify-between text-sm"><span>{item.product_name} x{item.quantity}</span><span>{'\u00A5'}{item.price * item.quantity}</span></div>)}</div>
              <div class="flex justify-between items-center pt-3" style={{ 'border-top': '1px solid var(--color-border)' }}>
                <span class="text-sm" style={{ color: 'var(--color-text-light)' }}>{order.created_at}</span>
                <span class="font-bold" style={{ color: 'var(--color-primary)' }}>{'\u00A5'}{order.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

