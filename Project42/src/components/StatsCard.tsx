import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface StatsCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  gradient: string;
}

export default function StatsCard({ icon, value, label, gradient }: StatsCardProps) {
  return (
    <div className="card p-5 flex items-center gap-4 group cursor-default">
      <div
        className={clsx(
          'w-12 h-12 rounded-xl flex items-center justify-center text-white transition-transform duration-200 group-hover:scale-110',
          gradient
        )}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}
