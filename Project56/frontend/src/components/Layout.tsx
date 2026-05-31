import { A } from '@solidjs/router';
import { Show } from 'solid-js';
import { ShoppingCart, User, Home, Package, Crown, Sparkles } from 'lucide-solid';
import { isAuthenticated, user, logout } from '../stores/auth';

export default function Layout(props: { children?: any }) {
  return (
    <div class="min-h-screen flex flex-col">
      <header class="sticky top-0 z-50" style={{ background: 'var(--color-secondary)' }}>
        <nav class="max-w-[1280px] mx-auto px-4 h-14 flex items-center justify-between">
          <A href="/" class="text-white font-bold text-lg flex items-center gap-2">
            <Sparkles size={20} />
            {'\u975E\u9057\u6587\u521B'}
          </A>
          <div class="flex items-center gap-6">
            <A href="/" class="text-white/80 hover:text-white flex items-center gap-1 text-sm transition-colors">
              <Home size={16} /> {'\u9996\u9875'}
            </A>
            <A href="/products" class="text-white/80 hover:text-white flex items-center gap-1 text-sm transition-colors">
              <Package size={16} /> {'\u6587\u521B\u5546\u57CE'}
            </A>
            <A href="/member" class="text-white/80 hover:text-white flex items-center gap-1 text-sm transition-colors">
              <Crown size={16} /> {'\u4F1A\u5458\u4E2D\u5FC3'}
            </A>
            <A href="/campaigns" class="text-white/80 hover:text-white flex items-center gap-1 text-sm transition-colors">
              <Sparkles size={16} /> {'\u79C1\u57DF\u6D3B\u52A8'}
            </A>
            <A href="/cart" class="text-white/80 hover:text-white flex items-center gap-1 text-sm transition-colors relative">
              <ShoppingCart size={16} /> {'\u8D2D\u7269\u8F66'}
              <span class="absolute -top-1 -right-3 bg-[var(--color-primary)] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">0</span>
            </A>
          </div>
          <div class="flex items-center gap-3">
            <Show
              when={isAuthenticated()}
              fallback={
                <A href="/login" class="text-white/80 hover:text-white text-sm transition-colors">
                  {'\u767B\u5F55/\u6CE8\u518C'}
                </A>
              }
            >
              <A href="/member" class="text-white/80 hover:text-white flex items-center gap-1 text-sm transition-colors">
                <User size={16} /> {user()?.username}
              </A>
              <button
                onClick={logout}
                class="text-white/60 hover:text-white text-xs transition-colors"
              >
                {'\u9000\u51FA'}
              </button>
            </Show>
          </div>
        </nav>
        <div class="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-primary))' }} />
      </header>

      <main class="flex-1 max-w-[1280px] mx-auto w-full px-4 py-6">
        {props.children}
      </main>

      <footer class="border-t py-6 text-center text-sm" style={{ 'border-color': 'var(--color-border)', color: 'var(--color-text-light)' }}>
        <div class="max-w-[1280px] mx-auto px-4">
          <p>{'\u00A9 2026 \u975E\u9057\u6587\u521B \u00B7 \u4F20\u627F\u5343\u5E74\u4E4B\u7F8E \u7248\u6743\u6240\u6709'}</p>
        </div>
      </footer>
    </div>
  );
}

