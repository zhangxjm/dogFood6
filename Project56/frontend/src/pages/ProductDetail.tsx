import { createSignal, onMount } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { ShoppingCart, Palette } from 'lucide-solid';
import { apiFetch } from '../api/client';

interface Product { id: number; name: string; price: number; image: string; category: string; customizable: boolean; description: string; heritage_story: string; }

export default function ProductDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = createSignal<Product | null>(null);
  const [similar, setSimilar] = createSignal<Product[]>([]);

  onMount(async () => {
    try {
      const data = await apiFetch<Product>(`/products/products/${params.id}/`);
      setProduct(data);
      try { const sim = await apiFetch<Product[]>(`/recommendations/recommend/similar/?product_id=${params.id}`); setSimilar(sim); } catch {}
    } catch {
      setProduct({ id: Number(params.id), name: '\u975E\u9057\u624B\u5DE5\u7CBE\u54C1', price: 298, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+traditional+handicraft+art+product&image_size=square', category: '\u523A\u7EE3', customizable: true, description: '\u7CBE\u9009\u4E0A\u7B49\u6750\u6599\uFF0C\u7531\u975E\u9057\u4F20\u627F\u4EBA\u4EB2\u624B\u5236\u4F5C\uFF0C\u6BCF\u4E00\u4EF6\u90FD\u72EC\u4E00\u65E0\u4E8C\u3002', heritage_story: '\u6B64\u5DE5\u827A\u6E90\u81EA\u660E\u6E05\u65F6\u671F\uFF0C\u5386\u7ECF\u6570\u767E\u5E74\u4F20\u627F\uFF0C\u5DF2\u88AB\u5217\u5165\u56FD\u5BB6\u7EA7\u975E\u7269\u8D28\u6587\u5316\u9057\u4EA7\u540D\u5F55\u3002\u6BCF\u4E00\u9488\u6BCF\u4E00\u7EBF\uFF0C\u90FD\u51DD\u805A\u7740\u5320\u4EBA\u7684\u5FC3\u8840\u4E0E\u667A\u6167\u3002' });
    }
  });

  const handleAddCart = async () => {
    try {
      await apiFetch('/orders/cart/', { method: 'POST', body: JSON.stringify({ product: product()?.id, quantity: 1 }) });
      alert('\u5DF2\u52A0\u5165\u8D2D\u7269\u8F66');
    } catch { alert('\u52A0\u5165\u8D2D\u7269\u8F66\u5931\u8D25'); }
  };

  return (
    <div>
      {product() && (
        <div class="flex gap-8 mb-10">
          <div class="w-1/2">
            <img src={product()!.image} alt={product()!.name} class="w-full rounded-xl object-cover aspect-square" style={{ background: 'var(--color-card)' }} />
          </div>
          <div class="w-1/2">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-bg)', color: 'var(--color-primary)' }}>{product()!.category}</span>
              {product()!.customizable && <span class="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-accent)', color: 'white' }}>{'\u53EF\u5B9A\u5236'}</span>}
            </div>
            <h1 class="text-2xl font-bold mb-2">{product()!.name}</h1>
            <p class="text-3xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>{'\u00A5'}{product()!.price}</p>
            <p class="mb-6 leading-relaxed" style={{ color: 'var(--color-text-light)' }}>{product()!.description}</p>
            <div class="mb-6 p-4 rounded-lg" style={{ background: 'var(--color-bg)' }}>
              <h3 class="font-bold mb-2">{'\u975E\u9057\u6545\u4E8B'}</h3>
              <p class="text-sm leading-relaxed" style={{ color: 'var(--color-text-light)' }}>{product()!.heritage_story}</p>
            </div>
            <div class="flex gap-3">
              {product()!.customizable && (
                <button onClick={() => navigate(`/customize/${product()!.id}`)} class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90" style={{ background: 'var(--color-accent)' }}>
                  <Palette size={18} /> {'\u7ACB\u5373\u5B9A\u5236'}
                </button>
              )}
              <button onClick={handleAddCart} class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90" style={{ background: 'var(--color-primary)' }}>
                <ShoppingCart size={18} /> {'\u52A0\u5165\u8D2D\u7269\u8F66'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





