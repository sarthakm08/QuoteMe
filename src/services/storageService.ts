import type { UserPreferences } from '../types';

const STORAGE_KEY = 'chronoquotes_user_preferences_v1';

const DEFAULT_PREFERENCES: UserPreferences = {
  selectedGenres: [],
  favorites: [],
  recentlyViewed: [],
  theme: 'light',
  manualTimeSlot: null,
};

export function loadUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      selectedGenres: Array.isArray(parsed.selectedGenres) ? parsed.selectedGenres : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      recentlyViewed: Array.isArray(parsed.recentlyViewed) ? parsed.recentlyViewed : [],
      theme: ['light', 'dark', 'system'].includes(parsed.theme) ? parsed.theme : 'light',
      manualTimeSlot: parsed.manualTimeSlot || null,
    };
  } catch (e) {
    console.warn('Failed to load user preferences from localStorage:', e);
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Failed to save user preferences to localStorage:', e);
  }
}

export function addRecentlyViewed(quoteId: string, currentList: string[]): string[] {
  const filtered = currentList.filter((id) => id !== quoteId);
  const updated = [quoteId, ...filtered].slice(0, 30);
  return updated;
}

export function toggleFavoriteId(quoteId: string, currentFavorites: string[]): string[] {
  if (currentFavorites.includes(quoteId)) {
    return currentFavorites.filter((id) => id !== quoteId);
  } else {
    return [quoteId, ...currentFavorites];
  }
}
