import { Timeline, Shield, Hash, MapPin, Thermometer, Droplets, User } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

interface TraceRecord {
  id: number;
  step_number: number;
  action: string;
  description: string;
  operator: string | null;
  location: string | null;
  temperature: number | null;
  humidity: number | null;
  timestamp: string;
}

interface TraceTimelineProps {
  records: TraceRecord[];
  integrityScore: number;
  isVerified: boolean;
}

export default function TraceTimeline({ records, integrityScore, isVerified }: TraceTimelineProps) {
  const getStepColor = (index: number, total: number) => {
    const ratio = index / total;
    if (ratio < 0.3) return 'bg-heritage-jade border-heritage-jade';
    if (ratio < 0.6) return 'bg-heritage-gold border-heritage-gold';
    return 'bg-heritage-red border-heritage-red';
  };

  const getIntegrityLabel = (score: number) => {
    if (score >= 90) return { text: '优秀', color: 'text-green-600 bg-green-100' };
    if (score >= 70) return { text: '良好', color: 'text-yellow-600 bg-yellow-100' };
    return { text: '需完善', color: 'text-red-600 bg-red-100' };
  };

  const integrityInfo = getIntegrityLabel(integrityScore);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-heritage-paper p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-heritage-gold/20 rounded-full flex items-center justify-center">
            <Shield className="text-heritage-gold" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-heritage-ink">溯源完整性</h3>
            <p className="text-sm text-gray-500">{records.length} 条溯源记录</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-heritage-ink">{integrityScore.toFixed(1)}</div>
          <span className={cn('text-xs px-2 py-1 rounded', integrityInfo.color)}>
            {integrityInfo.text}
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-heritage-jade via-heritage-gold to-heritage-red"></div>

        <div className="space-y-6">
          {records.map((record, index) => (
            <div key={record.id} className="relative pl-16">
              <div
                className={cn(
                  'absolute left-4 w-5 h-5 rounded-full border-4 bg-white',
                  getStepColor(index, records.length)
                )}
              ></div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        getStepColor(index, records.length).replace('border-', 'text-').replace('bg-', 'bg-').replace('border-', '') + '/20'
                      )}>
                        步骤 {record.step_number}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg text-heritage-ink">{record.action}</h4>
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(record.timestamp)}</span>
                </div>

                <p className="text-gray-600 mb-4">{record.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {record.operator && (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <User size={14} />
                      <span>{record.operator}</span>
                    </div>
                  )}
                  {record.location && (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <MapPin size={14} />
                      <span>{record.location}</span>
                    </div>
                  )}
                  {record.temperature !== null && (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Thermometer size={14} />
                      <span>{record.temperature}°C</span>
                    </div>
                  )}
                  {record.humidity !== null && (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Droplets size={14} />
                      <span>{record.humidity}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isVerified && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Shield className="text-white" size={20} />
          </div>
          <div>
            <h4 className="font-bold text-green-800">平台品质认证</h4>
            <p className="text-sm text-green-600">该作品已通过非遗传承平台官方认证，确保工艺正宗、品质优良</p>
          </div>
        </div>
      )}
    </div>
  );
}
