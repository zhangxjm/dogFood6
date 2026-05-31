import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  Server,
  Satellite,
  Activity,
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { path: '/', label: '实时监控', icon: LayoutDashboard },
  { path: '/data', label: '数据查询', icon: Database },
  { path: '/system', label: '系统状态', icon: Server },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <aside className="w-64 bg-slate-800/50 border-r border-slate-700/50 flex flex-col">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center glow-blue">
              <Satellite className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">航天地面站</h1>
              <p className="text-xs text-slate-400">数据处理中台</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400 border-glow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-200',
                    isActive && 'text-cyan-400'
                  )}
                />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-breathe" />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-700/30">
            <Activity className="w-5 h-5 text-emerald-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">系统运行中</p>
              <p className="text-xs text-slate-400">数据接收正常</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-slate-800/30 border-b border-slate-700/50 px-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {navItems.find((n) => n.path === location.pathname)?.label || '系统'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-breathe" />
              <span className="text-sm text-emerald-400">在线</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">管理员</p>
              <p className="text-xs text-slate-400">系统管理员</p>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto scrollbar-thin">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
