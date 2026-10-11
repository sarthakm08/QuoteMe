import type { Genre, Quote, SelectionReason, TimeSlot } from '../types';
import { TIME_SLOTS } from './timeEngine';

export interface AlgorithmOptions {
  quotes: Quote[];
  selectedGenres: Genre[];
  timeSlot: TimeSlot;
  recentlyViewedIds?: string[];
  favoriteIds?: string[];
  currentIndex?: number;
}

export interface RecommendationResult {
  quote: Quote;
  reason: SelectionReason;
  totalMatchingQuotes: number;
  filteredPool: Quote[];
  isFallback: boolean;
  currentIndex: number;
}

/**
 * Filter and rank quotes according to selected genres, current time category, and viewing history.
 * Maintains a stable, deterministic pool order so transitions (Next/Prev/Curations) are smooth and non-random.
 */
export function getRecommendedQuotes(options: AlgorithmOptions): RecommendationResult | null {
  const {
    quotes,
    selectedGenres,
    timeSlot,
    recentlyViewedIds = [],
    currentIndex = 0,
  } = options;

  if (!quotes || quotes.length === 0) {
    return null;
  }

  const hasGenreFilter = selectedGenres.length > 0;
  const slotConfig = TIME_SLOTS[timeSlot];

  // Stage 1: Exact Match vs Progressive Relaxation
  let matchingQuotes: Quote[] = [];
  let isFallback = false;
  let reason: SelectionReason;

  if (hasGenreFilter) {
    // Filter quotes that contain at least one selected genre
    const genreFiltered = quotes.filter((q) =>
      q.genres.some((g) => selectedGenres.includes(g))
    );

    // Try finding quotes matching both selected genres AND current timeSlot
    const intersection = genreFiltered.filter((q) =>
      q.timeCategories.includes(timeSlot)
    );

    if (intersection.length > 0) {
      matchingQuotes = intersection;
      isFallback = false;
      reason = {
        type: 'perfect_match',
        label: `${slotConfig.label} & ${selectedGenres.slice(0, 2).join(', ')}${selectedGenres.length > 2 ? ' +' + (selectedGenres.length - 2) : ''}`,
        description: `Harmonized with your ${slotConfig.label.toLowerCase()} rhythm and chosen genres.`,
        isRelaxedFallback: false,
      };
    } else {
      // Progressive relaxation: Keep selected genres, relax time slot
      matchingQuotes = genreFiltered;
      isFallback = true;
      reason = {
        type: 'genre_match',
        label: `Timeless ${selectedGenres[0]}`,
        description: `Time slot relaxed to highlight essential wisdom matching your chosen genre.`,
        isRelaxedFallback: true,
      };
    }
  } else {
    // No genre filter selected: strictly match current timeSlot
    const timeFiltered = quotes.filter((q) =>
      q.timeCategories.includes(timeSlot)
    );

    if (timeFiltered.length > 0) {
      matchingQuotes = timeFiltered;
      isFallback = false;
      reason = {
        type: 'time_match',
        label: `${slotConfig.label} Curations`,
        description: `Handpicked for ${slotConfig.timeRange} in IST (${slotConfig.greeting}).`,
        isRelaxedFallback: false,
      };
    } else {
      // Fallback to all quotes
      matchingQuotes = quotes;
      isFallback = true;
      reason = {
        type: 'serendipity',
        label: 'Serendipitous Discovery',
        description: 'Drawing from timeless wisdom across all moments.',
        isRelaxedFallback: true,
      };
    }
  }

  if (matchingQuotes.length === 0) {
    matchingQuotes = quotes;
  }

  // Stage 2: Create a deterministic, STABLE pool
  // Unviewed quotes are prioritized over viewed quotes.
  // Within each group, quotes are sorted by relevance score, then deterministically by id.
  const scoreQuote = (q: Quote) => {
    let score = 0;
    if (hasGenreFilter) {
      const matchCount = q.genres.filter((g) => selectedGenres.includes(g)).length;
      score += matchCount * 10;
    }
    if (q.timeCategories.includes(timeSlot)) {
      score += 5;
    }
    return score;
  };

  const unviewed = matchingQuotes.filter((q) => !recentlyViewedIds.includes(q.id));
  const viewed = matchingQuotes.filter((q) => recentlyViewedIds.includes(q.id));

  const sortGroup = (arr: Quote[]) =>
    [...arr].sort((a, b) => {
      const scoreDiff = scoreQuote(b) - scoreQuote(a);
      if (scoreDiff !== 0) return scoreDiff;
      return a.id.localeCompare(b.id);
    });

  const stablePool = [...sortGroup(unviewed), ...sortGroup(viewed)];

  // Safe wrap-around index
  const safeIndex =
    stablePool.length > 0
      ? ((currentIndex % stablePool.length) + stablePool.length) % stablePool.length
      : 0;
  const selectedQuote = stablePool[safeIndex] || stablePool[0];

  return {
    quote: selectedQuote,
    reason,
    totalMatchingQuotes: stablePool.length,
    filteredPool: stablePool,
    isFallback,
    currentIndex: safeIndex,
  };
}

/**
 * Searches quotes by free-form query (text, author, source, genre)
 */
export function searchQuotes(quotes: Quote[], query: string): Quote[] {
  if (!query || query.trim() === '') {
    return quotes;
  }
  const q = query.toLowerCase().trim();
  return quotes.filter(
    (item) =>
      item.text.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q) ||
      (item.source && item.source.toLowerCase().includes(q)) ||
      item.genres.some((g) => g.toLowerCase().includes(q))
  );
}
