import { cn } from '../lib/utils';
import type { DataStatus, ConnectionStatus } from '../types';

interface StatusBadgeProps {
  status: DataStatus | ConnectionStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.bg,
        config.text,
        config.border
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'PROCESSED':
    case 'CONNECTED':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border border-emerald-500/30',
        dot: 'bg-emerald-400 animate-breathe',
        label: status === 'PROCESSED' ? '已处理' : '已连接',
      };
    case 'RECEIVED':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border border-amber-500/30',
        dot: 'bg-amber-400',
        label: '已接收',
      };
    case 'ERROR':
    case 'DISCONNECTED':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border border-red-500/30',
        dot: 'bg-red-400 animate-pulse',
        label: status === 'ERROR' ? '错误' : '未连接',
      };
    default:
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border border-slate-500/30',
        dot: 'bg-slate-400',
        label: status,
      };
  }
}
