'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, AlertTriangle, FileCheck, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { dashboardAPI } from '@/lib/api'

interface Stats {
  chain: {
    blockHeight: number
    totalTxCount: number
    activeWallets: number
    totalVolume: number
  }
  anomaly: {
    totalAlerts: number
    pendingAlerts: number
    resolvedAlerts: number
    highRiskCount: number
    criticalCount: number
    todayNewAlerts: number
  }
  compliance: {
    totalReports: number
    submittedReports: number
    acknowledgedReports: number
    todayReports: number
    complianceRate: number
  }
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [txVolume, setTxVolume] = useState<any[]>([])
  const [anomalyTrend, setAnomalyTrend] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, volumeRes, trendRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getTxVolume(7),
          dashboardAPI.getAnomalyTrend(7),
        ])
        setStats(statsRes.data)
        setTxVolume(volumeRes.data)
        setAnomalyTrend(trendRes.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const getComplianceRate = () => {
    if (stats?.compliance.complianceRate != null) {
      return stats.compliance.complianceRate.toFixed(1) + '%'
    }
    return '0%'
  }

  const statCards = [
    {
      title: '区块高度',
      value: stats?.chain.blockHeight?.toLocaleString() || '0',
      icon: Activity,
      change: '+0.3%',
      trend: 'up',
    },
    {
      title: '交易总量',
      value: stats?.chain.totalTxCount?.toLocaleString() || '0',
      icon: TrendingUp,
      change: '+12.5%',
      trend: 'up',
    },
    {
      title: '待处理预警',
      value: stats?.anomaly.pendingAlerts?.toLocaleString() || '0',
      icon: AlertTriangle,
      color: 'text-danger-600',
      bg: 'bg-danger-50',
    },
    {
      title: '合规报告',
      value: stats?.compliance.submittedReports?.toLocaleString() || '0',
      icon: FileCheck,
      change: getComplianceRate(),
      trend: 'up',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">监管仪表盘</h1>
        <p className="text-gray-500 mt-1">实时监控数字藏品市场合规状态</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  {card.change && (
                    <div className={`flex items-center gap-1 mt-2 ${card.trend === 'up' ? 'text-success-600' : 'text-danger-600'}`}>
                      {card.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{card.change}</span>
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-primary-50">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">交易量趋势</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={txVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">异常交易趋势</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={anomalyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">风险等级分布</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">高危预警</span>
              <span className="font-semibold text-danger-600">{stats?.anomaly.highRiskCount || 0}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-danger-500 h-2 rounded-full" style={{ width: Math.min((stats?.anomaly.highRiskCount || 0) * 10, 100) + '%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">严重预警</span>
              <span className="font-semibold text-warning-600">{stats?.anomaly.criticalCount || 0}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-warning-500 h-2 rounded-full" style={{ width: Math.min((stats?.anomaly.criticalCount || 0) * 10, 100) + '%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">今日新增</span>
              <span className="font-semibold text-primary-600">{stats?.anomaly.todayNewAlerts || 0}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: Math.min((stats?.anomaly.todayNewAlerts || 0) * 10, 100) + '%' }}></div>
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">合规状态概览</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-success-50 rounded-lg">
              <div className="text-3xl font-bold text-success-600">{getComplianceRate()}</div>
              <div className="text-sm text-gray-600 mt-1">合规率</div>
            </div>
            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-600">{stats?.compliance.totalReports || 0}</div>
              <div className="text-sm text-gray-600 mt-1">报告总数</div>
            </div>
            <div className="p-4 bg-warning-50 rounded-lg">
              <div className="text-3xl font-bold text-warning-600">{stats?.compliance.submittedReports || 0}</div>
              <div className="text-sm text-gray-600 mt-1">已提交报告</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-600">{stats?.compliance.acknowledgedReports || 0}</div>
              <div className="text-sm text-gray-600 mt-1">已确认报告</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
