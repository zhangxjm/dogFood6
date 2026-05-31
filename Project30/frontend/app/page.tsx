'use client'

import { useEffect, useState } from 'react'
import { 
  Building2, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  DollarSign
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import { dashboardApi, warehouseApi } from '@/lib/api'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsResult, warehouseResult] = await Promise.all([
        dashboardApi.getStats(),
        warehouseApi.getList(),
      ])
      
      if (statsResult.success) {
        setStats(statsResult.data)
      } else {
        console.warn('Stats API warning:', statsResult.error)
        setStats(getMockStats())
      }
      
      if (warehouseResult.success) {
        setWarehouses(warehouseResult.data.list || [])
      } else {
        console.warn('Warehouse API warning:', warehouseResult.error)
        setWarehouses(getMockWarehouses())
      }
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('数据加载失败，使用模拟数据')
      setStats(getMockStats())
      setWarehouses(getMockWarehouses())
    } finally {
      setLoading(false)
    }
  }

  const getMockStats = () => ({
    total_warehouses: 3,
    total_products: 6,
    total_inventory: 2700,
    total_inventory_value: 856740,
    total_bonded_quota: 2400000,
    total_used_quota: 358420,
    quota_usage_percent: 14.93,
    alert_stats: {
      warning_count: 3,
      critical_count: 2,
      total_active: 5,
    },
  })

  const getMockWarehouses = () => [
    { id: 1, name: '上海保税仓', bonded_quota: 1000000, used_quota: 156700 },
    { id: 2, name: '深圳保税仓', bonded_quota: 800000, used_quota: 120720 },
    { id: 3, name: '广州保税仓', bonded_quota: 600000, used_quota: 81000 },
  ]

  const pieData = warehouses.map((w) => ({
    name: w.name,
    value: w.used_quota || 0,
  }))

  const barData = warehouses.map((w) => ({
    name: w.name,
    已用额度: w.used_quota || 0,
    剩余额度: (w.bonded_quota || 0) - (w.used_quota || 0),
  }))

  const statCards = stats ? [
    { icon: Building2, label: '仓库数量', value: stats.total_warehouses, color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Package, label: '商品种类', value: stats.total_products, color: 'text-green-500', bg: 'bg-green-50' },
    { icon: TrendingUp, label: '库存总数', value: stats.total_inventory?.toLocaleString(), color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: DollarSign, label: '库存总值', value: `¥${stats.total_inventory_value?.toLocaleString()}`, color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: AlertTriangle, label: '临期预警', value: stats.alert_stats?.total_active || 0, color: 'text-red-500', bg: 'bg-red-50' },
  ] : []

  if (loading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-500">加载中...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">仪表盘</h1>
          {error && (
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
              {error}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {statCards.map((stat, index) => (
            <Card key={index} className={stat.bg}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="保税额度使用情况">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card title="各仓库额度对比">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="已用额度" fill="#3b82f6" />
                <Bar dataKey="剩余额度" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card title="保税额度总体使用">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">总保税额度</span>
              <span className="font-semibold">¥{stats?.total_bonded_quota?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">已使用额度</span>
              <span className="font-semibold text-blue-600">¥{stats?.total_used_quota?.toLocaleString()}</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
              <div 
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${stats?.quota_usage_percent || 0}%` }}
              />
            </div>
            <div className="text-right text-sm text-gray-500">
              使用率: {stats?.quota_usage_percent?.toFixed(2)}%
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
