import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { User, Lock, Eye, EyeOff, Loader2, MonitorPlay } from 'lucide-react';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store';

export default function Login() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await authApi.login(formData);
      setAuth(data.user, data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.error || '登录失败，请检查用户名和密码');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (role) => {
    const accounts = {
      admin: { username: 'admin', password: 'admin123' },
      teacher: { username: 'teacher', password: 'teacher123' },
      student: { username: 'student1', password: 'student123' }
    };
    setFormData(accounts[role]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animated-bg">
      <div className="absolute inset-0 grid-pattern opacity-30"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-cyber mb-4 shadow-lg shadow-cyber-500/30">
            <MonitorPlay className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">元宇宙教育虚拟实训平台</h1>
          <p className="text-slate-400">专业技能虚拟操作 | 实训数据记录 | 智能成绩评定</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">用户登录</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:border-transparent transition-all"
                  placeholder="请输入用户名"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:border-transparent transition-all"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-cyber text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cyber-button flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-sm text-slate-400 text-center mb-3">演示账号快速登录</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => fillDemoAccount('admin')}
                className="py-2 px-3 text-xs bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-slate-300 transition-colors"
              >
                管理员
              </button>
              <button
                onClick={() => fillDemoAccount('teacher')}
                className="py-2 px-3 text-xs bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-slate-300 transition-colors"
              >
                教师
              </button>
              <button
                onClick={() => fillDemoAccount('student')}
                className="py-2 px-3 text-xs bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-slate-300 transition-colors"
              >
                学生
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/register" className="text-sm text-cyber-400 hover:text-cyber-300 transition-colors">
              还没有账号？立即注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
