import Image from 'next/image';
import Link from 'next/link';
import { Shield, ShieldAlert, Clock, User } from 'lucide-react';
import { formatDate, isValidImageUrl } from '@/lib/utils';

interface WorkCardProps {
  work: {
    id: number;
    title: string;
    description: string | null;
    image_url: string | null;
    traceability_code: string;
    quality_verified: boolean;
    created_at: string;
    creator?: { full_name: string | null; username: string } | null;
    craft?: { title: string } | null;
  };
}

export default function WorkCard({ work }: WorkCardProps) {
  return (
    <Link href={`/works/${work.id}`} className="card group">
      <div className="relative h-48 overflow-hidden">
        {isValidImageUrl(work.image_url) ? (
          <Image
            src={work.image_url}
            alt={work.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-heritage-jade/30 to-heritage-gold/30 flex items-center justify-center">
            <span className="text-6xl">🏺</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          {work.quality_verified ? (
            <span className="flex items-center space-x-1 bg-heritage-jade text-white px-2 py-1 rounded text-xs">
              <Shield size={12} />
              <span>已认证</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 bg-gray-500 text-white px-2 py-1 rounded text-xs">
              <ShieldAlert size={12} />
              <span>待认证</span>
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          {work.craft && (
            <span className="text-xs text-heritage-gold font-medium">{work.craft.title}</span>
          )}
          <div className="flex items-center text-gray-500 text-xs">
            <Clock size={12} className="mr-1" />
            {formatDate(work.created_at).split(' ')[0]}
          </div>
        </div>
        <h3 className="font-bold text-lg text-heritage-ink mb-2 group-hover:text-heritage-red transition-colors line-clamp-1">
          {work.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{work.description}</p>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center text-gray-500">
            <User size={12} className="mr-1" />
            <span>{work.creator?.full_name || work.creator?.username || '未知'}</span>
          </div>
          <span className="text-heritage-red font-mono">
            {work.traceability_code.slice(0, 8)}...
          </span>
        </div>
      </div>
    </Link>
  );
}
