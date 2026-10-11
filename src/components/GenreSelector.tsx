import React, { useState, useMemo } from 'react';
import { Search, X, Check, Layers, Sliders } from 'lucide-react';
import type { Genre } from '../types';
import { GENRE_LIST, GENRE_METADATA } from '../data/genreMetadata';
import { GenreIcon } from './GenreIcon';

interface GenreSelectorProps {
  selectedGenres: Genre[];
  onChangeSelectedGenres: (genres: Genre[]) => void;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({
  selectedGenres,
  onChangeSelectedGenres,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter genres based on search query
  const filteredGenres = useMemo(() => {
    if (!searchQuery.trim()) return GENRE_LIST;
    const q = searchQuery.toLowerCase().trim();
    return GENRE_LIST.filter(
      (genre) =>
        genre.toLowerCase().includes(q) ||
        GENRE_METADATA[genre].tagline.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleToggleGenre = (genre: Genre) => {
    if (selectedGenres.includes(genre)) {
      onChangeSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      onChangeSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSelectAll = () => {
    onChangeSelectedGenres([]);
  };

  const isAllSelected = selectedGenres.length === 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 mb-6 sm:mb-10">
      {/* Control bar: Search + Summary + All Genres button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3 sm:mb-4">
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#777777] dark:text-[#888888] flex items-center gap-1.5 font-sans">
              <Sliders className="w-3.5 h-3.5 text-[#737B5B] dark:text-[#9CA87F]" />
              Themes & Genres
            </span>
            {selectedGenres.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#737B5B]/15 text-[#737B5B] dark:text-[#9CA87F] font-mono-time font-medium">
                {selectedGenres.length} selected
              </span>
            )}
          </div>

          {selectedGenres.length > 0 && (
            <button
              onClick={() => onChangeSelectedGenres([])}
              className="text-xs text-[#777777] hover:text-[#171717] dark:hover:text-[#F4F1EA] underline underline-offset-2 transition-colors px-1 cursor-pointer sm:hidden"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search themes (e.g. Stoic, Gita)..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-[#E8E4DC] dark:border-[#2A2A2A] bg-white/80 dark:bg-[#1E1E1E]/80 text-[#171717] dark:text-[#F4F1EA] placeholder-[#999999] focus:outline-none focus:ring-1 focus:ring-[#737B5B] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* All Genres Reset Button */}
          <button
            onClick={handleSelectAll}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
              isAllSelected
                ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] shadow-xs'
                : 'border border-[#E8E4DC] dark:border-[#2A2A2A] bg-white/70 dark:bg-[#1E1E1E]/70 text-[#666666] dark:text-[#AAAAAA] hover:border-[#737B5B]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>All Genres</span>
          </button>

          {selectedGenres.length > 0 && (
            <button
              onClick={() => onChangeSelectedGenres([])}
              className="hidden sm:inline-block text-xs text-[#777777] hover:text-[#171717] dark:hover:text-[#F4F1EA] underline underline-offset-2 transition-colors px-1 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Interactive Genre Chips Grid */}
      <div className="flex flex-wrap gap-2 items-center justify-center">
        {filteredGenres.map((genre) => {
          const info = GENRE_METADATA[genre];
          const isSelected = selectedGenres.includes(genre);

          return (
            <button
              key={genre}
              onClick={() => handleToggleGenre(genre)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-sans transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] shadow-sm scale-[1.02]'
                  : 'bg-white/80 dark:bg-[#1E1E1E]/80 border border-[#E8E4DC] dark:border-[#262626] text-[#444444] dark:text-[#BBBBBB] hover:border-[#737B5B]/50 hover:text-[#171717] dark:hover:text-[#F4F1EA]'
              }`}
              aria-pressed={isSelected}
              title={info.tagline}
            >
              <span
                className={`p-1 rounded-md transition-colors ${
                  isSelected
                    ? 'text-[#F7F5F0] dark:text-[#171717]'
                    : 'text-[#737B5B] dark:text-[#9CA87F] bg-[#737B5B]/10 dark:bg-[#8F9779]/15'
                }`}
              >
                <GenreIcon name={info.iconName} className="w-3.5 h-3.5" />
              </span>

              <span className="font-medium tracking-tight">{genre}</span>

              {isSelected && (
                <span className="ml-0.5 text-xs opacity-75">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filteredGenres.length === 0 && (
        <div className="text-center py-6 text-xs text-[#777777] dark:text-[#888888]">
          No genres found matching “{searchQuery}”.
        </div>
      )}
    </div>
  );
};
