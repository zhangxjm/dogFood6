import { A } from '@solidjs/router';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  customizable: boolean;
}

export default function ProductCard(props: { product: Product }) {
  return (
    <A
      href={`/products/${props.product.id}`}
      class="block rounded-lg overflow-hidden transition-shadow hover:shadow-lg"
      style={{ background: 'var(--color-card)' }}
    >
      <div class="aspect-square overflow-hidden">
        <img
          src={props.product.image}
          alt={props.product.name}
          class="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <div class="p-3">
        <div class="flex items-center gap-2 mb-1">
          <span
            class="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'var(--color-bg)', color: 'var(--color-primary)' }}
          >
            {props.product.category}
          </span>
          {props.product.customizable && (
            <span
              class="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'var(--color-accent)', color: 'white' }}
            >
              {'\u53EF\u5B9A\u5236'}
            </span>
          )}
        </div>
        <h3 class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
          {props.product.name}
        </h3>
        <p class="text-base font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
          {'\u00A5'}{props.product.price}
        </p>
      </div>
    </A>
  );
}
