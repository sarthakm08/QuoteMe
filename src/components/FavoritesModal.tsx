import React, { useState, useMemo } from 'react';
import { X, Bookmark, Trash2, Copy, Check, Download, ArrowRight } from 'lucide-react';
import type { Quote } from '../types';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  allQuotes: Quote[];
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
  onSelectQuote: (quote: Quote, contextPool?: Quote[], contextTitle?: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info') => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  allQuotes,
  favoriteIds,
  onToggleFavorite,
  onSelectQuote,
  onShowToast,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const favoriteQuotes = useMemo(() => {
    return favoriteIds
      .map((id) => allQuotes.find((q) => q.id === id))
      .filter((q): q is Quote => Boolean(q));
  }, [allQuotes, favoriteIds]);

  // Extract distinct genres from favorites
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    favoriteQuotes.forEach((q) => q.genres.forEach((g) => set.add(g)));
    return Array.from(set);
  }, [favoriteQuotes]);

  const filtered = useMemo(() => {
    if (selectedGenre === 'all') return favoriteQuotes;
    return favoriteQuotes.filter((q) => q.genres.includes(selectedGenre as any));
  }, [favoriteQuotes, selectedGenre]);

  if (!isOpen) return null;

  const handleCopy = async (quote: Quote) => {
    const text = `“${quote.text}” — ${quote.author}${quote.source ? ` (${quote.source})` : ''}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(quote.id);
      onShowToast('Quote copied to clipboard', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onShowToast('Could not copy quote', 'info');
    }
  };

  const handleExportAll = () => {
    if (favoriteQuotes.length === 0) return;
    const content = favoriteQuotes
      .map((q, idx) => `${idx + 1}. “${q.text}”\n   — ${q.author}${q.source ? ` (${q.source})` : ''}\n   Themes: ${q.genres.join(', ')}\n`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ChronoQuotes_Favorites_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Favorites exported as text file', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[90dvh] bg-[#F7F5F0] dark:bg-[#1E1E1E] rounded-2xl sm:rounded-3xl border border-[#E8E4DC] dark:border-[#2C2C2C] shadow-2xl flex flex-col overflow-hidden text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="favorites-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#E8E4DC] dark:border-[#2C2C2C] shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 id="favorites-title" className="font-editorial text-lg sm:text-xl font-semibold text-[#171717] dark:text-[#F4F1EA]">
                Saved Favorites
              </h3>
              <p className="text-[11px] sm:text-xs text-[#777777] dark:text-[#888888] font-sans">
                {favoriteQuotes.length} {favoriteQuotes.length === 1 ? 'quote' : 'quotes'} collected in your personal archive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {favoriteQuotes.length > 0 && (
              <button
                onClick={handleExportAll}
                className="p-2 rounded-xl border border-[#E8E4DC] dark:border-[#2C2C2C] hover:bg-black/5 dark:hover:bg-white/5 text-[#555555] dark:text-[#AAAAAA] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                title="Export favorites as text"
                aria-label="Export favorites"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-[#E8E4DC] dark:border-[#2C2C2C] hover:bg-black/5 dark:hover:bg-white/5 text-[#555555] dark:text-[#AAAAAA] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Genre Filter Bar if multiple genres present */}
        {availableGenres.length > 1 && (
          <div className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white/50 dark:bg-[#181818]/50 border-b border-[#E8E4DC] dark:border-[#2C2C2C] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => setSelectedGenre('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedGenre === 'all'
                  ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717]'
                  : 'text-[#666666] dark:text-[#888888] hover:text-[#171717] dark:hover:text-[#F4F1EA]'
              }`}
            >
              All ({favoriteQuotes.length})
            </button>
            {availableGenres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedGenre === g
                    ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717]'
                    : 'text-[#666666] dark:text-[#888888] hover:text-[#171717] dark:hover:text-[#F4F1EA]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {/* Content list */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5 sm:space-y-4">
          {filtered.map((quote) => {
            const isCopied = copiedId === quote.id;
            return (
              <div
                key={quote.id}
                className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#252525] border border-[#E8E4DC] dark:border-[#333333] hover:border-[#737B5B] transition-colors"
              >
                <blockquote className="font-serif-quote text-sm sm:text-base md:text-lg text-[#171717] dark:text-[#F4F1EA] leading-relaxed mb-3">
                  “{quote.text}”
                </blockquote>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F2EFE8] dark:border-[#2D2D2D]">
                  <div className="text-xs font-sans">
                    <span className="font-semibold text-[#171717] dark:text-[#F4F1EA]">{quote.author}</span>
                    {quote.source && <span className="text-[#888888] italic ml-1">({quote.source})</span>}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(quote)}
                      className="p-1.5 rounded-lg text-[#666666] dark:text-[#AAAAAA] hover:text-[#171717] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="Copy"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onToggleFavorite(quote.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 transition-colors"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onSelectQuote(quote, filtered, 'Saved Favorites');
                        onClose();
                      }}
                      className="ml-1 text-xs px-2.5 py-1 rounded-lg bg-[#737B5B]/15 text-[#737B5B] dark:text-[#9CA87F] hover:bg-[#737B5B]/25 transition-colors flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <span>Focus</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Bookmark className="w-8 h-8 mx-auto text-[#737B5B]/30 mb-3" />
              <p className="font-editorial text-lg text-[#171717] dark:text-[#F4F1EA] mb-1">
                Your archive is quiet
              </p>
              <p className="text-xs text-[#777777] dark:text-[#888888] max-w-xs mx-auto">
                Bookmark quotes as you journey through the day to revisit words that spark your resolve.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
