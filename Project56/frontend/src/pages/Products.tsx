import { createSignal, onMount } from 'solid-js';
import { Search } from 'lucide-solid';
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

const categories = ['\u5168\u90E8', '\u523A\u7EE3', '\u9676\u74F7', '\u526A\u7EB8', '\u6F06\u5668', '\u7EC7\u9526', '\u6728\u96D5'];
const fallbackProducts: Product[] = [
  { id: 1, name: '\u82CF\u7EE3\u56E2\u6247', price: 298, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+embroidery+fan+silk&image_size=square', category: '\u523A\u7EE3', customizable: true },
  { id: 2, name: '\u666F\u5FB7\u9547\u9752\u82B1\u74F7\u676F', price: 168, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+blue+white+porcelain+cup&image_size=square', category: '\u9676\u74F7', customizable: false },
  { id: 3, name: '\u526A\u7EB8\u827A\u672F\u6302\u753B', price: 128, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+paper+cutting+art&image_size=square', category: '\u526A\u7EB8', customizable: true },
  { id: 4, name: '\u6F06\u5668\u9996\u9970\u76D2', price: 458, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+lacquerware+jewelry+box&image_size=square', category: '\u6F06\u5668', customizable: false },
  { id: 5, name: '\u8700\u9526\u624B\u63D0\u5305', price: 688, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+brocade+handbag&image_size=square', category: '\u7EC7\u9526', customizable: true },
  { id: 6, name: '\u4E1C\u9633\u6728\u96D5\u6446\u4EF6', price: 388, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+wood+carving+sculpture&image_size=square', category: '\u6728\u96D5', customizable: false },
  { id: 7, name: '\u6E58\u7EE3\u5C4F\u98CE', price: 1280, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+embroidery+screen+panel&image_size=square', category: '\u523A\u7EE3', customizable: true },
  { id: 8, name: '\u5EFA\u76CF\u8336\u676F', price: 258, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+Jian+tea+bowl+ceramic&image_size=square', category: '\u9676\u74F7', customizable: false },
  { id: 9, name: '\u523B\u6F06\u82B1\u74F6', price: 860, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese+carved+lacquer+vase&image_size=square', category: '\u6F06\u5668', customizable: true },
];

export default function Products() {
  const [products, setProducts] = createSignal<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = createSignal('\u5168\u90E8');
  const [searchQuery, setSearchQuery] = createSignal('');
  const [sortBy, setSortBy] = createSignal('newest');

  onMount(async () => {
    try {
      const data = await apiFetch<Product[]>('/products');
      setProducts(data);
    } catch { setProducts(fallbackProducts); }
  });

  const filtered = () => {
    let list = products();
    const cat = selectedCategory();
    if (cat !== '\u5168\u90E8') list = list.filter(p => p.category === cat);
    const q = searchQuery().trim().toLowerCase();
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q));
    if (sortBy() === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy() === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  };

  return (
    <div class="flex gap-6">
      <aside class="w-48 flex-shrink-0">
        <h3 class="font-bold mb-4">{'\u5546\u54C1\u5206\u7C7B'}</h3>
        <div class="flex flex-col gap-1">
          {categories.map(cat => (
            <button
              onClick={() => setSelectedCategory(cat)}
              class="text-left px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                background: selectedCategory() === cat ? 'var(--color-primary)' : 'transparent',
                color: selectedCategory() === cat ? 'white' : 'var(--color-text)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </aside>
      <div class="flex-1">
        <div class="flex items-center gap-4 mb-6">
          <div class="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <Search size={16} style={{ color: 'var(--color-text-light)' }} />
            <input type="text" placeholder={'\u641C\u7D22\u6587\u521B\u5546\u54C1...'} value={searchQuery()} onInput={e => setSearchQuery(e.currentTarget.value)} class="flex-1 bg-transparent outline-none text-sm" />
          </div>
          <select value={sortBy()} onChange={e => setSortBy(e.currentTarget.value)} class="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <option value="newest">{'\u6700\u65B0'}</option>
            <option value="price_asc">{'\u4EF7\u683C\u4ECE\u4F4E\u5230\u9AD8'}</option>
            <option value="price_desc">{'\u4EF7\u683C\u4ECE\u9AD8\u5230\u4F4E'}</option>
          </select>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered().map(p => <ProductCard product={p} />)}
        </div>
        {filtered().length === 0 && (
          <div class="text-center py-20" style={{ color: 'var(--color-text-light)' }}>
            <p class="text-lg">{'\u6682\u65E0\u76F8\u5173\u5546\u54C1'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

