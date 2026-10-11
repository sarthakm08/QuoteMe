import type { Quote } from '../types';
import { SEED_QUOTES } from '../data/seedQuotes';
import hfQuotesRaw from '../data/huggingfaceQuotes.json';
import loveQuotesRaw from '../data/loveQuotes.json';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const HF_QUOTES: Quote[] = (hfQuotesRaw as Quote[]) || [];
const LOVE_QUOTES: Quote[] = (loveQuotesRaw as Quote[]) || [];



const LOCAL_CUSTOM_QUOTES_KEY = 'chronoquotes_custom_quotes_v1';

export interface QuoteServiceStatus {
  source: 'Supabase Database' | 'Local Verified Seed Data';
  isLiveDb: boolean;
  totalQuotes: number;
}

export class QuoteService {
  private static localQuotesCache: Quote[] | null = null;

  private static getStoredCustomQuotes(): Quote[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(LOCAL_CUSTOM_QUOTES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static saveStoredCustomQuote(quote: Quote): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getStoredCustomQuotes();
      localStorage.setItem(LOCAL_CUSTOM_QUOTES_KEY, JSON.stringify([quote, ...current]));
    } catch (e) {
      console.warn('Failed to save custom quote:', e);
    }
  }

  /**
   * Fetches all quotes, prioritizing Supabase if active, otherwise using seeded & custom quotes.
   */
  public static async fetchQuotes(): Promise<{ quotes: Quote[]; status: QuoteServiceStatus }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: Quote[] = data.map((item: any) => ({
            id: item.id,
            text: item.text,
            author: item.author,
            genres: item.genres || [],
            timeCategories: item.time_categories || item.timeCategories || [],
            source: item.source || undefined,
            language: item.language || 'en',
            createdAt: item.created_at || item.createdAt,
            isVerified: item.is_verified ?? item.isVerified ?? true,
          }));

          this.localQuotesCache = mapped;
          return {
            quotes: mapped,
            status: {
              source: 'Supabase Database',
              isLiveDb: true,
              totalQuotes: mapped.length,
            },
          };
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local seed data:', err);
      }
    }

    // Fallback: SEED_QUOTES + HF_QUOTES + LOVE_QUOTES + local custom quotes
    const custom = this.getStoredCustomQuotes();
    const combined = [...custom, ...SEED_QUOTES, ...HF_QUOTES, ...LOVE_QUOTES];
    this.localQuotesCache = combined;

    return {
      quotes: combined,
      status: {
        source: 'Local Verified Seed Data',
        isLiveDb: false,
        totalQuotes: combined.length,
      },
    };
  }

  /**
   * Add a new quote (supports both Supabase mutation or local persistence)
   */
  public static async addQuote(newQuoteData: Omit<Quote, 'id' | 'createdAt'>): Promise<Quote> {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();
    const fullQuote: Quote = {
      ...newQuoteData,
      id,
      createdAt,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('quotes').insert({
          id,
          text: fullQuote.text,
          author: fullQuote.author,
          genres: fullQuote.genres,
          time_categories: fullQuote.timeCategories,
          source: fullQuote.source,
          language: fullQuote.language,
          is_verified: fullQuote.isVerified,
          created_at: createdAt,
        });

        if (!error) {
          return fullQuote;
        }
      } catch (err) {
        console.warn('Supabase insert failed, falling back to localStorage:', err);
      }
    }

    // Fallback save to localStorage
    this.saveStoredCustomQuote(fullQuote);
    if (this.localQuotesCache) {
      this.localQuotesCache = [fullQuote, ...this.localQuotesCache];
    }
    return fullQuote;
  }
}
