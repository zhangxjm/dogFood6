'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authApi.login(formData);
      login(res.data.access_token, res.data.user);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-paper to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-heritage-red to-heritage-gold rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">遗</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-heritage-ink mb-2 font-serif">
            欢迎回来
          </h1>
          <p className="text-gray-600">登录您的账号，开始非遗学习之旅</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="请输入用户名"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="请输入密码"
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <LogIn size={20} />
              <span>{loading ? '登录中...' : '登录'}</span>
            </button>
          </form>

          <div className="mt-6 p-4 bg-heritage-paper rounded-xl">
            <p className="text-sm text-gray-600 mb-2 font-medium">演示账号：</p>
            <div className="space-y-1 text-sm text-gray-500">
              <p>管理员：admin / admin123</p>
              <p>讲师：master_zhang / 123456</p>
              <p>学员：learner_wang / 123456</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              还没有账号？
              <Link href="/register" className="text-heritage-red hover:text-red-600 font-medium ml-1">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
