import { useState } from 'react';
import {
  LayoutDashboard,
  ScanLine,
  GitBranch,
  FileBarChart,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const menuItems = [
  { id: 'dashboard', label: '实时监控', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'defects', label: '缺陷管理', icon: ScanLine, path: '/defects' },
  { id: 'sorting', label: '分流控制', icon: GitBranch, path: '/sorting' },
  { id: 'reports', label: '质检报表', icon: FileBarChart, path: '/reports' },
  { id: 'devices', label: '设备管理', icon: Cpu, path: '/devices' },
  { id: 'system', label: '系统设置', icon: Settings, path: '/system' },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { alerts } = useAppStore();

  const currentPath = location.pathname;
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside
        className={cn(
          'bg-brand-500 text-white transition-all duration-300 flex flex-col',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <div className="h-16 flex items-center justify-center border-b border-brand-400">
          {!collapsed && (
            <h1 className="text-lg font-bold">AI视觉质检系统</h1>
          )}
          {collapsed && (
            <span className="text-2xl font-bold">AI</span>
          )}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath.startsWith(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center px-4 py-3 text-left transition-colors',
                  isActive
                    ? 'bg-brand-600 border-r-4 border-accent-400'
                    : 'hover:bg-brand-600'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="ml-3 text-sm">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-12 flex items-center justify-center border-t border-brand-400 hover:bg-brand-600 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div className="text-lg font-semibold text-gray-800">
            {menuItems.find((m) => currentPath.startsWith(m.path))?.label || '系统'}
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-600">管理员</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
