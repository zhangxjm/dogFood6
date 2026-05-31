import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  color?: 'cyan' | 'emerald' | 'amber' | 'purple' | 'red';
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'cyan',
  delay = 0,
}: StatCardProps) {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30',
  };

  const iconColorClasses = {
    cyan: 'text-cyan-400 bg-cyan-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    red: 'text-red-400 bg-red-500/10',
  };

  return (
    <div
      className={cn(
        'rounded-xl border bg-gradient-to-br p-6 transition-all duration-300 hover:scale-[1.02] animate-slide-in',
        colorClasses[color]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-400 font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white font-mono number-change">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend !== undefined && (
            <p
              className={cn(
                'mt-1 text-sm font-medium',
                trend >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
            </p>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-xl transition-transform duration-300 group-hover:scale-110',
            iconColorClasses[color]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
