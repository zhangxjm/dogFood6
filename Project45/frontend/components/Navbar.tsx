'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home,
  Play,
  Scissors,
  Search,
  User,
  LogIn,
  Menu,
  X,
  Radio,
  Shirt,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/live', label: '直播教学', icon: Radio },
  { href: '/crafts', label: '技艺传承', icon: Scissors },
  { href: '/works', label: '作品溯源', icon: Shirt },
  { href: '/search', label: '内容检索', icon: Search },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-heritage-gold/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-heritage-red to-heritage-gold rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">遗</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-heritage-ink font-serif">
                非遗数字传承
              </h1>
              <p className="text-xs text-gray-500">Intangible Heritage</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-heritage-red/10 text-heritage-red font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-heritage-ink'
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User size={18} />
                  <span>{user?.full_name || user?.username}</span>
                </Link>
                <button
                  onClick={logout}
                  className="btn-secondary"
                >
                  退出登录
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <LogIn size={18} />
                  <span>登录</span>
                </Link>
                <Link href="/register" className="btn-primary">
                  注册
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors',
                    isActive
                      ? 'bg-heritage-red/10 text-heritage-red'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-4 mt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  退出登录
                </button>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-3 text-center bg-heritage-red text-white rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    注册账号
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
