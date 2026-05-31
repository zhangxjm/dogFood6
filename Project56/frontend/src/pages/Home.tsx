import { createSignal, onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { ArrowRight, Flame, Clock } from 'lucide-solid';
import ProductCard from '../components/ProductCard';
import { apiFetch } from '../api/client';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  customizable: boolean;
}

interface Campaign {
  id: number;
  title: string;
  description: string;
  image: string;
  discount: string;
}

const [recommended, setRecommended] = createSignal<Product[]>([]);
const [campaigns, setCampaigns] = createSignal<Campaign[]>([]);
const [newArrivals, setNewArrivals] = createSignal<Product[]>([]);

const fallbackProducts: Product[] = [
  { id: 1, name: '\u82CF\u7EE3\u56E2\u6247', price: 298, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+embroidery+fan+silk+traditional+art&image_size=square', category: '\u523A\u7EE3', customizable: true },
  { id: 2, name: '\u666F\u5FB7\u9547\u9752\u82B1\u74F7\u676F', price: 168, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+blue+white+porcelain+cup+ceramic&image_size=square', category: '\u9676\u74F7', customizable: false },
  { id: 3, name: '\u526A\u7EB8\u827A\u672F\u6302\u753B', price: 128, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+paper+cutting+art+wall+decoration&image_size=square', category: '\u526A\u7EB8', customizable: true },
  { id: 4, name: '\u6F06\u5668\u9996\u9970\u76D2', price: 458, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+lacquerware+jewelry+box+red+gold&image_size=square', category: '\u6F06\u5668', customizable: false },
  { id: 5, name: '\u8700\u9526\u624B\u63D0\u5305', price: 688, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+brocade+handbag+silk+traditional&image_size=square', category: '\u7EC7\u9526', customizable: true },
  { id: 6, name: '\u4E1C\u9633\u6728\u96D5\u6446\u4EF6', price: 388, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+wood+carving+decoration+sculpture&image_size=square', category: '\u6728\u96D5', customizable: false },
  { id: 7, name: '\u82D7\u65CF\u94F6\u9970\u9879\u94FE', price: 528, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Miao+silver+jewelry+necklace+traditional&image_size=square', category: '\u523A\u7EE3', customizable: true },
  { id: 8, name: '\u7D2B\u7802\u8336\u58F6\u5957\u88C5', price: 798, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+zisha+teapot+set+purple+clay&image_size=square', category: '\u9676\u74F7', customizable: false },
];

const fallbackCampaigns: Campaign[] = [
  { id: 1, title: '\u7AEF\u5348\u8282\u7279\u60E0', description: '\u4F20\u7EDF\u9999\u56CA\u624B\u5DE5DIY\u5957\u88C5\u9650\u65F6\u6298\u6263', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dragon+boat+festival+sachet+traditional+Chinese&image_size=landscape_16_9', discount: '7\u6298' },
  { id: 2, title: '\u975E\u9057\u4F20\u627F\u65E5', description: '\u5927\u5E08\u624B\u4F5C\u7CFB\u5217\u9996\u53D1', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+intangible+cultural+heritage+master+craft&image_size=landscape_16_9', discount: '8\u6298' },
  { id: 3, title: '\u4F1A\u5458\u4E13\u4EAB', description: '\u79C1\u57DF\u4F1A\u5458\u72EC\u4EAB\u5B9A\u5236\u4F18\u60E0', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+VIP+member+exclusive+luxury+craft&image_size=landscape_16_9', discount: '6\u6298' },
];

export default function Home() {
  onMount(async () => {
    try {
      const rec = await apiFetch<Product[]>('/recommendations/recommend/personal/');
      setRecommended(rec);
    } catch { setRecommended(fallbackProducts.slice(0, 4)); }
    try {
      const camp = await apiFetch<Campaign[]>('/campaigns/campaigns/');
      setCampaigns(camp);
    } catch { setCampaigns(fallbackCampaigns); }
    try {
      const nw = await apiFetch<Product[]>('/products/products/?ordering=-created_at&page_size=4');
      setNewArrivals(nw);
    } catch { setNewArrivals(fallbackProducts.slice(4, 8)); }
  });

  return (
    <div>
      <section class="rounded-xl overflow-hidden mb-10 py-16 px-8 text-white" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
        <div class="max-w-2xl">
          <h1 class="text-4xl font-bold mb-4">{'\u975E\u9057\u6587\u521B \u00B7 \u4F20\u627F\u5343\u5E74\u4E4B\u7F8E'}</h1>
          <p class="text-lg opacity-90 mb-6">{'\u5343\u5E74\u5320\u5FC3\uFF0C\u4E00\u7269\u4E00\u4E16\u754C\u3002\u7CBE\u9009\u975E\u9057\u5DE5\u827A\uFF0C\u5B9A\u5236\u4E13\u5C5E\u6587\u521B\u3002'}</p>
          <A href="/products" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90" style={{ background: 'var(--color-accent)' }}>
            {'\u63A2\u7D22\u6587\u521B'} <ArrowRight size={18} />
          </A>
        </div>
      </section>

      <section class="mb-10">
        <div class="flex items-center gap-2 mb-6">
          <Flame size={20} style={{ color: 'var(--color-primary)' }} />
          <h2 class="text-xl font-bold">{'\u63A8\u8350\u5546\u54C1'}</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommended().map(p => <ProductCard product={p} />)}
        </div>
      </section>

      <section class="mb-10">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <Flame size={20} style={{ color: 'var(--color-accent)' }} />
            <h2 class="text-xl font-bold">{'\u79C1\u57DF\u6D3B\u52A8'}</h2>
          </div>
          <A href="/campaigns" class="text-sm flex items-center gap-1 transition-colors" style={{ color: 'var(--color-primary)' }}>
            {'\u67E5\u770B\u66F4\u591A'} <ArrowRight size={14} />
          </A>
        </div>
        <div class="flex gap-4 overflow-x-auto pb-4">
          {campaigns().map(c => (
            <div class="min-w-[300px] rounded-xl overflow-hidden flex-shrink-0 transition-shadow hover:shadow-lg" style={{ background: 'var(--color-card)' }}>
              <img src={c.image} alt={c.title} class="w-full h-40 object-cover" />
              <div class="p-4">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-bold">{c.title}</h3>
                  <span class="text-sm font-bold px-2 py-0.5 rounded" style={{ background: 'var(--color-primary)', color: 'white' }}>{c.discount}</span>
                </div>
                <p class="text-sm" style={{ color: 'var(--color-text-light)' }}>{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <Clock size={20} style={{ color: 'var(--color-secondary)' }} />
            <h2 class="text-xl font-bold">{'\u65B0\u54C1\u9996\u53D1'}</h2>
          </div>
          <A href="/products" class="text-sm flex items-center gap-1 transition-colors" style={{ color: 'var(--color-primary)' }}>
            {'\u67E5\u770B\u66F4\u591A'} <ArrowRight size={14} />
          </A>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {newArrivals().map(p => <ProductCard product={p} />)}
        </div>
      </section>
    </div>
  );
}

