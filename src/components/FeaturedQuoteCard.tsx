import React, { useState } from 'react';
import {
  Bookmark,
  Copy,
  Share2,
  ArrowRight,
  ArrowLeft,
  Check,
  Info,
  BadgeCheck,
} from 'lucide-react';
import type { Quote, SelectionReason } from '../types';
import { GENRE_METADATA } from '../data/genreMetadata';

interface FeaturedQuoteCardProps {
  quote: Quote;
  reason: SelectionReason;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onNextQuote: () => void;
  onPrevQuote?: () => void;
  onShowToast: (message: string, type?: 'success' | 'info') => void;
  collectionInfo?: {
    current: number;
    total: number;
  };
  isCuratedContext?: boolean;
  onReturnToCircadian?: () => void;
}

export const FeaturedQuoteCard: React.FC<FeaturedQuoteCardProps> = ({
  quote,
  reason,
  isFavorite,
  onToggleFavorite,
  onNextQuote,
  onPrevQuote,
  onShowToast,
  collectionInfo,
  isCuratedContext,
  onReturnToCircadian,
}) => {
  const [copied, setCopied] = useState(false);
  const [isFading, setIsFading] = useState(false);

  // Smooth cross-fade transition helper
  const handleTransition = (action: () => void) => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      action();
      setTimeout(() => {
        setIsFading(false);
      }, 40);
    }, 160);
  };

  // Copy to clipboard formatting
  const handleCopy = async () => {
    const formatted = `“${quote.text}”\n\n— ${quote.author}${quote.source ? ` (${quote.source})` : ''}\nShared via ChronoQuotes`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formatted);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = formatted;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      onShowToast('Quote copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Could not copy quote', 'info');
    }
  };

  // Web Share API
  const handleShare = async () => {
    const shareData = {
      title: `Quote by ${quote.author}`,
      text: `“${quote.text}” — ${quote.author}${quote.source ? ` (${quote.source})` : ''}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        onShowToast('Shared successfully', 'success');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <article className="relative w-full max-w-4xl mx-auto px-3 sm:px-4 mb-8 sm:mb-16">
      {/* Editorial Card Surface */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1E1E1E] border border-[#E8E4DC] dark:border-[#2A2A2A] shadow-lg shadow-black/[0.03] dark:shadow-black/[0.2] p-5 sm:p-8 md:p-14 transition-colors duration-300">
        
        {/* Top Metadata Row: Selection Reason + Collection Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-[#F0ECE1] dark:border-[#282828]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-[#737B5B] dark:bg-[#9CA87F] shrink-0" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[#737B5B] dark:text-[#9CA87F] font-sans">
              {reason.label}
            </span>
            {reason.isRelaxedFallback && (
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                Expanded Slot
              </span>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-xs">
            {isCuratedContext && onReturnToCircadian && (
              <button
                onClick={onReturnToCircadian}
                className="text-[11px] font-sans text-[#737B5B] dark:text-[#9CA87F] hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                title="Return to the live circadian recommendation stream"
              >
                <span>← Circadian Stream</span>
              </button>
            )}

            {collectionInfo && (
              <div className="text-xs font-mono-time text-[#888888] dark:text-[#777777] flex items-center gap-1.5 ml-auto sm:ml-0">
                <span>Curated #{collectionInfo.current}</span>
                <span className="opacity-50">/</span>
                <span>{collectionInfo.total} in pool</span>
              </div>
            )}
          </div>
        </div>

        {/* Relaxed filter subtle notice if applicable */}
        {reason.isRelaxedFallback && (
          <div className="mb-5 sm:mb-6 px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#252525] border border-[#EBE6DB] dark:border-[#333333] text-xs text-[#666666] dark:text-[#A3A3A3] flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#737B5B] shrink-0" />
            <span>{reason.description}</span>
          </div>
        )}

        {/* Centerpiece: Quote Text with Smooth Fade Dissolve */}
        <div
          className={`transition-all duration-200 ease-out ${
            isFading ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'
          }`}
        >
          <blockquote className="relative my-3 sm:my-6">
            <p className="font-serif-quote text-xl sm:text-2xl md:text-3xl lg:text-[38px] leading-[1.38] sm:leading-[1.32] text-[#171717] dark:text-[#F4F1EA] tracking-normal font-normal text-balance">
              “{quote.text}”
            </p>
          </blockquote>

          {/* Author Attribution & Verified Source */}
          <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-3">
            <cite className="not-italic flex items-center gap-2 font-sans font-semibold text-base sm:text-xl text-[#171717] dark:text-[#F4F1EA]">
              <span className="text-[#737B5B] dark:text-[#9CA87F] font-light">—</span>
              <span>{quote.author}</span>
              {quote.isVerified && (
                <span title="Verified Attribution">
                  <BadgeCheck className="w-4 h-4 text-[#737B5B] dark:text-[#9CA87F] inline-block" />
                </span>
              )}
            </cite>

            {quote.source && (
              <span className="text-xs sm:text-sm font-sans text-[#777777] dark:text-[#888888] italic sm:border-l sm:border-stone-300 dark:sm:border-stone-700 sm:pl-3">
                {quote.source}
              </span>
            )}
          </div>
        </div>

        {/* Genre Tags & Action Toolbar */}
        <div className="mt-6 sm:mt-10 pt-5 sm:pt-6 border-t border-[#F0ECE1] dark:border-[#282828] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5 items-center">
            {quote.genres.map((g) => {
              const info = GENRE_METADATA[g];
              return (
                <span
                  key={g}
                  className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-sans font-medium border ${
                    info ? info.badgeColor : 'bg-[#F7F5F0] dark:bg-[#262626] text-[#555555] dark:text-[#BBBBBB] border-[#E8E4DC] dark:border-[#333333]'
                  }`}
                >
                  {g}
                </span>
              );
            })}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Bookmark */}
              <button
                onClick={() => onToggleFavorite(quote.id)}
                className={`p-2 sm:p-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center ${
                  isFavorite
                    ? 'border-rose-400 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'border-[#E8E4DC] dark:border-[#2E2E2E] bg-white dark:bg-[#242424] text-[#555555] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white hover:border-[#737B5B]'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>

              {/* Copy */}
              <button
                onClick={handleCopy}
                className="p-2 sm:p-2.5 rounded-xl border border-[#E8E4DC] dark:border-[#2E2E2E] bg-white dark:bg-[#242424] text-[#555555] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white hover:border-[#737B5B] transition-all cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                title="Copy quote to clipboard"
                aria-label="Copy quote to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="p-2 sm:p-2.5 rounded-xl border border-[#E8E4DC] dark:border-[#2E2E2E] bg-white dark:bg-[#242424] text-[#555555] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white hover:border-[#737B5B] transition-all cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                title="Share quote"
                aria-label="Share quote"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Previous Quote Button */}
              {onPrevQuote && (
                <button
                  onClick={() => handleTransition(onPrevQuote)}
                  className="p-2 sm:p-2.5 rounded-xl border border-[#E8E4DC] dark:border-[#2E2E2E] bg-white dark:bg-[#242424] text-[#555555] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white hover:border-[#737B5B] transition-all cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                  title="Previous quote in pool"
                  aria-label="Previous quote in pool"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Next Quote Button */}
            <button
              onClick={() => handleTransition(onNextQuote)}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] font-medium text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2 shadow-sm cursor-pointer min-h-[38px]"
              aria-label="Discover next quote in pool"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
