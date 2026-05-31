import { type LucideIcon } from 'lucide-react'

interface StatusBadgeProps {
  status: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  RUNNING: { label: '运行中', className: 'bg-success/20 text-success border-success/30' },
  ONLINE: { label: '在线', className: 'bg-success/20 text-success border-success/30' },
  STOPPED: { label: '已停止', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  OFFLINE: { label: '离线', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  FAULT: { label: '故障', className: 'bg-danger/20 text-danger border-danger/30' },
  CRITICAL: { label: '严重', className: 'bg-danger/20 text-danger border-danger/30' },
  MINOR: { label: '轻微', className: 'bg-warning/20 text-warning border-warning/30' },
  MAJOR: { label: '重要', className: 'bg-accent-400/20 text-accent-400 border-accent-400/30' },
  PASS: { label: '合格', className: 'bg-success/20 text-success border-success/30' },
  FAIL: { label: '不合格', className: 'bg-danger/20 text-danger border-danger/30' },
  ACTIVE: { label: '启用', className: 'bg-success/20 text-success border-success/30' },
  INACTIVE: { label: '停用', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {config.label}
    </span>
  )
}

export { statusConfig }
