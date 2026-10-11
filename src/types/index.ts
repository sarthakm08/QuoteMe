export type TimeSlot = 
  | 'early_morning'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'night'
  | 'late_night';

export interface TimeSlotConfig {
  id: TimeSlot;
  label: string;
  timeRange: string;
  startHour: number; // 24-hour format
  endHour: number;   // 24-hour format (exclusive for endHour:00)
  greeting: string;
  themeDescription: string;
  ambientClass: string;
  accentColor: string;
  themes: string[];
}

export type Genre =
  | 'Motivation'
  | 'Discipline & Consistency'
  | 'Stoicism'
  | 'Philosophy'
  | 'Love & Relationships'
  | 'Self-Respect & Boundaries'
  | 'Success & Ambition'
  | 'Psychology'
  | 'Mindfulness'
  | 'Confidence'
  | 'Existentialism'
  | 'Creativity'
  | 'Leadership'
  | 'Life Lessons'
  | 'Dark Academia'
  | 'Spirituality'
  | 'Bhagavad Gita & Indian Wisdom'
  | 'Minimalism';

export interface Quote {
  id: string;
  text: string;
  author: string;
  genres: Genre[];
  timeCategories: TimeSlot[];
  source?: string;
  language: string;
  createdAt?: string;
  isVerified: boolean;
}

export interface SelectionReason {
  type: 'perfect_match' | 'genre_match' | 'time_match' | 'serendipity' | 'curated_collection';
  label: string;
  description: string;
  isRelaxedFallback?: boolean;
}

export interface UserPreferences {
  selectedGenres: Genre[];
  favorites: string[]; // quote ids
  recentlyViewed: string[]; // quote ids
  theme: 'light' | 'dark' | 'system';
  manualTimeSlot: TimeSlot | null;
}
