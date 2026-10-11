import { describe, it, expect } from 'vitest';
import { getRecommendedQuotes, searchQuotes } from '../src/utils/quoteAlgorithm';
import { SEED_QUOTES } from '../src/data/seedQuotes';
import type { Quote } from '../src/types';

describe('Quote Recommendation & Filtering Algorithm', () => {
  it('returns quotes matching the exact time slot when no genres are selected', () => {
    const res = getRecommendedQuotes({
      quotes: SEED_QUOTES,
      selectedGenres: [],
      timeSlot: 'early_morning',
    });

    expect(res).not.toBeNull();
    expect(res?.quote.timeCategories).toContain('early_morning');
    expect(res?.isFallback).toBe(false);
    expect(res?.reason.type).toBe('time_match');
  });

  it('prioritizes quotes matching both selected genre and current time slot', () => {
    const res = getRecommendedQuotes({
      quotes: SEED_QUOTES,
      selectedGenres: ['Stoicism'],
      timeSlot: 'early_morning',
    });

    expect(res).not.toBeNull();
    expect(res?.quote.genres).toContain('Stoicism');
    expect(res?.quote.timeCategories).toContain('early_morning');
    expect(res?.isFallback).toBe(false);
  });

  it('progressively relaxes time slot while preserving user selected genre if no direct match exists in slot', () => {
    // Suppose a genre exists in the DB, but has no quote in 'early_morning'
    // Create a mock dataset with isolated genre
    const mockQuotes: Quote[] = [
      {
        id: 'q1',
        text: 'Night thought',
        author: 'Night Author',
        genres: ['Dark Academia'],
        timeCategories: ['late_night'],
        language: 'en',
        isVerified: true,
      },
      {
        id: 'q2',
        text: 'Morning thought',
        author: 'Morning Author',
        genres: ['Motivation'],
        timeCategories: ['early_morning'],
        language: 'en',
        isVerified: true,
      },
    ];

    // User is in early_morning, but selects 'Dark Academia'
    const res = getRecommendedQuotes({
      quotes: mockQuotes,
      selectedGenres: ['Dark Academia'],
      timeSlot: 'early_morning',
    });

    expect(res).not.toBeNull();
    expect(res?.quote.genres).toContain('Dark Academia');
    expect(res?.isFallback).toBe(true);
    expect(res?.reason.isRelaxedFallback).toBe(true);
    expect(res?.reason.type).toBe('genre_match');
  });

  it('deprioritizes recently viewed quotes so user discovers unviewed quotes first', () => {
    const earlyQuotes = SEED_QUOTES.filter((q) => q.timeCategories.includes('early_morning'));
    const firstQuoteId = earlyQuotes[0].id;

    const res = getRecommendedQuotes({
      quotes: SEED_QUOTES,
      selectedGenres: [],
      timeSlot: 'early_morning',
      recentlyViewedIds: [firstQuoteId],
      currentIndex: 0,
    });

    expect(res).not.toBeNull();
    expect(res?.quote.id).not.toBe(firstQuoteId);
  });

  it('searches quotes accurately by author, text, source, or genre', () => {
    const marcusMatches = searchQuotes(SEED_QUOTES, 'Marcus Aurelius');
    expect(marcusMatches.length).toBeGreaterThan(0);
    marcusMatches.forEach((m) => expect(m.author).toBe('Marcus Aurelius'));

    const gitaMatches = searchQuotes(SEED_QUOTES, 'fruits of action');
    expect(gitaMatches.length).toBeGreaterThan(0);
    expect(gitaMatches[0].text).toContain('fruits of action');

    const genreMatches = searchQuotes(SEED_QUOTES, 'Bhagavad Gita');
    expect(genreMatches.length).toBeGreaterThan(0);
  });

  it('navigates deterministically and sequentially through pool without skipping quotes', () => {
    const q0 = getRecommendedQuotes({
      quotes: SEED_QUOTES,
      selectedGenres: [],
      timeSlot: 'early_morning',
      currentIndex: 0,
    });
    const q1 = getRecommendedQuotes({
      quotes: SEED_QUOTES,
      selectedGenres: [],
      timeSlot: 'early_morning',
      currentIndex: 1,
    });
    const q2 = getRecommendedQuotes({
      quotes: SEED_QUOTES,
      selectedGenres: [],
      timeSlot: 'early_morning',
      currentIndex: 2,
    });

    expect(q0).not.toBeNull();
    expect(q1).not.toBeNull();
    expect(q2).not.toBeNull();
    expect(q0?.quote.id).not.toBe(q1?.quote.id);
    expect(q1?.quote.id).not.toBe(q2?.quote.id);
    expect(q0?.currentIndex).toBe(0);
    expect(q1?.currentIndex).toBe(1);
    expect(q2?.currentIndex).toBe(2);
  });
});
