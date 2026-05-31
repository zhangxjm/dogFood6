import { createSignal, onMount } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Eye, Check } from 'lucide-solid';
import { apiFetch } from '../api/client';

interface ConfigSchema {
  text?: { label: string; max_length: number };
  colors?: { label: string; options: { name: string; value: string }[] };
  patterns?: { label: string; options: { name: string; image: string }[] };
  sizes?: { label: string; options: string[] };
}

interface Product { id: number; name: string; price: number; image: string; customizable: boolean; config_schema: ConfigSchema; }

const defaultSchema: ConfigSchema = {
  text: { label: '\u6587\u5B57\u5B9A\u5236', max_length: 20 },
  colors: { label: '\u989C\u8272\u9009\u62E9', options: [{ name: '\u6731\u7802\u7EA2', value: '#C41A1A' }, { name: '\u9EDB\u9752', value: '#1A3A5C' }, { name: '\u91D1\u8272', value: '#D4A843' }, { name: '\u58A8\u9ED1', value: '#2D2D2D' }, { name: '\u7D20\u767D', value: '#F5F0E8' }] },
  patterns: { label: '\u56FE\u6848\u9009\u62E9', options: [{ name: '\u7965\u4E91\u7EB9', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+cloud+pattern+auspicious+motif&image_size=square_hd' }, { name: '\u56DE\u7EB9', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+meander+pattern+geometric&image_size=square_hd' }, { name: '\u7261\u4E39\u7EB9', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+peony+pattern+floral&image_size=square_hd' }] },
  sizes: { label: '\u5C3A\u5BF8\u9009\u62E9', options: ['\u5C0F\u53F7', '\u4E2D\u53F7', '\u5927\u53F7'] },
};

export default function Customize() {
  const params = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = createSignal<Product | null>(null);
  const [customText, setCustomText] = createSignal('');
  const [selectedColor, setSelectedColor] = createSignal('#C41A1A');
  const [selectedPattern, setSelectedPattern] = createSignal('');
  const [selectedSize, setSelectedSize] = createSignal('\u4E2D\u53F7');

  onMount(async () => {
    try {
      const data = await apiFetch<Product>(`/products/${params.id}`);
      setProduct(data);
    } catch {
      setProduct({ id: Number(params.id), name: '\u975E\u9057\u624B\u5DE5\u7CBE\u54C1', price: 298, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+traditional+handicraft+art&image_size=square', customizable: true, config_schema: defaultSchema });
    }
  });

  const schema = () => product()?.config_schema || defaultSchema;

  const handleConfirm = async () => {
    try {
      await apiFetch('/customize/orders/', { method: 'POST', body: JSON.stringify({ product_id: product()?.id, quantity: 1, customization: { text: customText(), color: selectedColor(), pattern: selectedPattern(), size: selectedSize() } }) });
      navigate('/cart');
    } catch { alert('\u5B9A\u5236\u63D0\u4EA4\u5931\u8D25'); }
  };

  return (
    <div>
      <h1 class="text-2xl font-bold mb-6">{'\u5B9A\u5236\u5546\u54C1'}</h1>
      <div class="flex gap-8">
        <div class="w-1/2">
          <div class="rounded-xl overflow-hidden p-8 flex items-center justify-center" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <div class="text-center">
              <img src={product()?.image || ''} alt="\u9884\u89C8" class="w-64 h-64 object-cover rounded-lg mx-auto mb-4" style={{ border: `2px solid ${selectedColor()}` }} />
              {customText() && <p class="text-lg font-bold mt-2" style={{ color: selectedColor() }}>{customText()}</p>}
              <p class="text-sm mt-1" style={{ color: 'var(--color-text-light)' }}>{'\u5C3A\u5BF8'}: {selectedSize()} {selectedPattern() ? '| \u56FE\u6848: ' + selectedPattern() : ''}</p>
            </div>
          </div>
        </div>
        <div class="w-1/2">
          <div class="rounded-xl p-6" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <h2 class="font-bold text-lg mb-4">{product()?.name} - {'\u5B9A\u5236\u914D\u7F6E'}</h2>
            {schema().text && (
              <div class="mb-5">
                <label class="block text-sm font-medium mb-2">{schema().text!.label}</label>
                <input type="text" maxlength={schema().text!.max_length} value={customText()} onInput={e => setCustomText(e.currentTarget.value)} placeholder={'\u8BF7\u8F93\u5165\u5B9A\u5236\u6587\u5B57'} class="w-full px-4 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
                <p class="text-xs mt-1" style={{ color: 'var(--color-text-light)' }}>{'\u6700\u591A'}{schema().text!.max_length}{'\u4E2A\u5B57\u7B26'}</p>
              </div>
            )}
            {schema().colors && (
              <div class="mb-5">
                <label class="block text-sm font-medium mb-2">{schema().colors!.label}</label>
                <div class="flex gap-3">
                  {schema().colors!.options.map(c => (
                    <button onClick={() => setSelectedColor(c.value)} class="w-10 h-10 rounded-full transition-all relative" style={{ background: c.value, border: selectedColor() === c.value ? '3px solid var(--color-text)' : '2px solid var(--color-border)' }}>
                      {selectedColor() === c.value && <Check size={16} class="absolute inset-0 m-auto text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {schema().patterns && (
              <div class="mb-5">
                <label class="block text-sm font-medium mb-2">{schema().patterns!.label}</label>
                <div class="flex gap-3">
                  {schema().patterns!.options.map(p => (
                    <button onClick={() => setSelectedPattern(p.name)} class="w-16 h-16 rounded-lg overflow-hidden transition-all" style={{ border: selectedPattern() === p.name ? '3px solid var(--color-primary)' : '2px solid var(--color-border)' }}>
                      <img src={p.image} alt={p.name} class="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {schema().sizes && (
              <div class="mb-6">
                <label class="block text-sm font-medium mb-2">{schema().sizes!.label}</label>
                <div class="flex gap-2">
                  {schema().sizes!.options.map(s => (
                    <button onClick={() => setSelectedSize(s)} class="px-4 py-2 rounded-lg text-sm transition-all" style={{ background: selectedSize() === s ? 'var(--color-secondary)' : 'var(--color-bg)', color: selectedSize() === s ? 'white' : 'var(--color-text)', border: `1px solid ${selectedSize() === s ? 'var(--color-secondary)' : 'var(--color-border)'}` }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            <div class="flex gap-3">
              <button onClick={() => alert('\u9884\u89C8\u529F\u80FD\uFF1A\u6587\u5B57=' + customText() + '\uFF0C\u989C\u8272=' + selectedColor())} class="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <Eye size={18} /> {'\u9884\u89C8\u6548\u679C'}
              </button>
              <button onClick={handleConfirm} class="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90" style={{ background: 'var(--color-primary)' }}>
                <Check size={18} /> {'\u786E\u8BA4\u5B9A\u5236'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

