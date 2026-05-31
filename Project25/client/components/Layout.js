import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { 
  Menu, X, Home, BookOpen, Users, User, Trophy, Settings, 
  LogOut, ChevronRight, MonitorPlay
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../store';

export default function Layout({ children }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const menuItems = [
    { icon: Home, label: '仪表盘', path: '/dashboard' },
    { icon: BookOpen, label: '实训模块', path: '/training' },
    { icon: Users, label: '协同实训', path: '/collaborative' },
    { icon: Trophy, label: '成就中心', path: '/achievements' },
    { icon: User, label: '个人中心', path: '/profile' }
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <aside className="fixed lg:static inset-y-0 left-0 z-50 w-64 glass border-r border-slate-700/50 transform transition-transform">
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-cyber flex items-center justify-center">
                <MonitorPlay className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-sm">虚拟实训平台</h1>
                <p className="text-xs text-slate-400">Metaverse Training</p>
              </div>
            </div>
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = router.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-cyber text-white shadow-lg shadow-cyber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30">
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                alt="用户头像"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{user?.display_name}</p>
                <p className="text-xs text-slate-400">
                  {user?.role === 'admin' ? '管理员' : user?.role === 'teacher' ? '教师' : '学生'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 glass border-b border-slate-700/50 px-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-white">
              {menuItems.find(item => item.path === router.pathname)?.label || '虚拟实训平台'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/collaborative')}
              className="px-4 py-2 bg-gradient-cyber text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              进入协同实训
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
