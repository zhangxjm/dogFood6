import { cn } from '../lib/utils';

interface GaugeChartProps {
  value: number;
  maxValue?: number;
  label: string;
  unit?: string;
  color?: 'cyan' | 'emerald' | 'amber' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

export function GaugeChart({
  value,
  maxValue = 100,
  label,
  unit = '',
  color = 'cyan',
  size = 'md',
}: GaugeChartProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const radius = size === 'sm' ? 40 : size === 'lg' ? 80 : 60;
  const strokeWidth = size === 'sm' ? 6 : size === 'lg' ? 12 : 8;
  const circumference = Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    cyan: 'stroke-cyan-400',
    emerald: 'stroke-emerald-400',
    amber: 'stroke-amber-400',
    purple: 'stroke-purple-400',
  };

  const glowClasses = {
    cyan: 'drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]',
    emerald: 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]',
    amber: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]',
    purple: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]',
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          width={radius * 2 + 20}
          height={radius + 20}
          viewBox={`0 0 ${radius * 2 + 20} ${radius + 20}`}
          className={cn('transform -rotate-90', glowClasses[color])}
        >
          <circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`translate(0, ${radius})`}
          />
          <circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            fill="none"
            className={colorClasses[color]}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`translate(0, ${radius})`}
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-4">
          <span
            className={cn(
              'font-mono font-bold text-white number-change',
              size === 'sm'
                ? 'text-xl'
                : size === 'lg'
                  ? 'text-4xl'
                  : 'text-2xl'
            )}
          >
            {value.toFixed(1)}
          </span>
          {unit && (
            <span className="text-xs text-slate-400 font-medium">{unit}</span>
          )}
        </div>
      </div>
      <span
        className={cn(
          'text-slate-400 font-medium mt-2',
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
        )}
      >
        {label}
      </span>
    </div>
  );
}
