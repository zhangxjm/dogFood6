import { useEffect } from 'react'
import { X, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle,
}

const colorMap = {
  info: 'border-info/40 bg-info/10 text-info',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  error: 'border-danger/40 bg-danger/10 text-danger',
  success: 'border-success/40 bg-success/10 text-success',
}

export default function AlertPanel() {
  const { alerts, removeAlert } = useAppStore()

  useEffect(() => {
    alerts.forEach((alert) => {
      const elapsed = Date.now() - alert.timestamp
      const remaining = 10000 - elapsed
      if (remaining <= 0) {
        removeAlert(alert.id)
        return
      }
      const timer = setTimeout(() => removeAlert(alert.id), remaining)
      return () => clearTimeout(timer)
    })
  }, [alerts, removeAlert])

  if (alerts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {alerts.map((alert) => {
        const Icon = iconMap[alert.type]
        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm animate-slide-down ${colorMap[alert.type]}`}
          >
            <Icon className="w-5 h-5 mt-0.5 shrink-0" />
            <span className="text-sm flex-1">{alert.message}</span>
            <button
              onClick={() => removeAlert(alert.id)}
              className="shrink-0 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
