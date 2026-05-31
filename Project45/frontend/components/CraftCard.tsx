import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock, Users } from 'lucide-react';
import { formatDuration, getDifficultyLabel, getDifficultyColor, isValidImageUrl } from '@/lib/utils';

interface CraftCardProps {
  craft: {
    id: number;
    title: string;
    description: string;
    cover_image: string | null;
    difficulty_level: string;
    estimated_time: number | null;
    category?: { name: string } | null;
  };
}

export default function CraftCard({ craft }: CraftCardProps) {
  return (
    <Link href={`/crafts/${craft.id}`} className="card group">
      <div className="relative h-48 overflow-hidden">
        {isValidImageUrl(craft.cover_image) ? (
          <Image
            src={craft.cover_image}
            alt={craft.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-heritage-gold/30 to-heritage-red/30 flex items-center justify-center">
            <span className="text-6xl">🎨</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(craft.difficulty_level)}`}>
            {getDifficultyLabel(craft.difficulty_level)}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
            <Play className="text-heritage-red" size={24} fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          {craft.category && (
            <span className="text-xs text-heritage-gold font-medium">{craft.category.name}</span>
          )}
          {craft.estimated_time && (
            <div className="flex items-center text-gray-500 text-xs">
              <Clock size={12} className="mr-1" />
              {formatDuration(craft.estimated_time * 60)}
            </div>
          )}
        </div>
        <h3 className="font-bold text-lg text-heritage-ink mb-2 group-hover:text-heritage-red transition-colors line-clamp-1">
          {craft.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2">{craft.description}</p>
      </div>
    </Link>
  );
}
