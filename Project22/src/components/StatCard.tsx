import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: number
  suffix?: string
  iconColor?: string
}

export default function StatCard({ icon: Icon, label, value, trend, suffix, iconColor = 'text-accent-400' }: StatCardProps) {
  return (
    <div className="bg-brand-600 rounded-xl p-5 border border-brand-400/10 hover:border-brand-400/20 transition-colors animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm">{label}</span>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white animate-count-up">
          {value}
          {suffix && <span className="text-base font-normal text-gray-400 ml-1">{suffix}</span>}
        </span>
        {trend !== undefined && (
          <span
            className={`flex items-center text-sm mb-0.5 ${
              trend >= 0 ? 'text-success' : 'text-danger'
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  )
}
