import Image from 'next/image';
import Link from 'next/link';
import { Radio, Eye, Heart } from 'lucide-react';
import { cn, isValidImageUrl } from '@/lib/utils';

interface LiveCardProps {
  live: {
    id: number;
    title: string;
    description: string | null;
    cover_image: string | null;
    is_live: boolean;
    viewer_count: number;
    like_count: number;
    host?: { full_name: string | null; username: string; avatar: string | null } | null;
    craft?: { title: string } | null;
  };
}

export default function LiveCard({ live }: LiveCardProps) {
  return (
    <Link href={`/live/${live.id}`} className="card group">
      <div className="relative h-48 overflow-hidden">
        {isValidImageUrl(live.cover_image) ? (
          <Image
            src={live.cover_image}
            alt={live.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-heritage-red/40 to-heritage-ink flex items-center justify-center">
            <Radio size={48} className="text-white/50" />
          </div>
        )}

        {live.is_live ? (
          <div className="absolute top-3 left-3 flex items-center space-x-2">
            <span className="flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              <span className="w-2 h-2 bg-white rounded-full live-indicator"></span>
              <span>直播中</span>
            </span>
            <span className="flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded text-xs">
              <Eye size={12} />
              <span>{live.viewer_count}</span>
            </span>
          </div>
        ) : (
          <div className="absolute top-3 left-3">
            <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs">
              回放
            </span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded text-xs">
          <Heart size={12} />
          <span>{live.like_count}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-heritage-ink mb-2 line-clamp-1 group-hover:text-heritage-red transition-colors">
          {live.title}
        </h3>
        {live.craft && (
          <p className="text-xs text-heritage-gold mb-2">{live.craft.title}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-heritage-gold to-heritage-red rounded-full flex items-center justify-center text-white text-xs font-medium">
              {live.host?.full_name?.[0] || live.host?.username?.[0] || '主'}
            </div>
            <span className="text-sm text-gray-600">
              {live.host?.full_name || live.host?.username}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
