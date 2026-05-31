import Link from 'next/link';
import { Search, History, BarChart3 } from 'lucide-react';

interface SearchSuggestionsProps {
  suggestions: string[];
  onSelect: (term: string) => void;
}

export default function SearchSuggestions({ suggestions, onSelect }: SearchSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-80 overflow-y-auto">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
        >
          <Search size={16} className="text-gray-400" />
          <span className="text-gray-700">{suggestion}</span>
        </button>
      ))}
    </div>
  );
}
