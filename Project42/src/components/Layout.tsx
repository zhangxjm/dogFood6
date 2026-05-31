import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, BookOpen, CalendarCheck, TrendingUp, GraduationCap } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '首页' },
  { to: '/materials', icon: BookOpen, label: '资料中心' },
  { to: '/checkin', icon: CalendarCheck, label: '打卡记录' },
  { to: '/progress', icon: TrendingUp, label: '进度追踪' },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-primary-800 text-white flex flex-col flex-shrink-0">
        <div className="px-6 py-5 flex items-center gap-3 border-b border-primary-700">
          <GraduationCap className="w-8 h-8 text-accent-400" />
          <h1 className="text-xl font-bold tracking-wide">自考助手</h1>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white border-r-4 border-accent-400'
                    : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-primary-700 text-xs text-primary-300">
          自考学习资料平台 v1.0
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
