import type { Genre } from '../types';

export interface GenreInfo {
  name: Genre;
  iconName: string;
  tagline: string;
  badgeColor: string;
}

export const GENRE_LIST: Genre[] = [
  'Motivation',
  'Discipline & Consistency',
  'Stoicism',
  'Philosophy',
  'Love & Relationships',
  'Self-Respect & Boundaries',
  'Success & Ambition',
  'Psychology',
  'Mindfulness',
  'Confidence',
  'Existentialism',
  'Creativity',
  'Leadership',
  'Life Lessons',
  'Dark Academia',
  'Spirituality',
  'Bhagavad Gita & Indian Wisdom',
  'Minimalism',
];

export const GENRE_METADATA: Record<Genre, GenreInfo> = {
  'Motivation': {
    name: 'Motivation',
    iconName: 'Flame',
    tagline: 'Catalysts of spirit and ignition of purpose',
    badgeColor: 'border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/5',
  },
  'Discipline & Consistency': {
    name: 'Discipline & Consistency',
    iconName: 'Hourglass',
    tagline: 'The quiet compounding of daily devotion',
    badgeColor: 'border-orange-500/30 text-orange-700 dark:text-orange-300 bg-orange-500/5',
  },
  'Stoicism': {
    name: 'Stoicism',
    iconName: 'Shield',
    tagline: 'Mastery over perception, resilience in adversity',
    badgeColor: 'border-stone-500/30 text-stone-700 dark:text-stone-300 bg-stone-500/5',
  },
  'Philosophy': {
    name: 'Philosophy',
    iconName: 'BookOpen',
    tagline: 'The timeless inquiry into truth and meaning',
    badgeColor: 'border-emerald-600/30 text-emerald-700 dark:text-emerald-300 bg-emerald-600/5',
  },
  'Love & Relationships': {
    name: 'Love & Relationships',
    iconName: 'Heart',
    tagline: 'Deep communion, kinship, and reciprocal grace',
    badgeColor: 'border-rose-500/30 text-rose-700 dark:text-rose-300 bg-rose-500/5',
  },
  'Self-Respect & Boundaries': {
    name: 'Self-Respect & Boundaries',
    iconName: 'Key',
    tagline: 'Preserving dignity and guarding internal peace',
    badgeColor: 'border-indigo-500/30 text-indigo-700 dark:text-indigo-300 bg-indigo-500/5',
  },
  'Success & Ambition': {
    name: 'Success & Ambition',
    iconName: 'TrendingUp',
    tagline: 'Audacity of vision and ruthless execution',
    badgeColor: 'border-yellow-600/30 text-yellow-700 dark:text-yellow-300 bg-yellow-600/5',
  },
  'Psychology': {
    name: 'Psychology',
    iconName: 'Brain',
    tagline: 'The architecture of perception and human behavior',
    badgeColor: 'border-violet-500/30 text-violet-700 dark:text-violet-300 bg-violet-500/5',
  },
  'Mindfulness': {
    name: 'Mindfulness',
    iconName: 'Sparkles',
    tagline: 'Anchoring awareness in the sacred present',
    badgeColor: 'border-teal-500/30 text-teal-700 dark:text-teal-300 bg-teal-500/5',
  },
  'Confidence': {
    name: 'Confidence',
    iconName: 'Sun',
    tagline: 'Quiet certainty rooted in self-knowledge',
    badgeColor: 'border-amber-600/30 text-amber-700 dark:text-amber-200 bg-amber-600/5',
  },
  'Existentialism': {
    name: 'Existentialism',
    iconName: 'Compass',
    tagline: 'Freedom, dread, and creating one’s own essence',
    badgeColor: 'border-zinc-500/30 text-zinc-700 dark:text-zinc-300 bg-zinc-500/5',
  },
  'Creativity': {
    name: 'Creativity',
    iconName: 'Palette',
    tagline: 'The transcendent spark of imagination and art',
    badgeColor: 'border-purple-500/30 text-purple-700 dark:text-purple-300 bg-purple-500/5',
  },
  'Leadership': {
    name: 'Leadership',
    iconName: 'Crown',
    tagline: 'Guiding through service, vision, and character',
    badgeColor: 'border-blue-600/30 text-blue-700 dark:text-blue-300 bg-blue-600/5',
  },
  'Life Lessons': {
    name: 'Life Lessons',
    iconName: 'Feather',
    tagline: 'Hard-won wisdom passed through generations',
    badgeColor: 'border-slate-500/30 text-slate-700 dark:text-slate-300 bg-slate-500/5',
  },
  'Dark Academia': {
    name: 'Dark Academia',
    iconName: 'Scroll',
    tagline: 'Intricate prose, ancient libraries, and melancholy beauty',
    badgeColor: 'border-[#737B5B]/30 text-[#555C41] dark:text-[#9CA87F] bg-[#737B5B]/5',
  },
  'Spirituality': {
    name: 'Spirituality',
    iconName: 'Moon',
    tagline: 'Union with the infinite and the inner light',
    badgeColor: 'border-cyan-600/30 text-cyan-700 dark:text-cyan-300 bg-cyan-600/5',
  },
  'Bhagavad Gita & Indian Wisdom': {
    name: 'Bhagavad Gita & Indian Wisdom',
    iconName: 'Infinity',
    tagline: 'Karmic duty, unattached action, and supreme consciousness',
    badgeColor: 'border-amber-600/30 text-amber-800 dark:text-amber-300 bg-amber-600/5',
  },
  'Minimalism': {
    name: 'Minimalism',
    iconName: 'Minimize2',
    tagline: 'Elegance of restraint and intentional reduction',
    badgeColor: 'border-neutral-500/30 text-neutral-700 dark:text-neutral-300 bg-neutral-500/5',
  },
};
