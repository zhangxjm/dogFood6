'use client'

import { useState } from 'react'
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  AlertTriangle, 
  Barcode, 
  RefreshCw,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { icon: LayoutDashboard, label: '仪表盘', href: '/' },
  { icon: Warehouse, label: '仓库管理', href: '/warehouses' },
  { icon: Package, label: '商品管理', href: '/products' },
  { icon: Barcode, label: '库存管理', href: '/inventories' },
  { icon: AlertTriangle, label: '临期预警', href: '/alerts' },
  { icon: RefreshCw, label: '库存同步', href: '/sync' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className={`fixed left-0 top-0 z-40 h-screen bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex h-16 items-center justify-between border-b px-4">
          {sidebarOpen && (
            <h1 className="text-lg font-bold text-primary-600">保税仓管理系统</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="mt-4 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-center rounded-lg px-4 py-3 transition-colors ${
                pathname === item.href
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
