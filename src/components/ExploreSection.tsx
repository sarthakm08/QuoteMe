import React, { useState, useMemo } from 'react';
import {
  Compass,
  Clock,
  Sparkles,
  History,
  Shuffle,
  Search,
  Bookmark,
  Copy,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import type { Quote, TimeSlot } from '../types';
import { TIME_SLOTS } from '../utils/timeEngine';
import { searchQuotes } from '../utils/quoteAlgorithm';

interface ExploreSectionProps {
  allQuotes: Quote[];
  currentTimeSlot: TimeSlot;
  recentlyViewedIds: string[];
  favoriteIds: string[];
  onSelectAsFeatured: (quote: Quote, contextPool?: Quote[], contextTitle?: string) => void;
  onToggleFavorite: (id: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info') => void;
}

type TabType = 'slot' | 'trending' | 'history' | 'random';

export const ExploreSection: React.FC<ExploreSectionProps> = ({
  allQuotes,
  currentTimeSlot,
  recentlyViewedIds,
  favoriteIds,
  onSelectAsFeatured,
  onToggleFavorite,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('slot');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentSlotConfig = TIME_SLOTS[currentTimeSlot];

  const currentContextTitle = useMemo(() => {
    if (searchQuery.trim()) {
      return `Search: “${searchQuery.trim()}”`;
    }
    switch (activeTab) {
      case 'slot':
        return `${currentSlotConfig?.label || 'Circadian'} Curations`;
      case 'trending':
        return 'Wisdom Gems';
      case 'history':
        return 'Recently Viewed';
      case 'random':
        return 'Serendipity Shuffle';
    }
  }, [searchQuery, activeTab, currentSlotConfig]);

  // Tab 1: Current Slot quotes
  const slotQuotes = useMemo(() => {
    return allQuotes.filter((q) => q.timeCategories.includes(currentTimeSlot));
  }, [allQuotes, currentTimeSlot]);

  // Tab 2: Trending / Reader favorites (curated high-impact quotes)
  const trendingQuotes = useMemo(() => {
    const curatedIds = [
      'quote-001', 'quote-003', 'quote-011', 'quote-013', 'quote-021',
      'quote-023', 'quote-031', 'quote-035', 'quote-042', 'quote-051',
      'quote-061', 'quote-068', 'quote-074',
    ];
    return allQuotes.filter((q) => curatedIds.includes(q.id));
  }, [allQuotes]);

  // Tab 3: History (recently viewed)
  const historyQuotes = useMemo(() => {
    return recentlyViewedIds
      .map((id) => allQuotes.find((q) => q.id === id))
      .filter((q): q is Quote => Boolean(q));
  }, [allQuotes, recentlyViewedIds]);

  // Tab 4: Random / Shuffle with deterministic seed so it stays stable while reading
  const [randomSeed, setRandomSeed] = useState(1);
  const randomQuotes = useMemo(() => {
    if (allQuotes.length === 0) return [];
    const pool = [...allQuotes];
    let seed = (randomSeed * 9301 + 49297) % 233280;
    for (let i = pool.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 9);
  }, [allQuotes, randomSeed]);

  // Active pool by tab
  const basePool = useMemo(() => {
    switch (activeTab) {
      case 'slot':
        return slotQuotes;
      case 'trending':
        return trendingQuotes;
      case 'history':
        return historyQuotes;
      case 'random':
        return randomQuotes;
    }
  }, [activeTab, slotQuotes, trendingQuotes, historyQuotes, randomQuotes]);

  // Apply search query filter if typed
  const displayedQuotes = useMemo(() => {
    if (!searchQuery.trim()) return basePool;
    return searchQuotes(allQuotes, searchQuery);
  }, [basePool, allQuotes, searchQuery]);

  const handleCopyQuote = async (quote: Quote, e: React.MouseEvent) => {
    e.stopPropagation();
    const formatted = `“${quote.text}” — ${quote.author}${quote.source ? ` (${quote.source})` : ''}`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedId(quote.id);
      onShowToast('Quote copied to clipboard', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onShowToast('Could not copy quote', 'info');
    }
  };

  const handleToggleFav = (quoteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(quoteId);
  };

  return (
    <section id="explore-section" className="w-full max-w-6xl mx-auto px-3 sm:px-4 pb-20 pt-4">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-[#E8E4DC] dark:border-[#262626]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-4 h-4 text-[#737B5B] dark:text-[#9CA87F]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737B5B] dark:text-[#9CA87F]">
              Discovery Archive
            </span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#171717] dark:text-[#F4F1EA]">
            Explore More Quotes
          </h2>
        </div>

        {/* Search input across entire database */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search text, author, or book..."
            className="w-full pl-9 pr-4 py-2.5 sm:py-2 text-xs rounded-xl border border-[#E8E4DC] dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] text-[#171717] dark:text-[#F4F1EA] placeholder-[#999999] focus:outline-none focus:ring-1 focus:ring-[#737B5B]"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 no-scrollbar touch-pan-x px-0.5">
        <button
          onClick={() => {
            setActiveTab('slot');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 min-h-[38px] px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'slot' && !searchQuery
              ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] shadow-xs'
              : 'border border-[#E8E4DC] dark:border-[#262626] bg-white/60 dark:bg-[#1E1E1E]/60 text-[#666666] dark:text-[#A3A3A3] hover:border-[#737B5B]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{currentSlotConfig.label} Curations ({slotQuotes.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('trending');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 min-h-[38px] px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'trending' && !searchQuery
              ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] shadow-xs'
              : 'border border-[#E8E4DC] dark:border-[#262626] bg-white/60 dark:bg-[#1E1E1E]/60 text-[#666666] dark:text-[#A3A3A3] hover:border-[#737B5B]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Wisdom Gems ({trendingQuotes.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 min-h-[38px] px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'history' && !searchQuery
              ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] shadow-xs'
              : 'border border-[#E8E4DC] dark:border-[#262626] bg-white/60 dark:bg-[#1E1E1E]/60 text-[#666666] dark:text-[#A3A3A3] hover:border-[#737B5B]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Recently Viewed ({historyQuotes.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('random');
            setSearchQuery('');
            setRandomSeed((s) => s + 1);
          }}
          className={`flex items-center gap-2 min-h-[38px] px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'random' && !searchQuery
              ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] shadow-xs'
              : 'border border-[#E8E4DC] dark:border-[#262626] bg-white/60 dark:bg-[#1E1E1E]/60 text-[#666666] dark:text-[#A3A3A3] hover:border-[#737B5B]'
          }`}
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Serendipity Shuffle</span>
        </button>
      </div>

      {/* Quote Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {displayedQuotes.map((q) => {
          const isFav = favoriteIds.includes(q.id);
          const isCopied = copiedId === q.id;

          return (
            <div
              key={q.id}
              onClick={() => onSelectAsFeatured(q, displayedQuotes, currentContextTitle)}
              className="group relative flex flex-col justify-between p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1E1E1E] border border-[#E8E4DC] dark:border-[#2A2A2A] hover:border-[#737B5B] dark:hover:border-[#8F9779] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-left"
            >
              <div>
                {/* Genres & Time Slot tag */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5 sm:mb-3">
                  <span className="text-[10px] font-mono-time uppercase tracking-wider text-[#737B5B] dark:text-[#9CA87F] bg-[#737B5B]/10 px-2 py-0.5 rounded">
                    {TIME_SLOTS[q.timeCategories[0]]?.label || 'Timeless'}
                  </span>
                  <span className="text-[10px] text-[#888888]">
                    {q.genres[0]}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="font-serif-quote text-sm sm:text-base md:text-lg text-[#171717] dark:text-[#F4F1EA] leading-relaxed mb-3 sm:mb-4 line-clamp-4">
                  “{q.text}”
                </p>
              </div>

              {/* Author & Actions Footer */}
              <div className="pt-3 sm:pt-4 border-t border-[#F2EFE8] dark:border-[#282828] flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-semibold text-[#171717] dark:text-[#F4F1EA] block font-sans truncate">
                    {q.author}
                  </span>
                  {q.source && (
                    <span className="text-[11px] text-[#888888] italic block truncate max-w-[160px] sm:max-w-[180px]">
                      {q.source}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleCopyQuote(q, e)}
                    className="p-2 sm:p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#666666] dark:text-[#AAAAAA] hover:text-[#171717] dark:hover:text-white cursor-pointer"
                    title="Copy quote"
                    aria-label="Copy quote"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={(e) => handleToggleFav(q.id, e)}
                    className={`p-2 sm:p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                      isFav ? 'text-rose-500' : 'text-[#666666] dark:text-[#AAAAAA] hover:text-rose-500'
                    }`}
                    title={isFav ? 'Remove favorite' : 'Add to favorites'}
                    aria-label="Bookmark quote"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                  </button>

                  <span className="p-1 text-stone-300 dark:text-stone-700 group-hover:text-[#737B5B] transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayedQuotes.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-white/40 dark:bg-[#1E1E1E]/40 border border-dashed border-[#E8E4DC] dark:border-[#2A2A2A]">
          <p className="text-sm text-[#777777] dark:text-[#888888] font-sans">
            {searchQuery
              ? `No quotes found matching “${searchQuery}”.`
              : 'No quotes recorded in this section yet.'}
          </p>
        </div>
      )}
    </section>
  );
};
