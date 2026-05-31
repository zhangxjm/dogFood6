import { createSignal, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-solid';
import { apiFetch } from '../api/client';

interface CartItem { id: number; product_id: number; name: string; image: string; price: number; quantity: number; customized: boolean; }

const fallbackItems: CartItem[] = [
  { id: 1, product_id: 1, name: '\u82CF\u7EE3\u56E2\u6247', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+embroidery+fan&image_size=square', price: 298, quantity: 1, customized: false },
  { id: 2, product_id: 3, name: '\u526A\u7EB8\u827A\u672F\u6302\u753B\uFF08\u5B9A\u5236\uFF09', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+paper+cutting+art&image_size=square', price: 128, quantity: 2, customized: true },
];

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = createSignal<CartItem[]>([]);

  onMount(async () => {
    try { const data = await apiFetch<CartItem[]>('/cart'); setItems(data); }
    catch { setItems(fallbackItems); }
  });

  const subtotal = () => items().reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = () => 0;
  const total = () => subtotal() - discount();

  const updateQuantity = (id: number, delta: number) => { setItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)); };
  const removeItem = (id: number) => { setItems(prev => prev.filter(item => item.id !== id)); };
  const handleCheckout = async () => {
    try { await apiFetch('/orders/orders/', { method: 'POST', body: JSON.stringify({ address: '', cart_item_ids: items().map(i => i.id) }) }); navigate('/orders'); }
    catch { alert('\u7ED3\u7B97\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5'); }
  };

  return (
    <div>
      <h1 class="text-2xl font-bold mb-6">{'\u8D2D\u7269\u8F66'}</h1>
      {items().length === 0 ? (
        <div class="text-center py-20" style={{ color: 'var(--color-text-light)' }}><ShoppingBag size={48} class="mx-auto mb-4 opacity-50" /><p class="text-lg">{'\u8D2D\u7269\u8F66\u662F\u7A7A\u7684'}</p></div>
      ) : (
        <div class="flex gap-6">
          <div class="flex-1 space-y-4">
            {items().map(item => (
              <div class="flex gap-4 p-4 rounded-xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                <img src={item.image} alt={item.name} class="w-24 h-24 rounded-lg object-cover" />
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1"><h3 class="font-medium">{item.name}</h3>{item.customized && <span class="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-accent)', color: 'white' }}>{'\u5B9A\u5236'}</span>}</div>
                  <p class="text-lg font-bold mb-2" style={{ color: 'var(--color-primary)' }}>{'\u00A5'}{item.price}</p>
                  <div class="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.id, -1)} class="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}><Minus size={14} /></button>
                    <span class="w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} class="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}><Plus size={14} /></button>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} class="self-start p-2" style={{ color: 'var(--color-text-light)' }}><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
          <div class="w-72 flex-shrink-0">
            <div class="rounded-xl p-5 sticky top-20" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <h3 class="font-bold mb-4">{'\u8BA2\u5355\u6458\u8981'}</h3>
              <div class="space-y-2 text-sm mb-4">
                <div class="flex justify-between"><span style={{ color: 'var(--color-text-light)' }}>{'\u5C0F\u8BA1'}</span><span>{'\u00A5'}{subtotal()}</span></div>
                <div class="flex justify-between"><span style={{ color: 'var(--color-text-light)' }}>{'\u4F18\u60E0\u5238'}</span><span style={{ color: 'var(--color-primary)' }}>-{'\u00A5'}{discount()}</span></div>
                <div class="border-t pt-2 flex justify-between font-bold text-base" style={{ 'border-color': 'var(--color-border)' }}><span>{'\u5408\u8BA1'}</span><span style={{ color: 'var(--color-primary)' }}>{'\u00A5'}{total()}</span></div>
              </div>
              <button onClick={handleCheckout} class="w-full py-3 rounded-lg font-medium text-white transition-all hover:opacity-90" style={{ background: 'var(--color-primary)' }}>{'\u7ED3\u7B97'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



