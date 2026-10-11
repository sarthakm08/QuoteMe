import type { TimeSlot, TimeSlotConfig } from '../types';

export const TIME_SLOTS: Record<TimeSlot, TimeSlotConfig> = {
  early_morning: {
    id: 'early_morning',
    label: 'Early Morning',
    timeRange: '5:00 AM – 8:00 AM',
    startHour: 5,
    endHour: 8,
    greeting: 'Dawn of Discipline',
    themeDescription: 'Discipline, fresh starts, ambition, habits, focus, and self-improvement.',
    ambientClass: 'ambient-early-morning',
    accentColor: '#D97706', // warm amber
    themes: ['Discipline', 'Fresh Starts', 'Ambition', 'Habits', 'Focus', 'Self-Improvement'],
  },
  morning: {
    id: 'morning',
    label: 'Morning',
    timeRange: '8:00 AM – 12:00 PM',
    startHour: 8,
    endHour: 12,
    greeting: 'Morning Momentum',
    themeDescription: 'Productivity, confidence, creativity, learning, and success.',
    ambientClass: 'ambient-morning',
    accentColor: '#CA8A04', // golden yellow
    themes: ['Productivity', 'Confidence', 'Creativity', 'Learning', 'Success'],
  },
  afternoon: {
    id: 'afternoon',
    label: 'Afternoon',
    timeRange: '12:00 PM – 4:00 PM',
    startHour: 12,
    endHour: 16,
    greeting: 'Midday Resilience',
    themeDescription: 'Resilience, patience, mindfulness, consistency, and perseverance.',
    ambientClass: 'ambient-afternoon',
    accentColor: '#737B5B', // olive earth
    themes: ['Resilience', 'Patience', 'Mindfulness', 'Consistency', 'Perseverance'],
  },
  evening: {
    id: 'evening',
    label: 'Evening',
    timeRange: '4:00 PM – 7:00 PM',
    startHour: 16,
    endHour: 19,
    greeting: 'Twilight Reflection',
    themeDescription: 'Reflection, gratitude, relationships, balance, and personal growth.',
    ambientClass: 'ambient-evening',
    accentColor: '#9333EA', // twilight violet
    themes: ['Reflection', 'Gratitude', 'Relationships', 'Balance', 'Personal Growth'],
  },
  night: {
    id: 'night',
    label: 'Night',
    timeRange: '7:00 PM – 11:00 PM',
    startHour: 19,
    endHour: 23,
    greeting: 'Night Contemplation',
    themeDescription: 'Philosophy, introspection, stoicism, purpose, and deep thinking.',
    ambientClass: 'ambient-night',
    accentColor: '#4F46E5', // indigo introspection
    themes: ['Philosophy', 'Introspection', 'Stoicism', 'Purpose', 'Deep Thinking'],
  },
  late_night: {
    id: 'late_night',
    label: 'Late Night',
    timeRange: '11:00 PM – 5:00 AM',
    startHour: 23,
    endHour: 5,
    greeting: 'Midnight Solitude',
    themeDescription: 'Existentialism, solitude, creativity, emotional resilience, and philosophical reflection.',
    ambientClass: 'ambient-late-night',
    accentColor: '#0284C7', // deep celestial cyan/blue
    themes: ['Existentialism', 'Solitude', 'Creativity', 'Emotional Resilience', 'Deep Reflection'],
  },
};

export const TIME_SLOT_ORDER: TimeSlot[] = [
  'early_morning',
  'morning',
  'afternoon',
  'evening',
  'night',
  'late_night',
];

export interface ISTTimeDetails {
  hour24: number;
  minute: number;
  second: number;
  timeString12: string; // e.g. "05:45:12 PM"
  timeString24: string; // e.g. "17:45:12"
  dateString: string;   // e.g. "Sunday, October 11, 2026"
  shortDateString: string; // e.g. "11 Oct 2026"
  activeSlot: TimeSlot;
  slotConfig: TimeSlotConfig;
  isoString: string;
}

/**
 * Parses any JS Date into IST components using Intl.DateTimeFormat with Asia/Kolkata timezone.
 */
export function getISTDateDetails(date: Date = new Date()): ISTTimeDetails {
  // Use Intl.DateTimeFormat to break down date in Asia/Kolkata
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    weekday: 'long',
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const hour24 = parseInt(partMap.hour || '0', 10);
  const minute = parseInt(partMap.minute || '0', 10);
  const second = parseInt(partMap.second || '0', 10);
  const weekday = partMap.weekday || '';
  const monthNum = parseInt(partMap.month || '1', 10);
  const day = parseInt(partMap.day || '1', 10);
  const year = parseInt(partMap.year || '2026', 10);

  const monthsFull = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const monthName = monthsFull[monthNum - 1] || 'October';
  const monthShort = monthsShort[monthNum - 1] || 'Oct';

  const dateString = `${weekday}, ${monthName} ${day}, ${year}`;
  const shortDateString = `${day} ${monthShort} ${year}`;

  const hour12Num = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const pad = (n: number) => n.toString().padStart(2, '0');

  const timeString12 = `${pad(hour12Num)}:${pad(minute)}:${pad(second)} ${ampm}`;
  const timeString24 = `${pad(hour24)}:${pad(minute)}:${pad(second)}`;

  const activeSlot = getTimeSlotForHour(hour24);

  return {
    hour24,
    minute,
    second,
    timeString12,
    timeString24,
    dateString,
    shortDateString,
    activeSlot,
    slotConfig: TIME_SLOTS[activeSlot],
    isoString: date.toISOString(),
  };
}

/**
 * Maps a 24-hour value (0-23) in IST to its matching TimeSlot
 */
export function getTimeSlotForHour(hour24: number): TimeSlot {
  if (hour24 >= 5 && hour24 < 8) {
    return 'early_morning';
  }
  if (hour24 >= 8 && hour24 < 12) {
    return 'morning';
  }
  if (hour24 >= 12 && hour24 < 16) {
    return 'afternoon';
  }
  if (hour24 >= 16 && hour24 < 19) {
    return 'evening';
  }
  if (hour24 >= 19 && hour24 < 23) {
    return 'night';
  }
  // 23:00 to 04:59 is late_night
  return 'late_night';
}

/**
 * Creates a simulated IST Date for testing given specific hour and minute
 */
export function createSimulatedISTDate(hour24: number, minute: number = 0): Date {
  // Construct a UTC timestamp that corresponds to Asia/Kolkata (UTC+05:30)
  // IST = UTC + 5.5 hours, so UTC = IST - 5.5 hours
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const utcDate = now.getUTCDate();

  // Create date at midnight UTC, then add requested hour and minute, then subtract 5 hours 30 min
  const baseUTC = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0));
  const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
  const targetISTMs = (hour24 * 60 + minute) * 60 * 1000;

  return new Date(baseUTC.getTime() + targetISTMs - istOffsetMs);
}

/**
 * Returns contextual greeting based on IST hour and slot
 */
export function getContextualGreeting(slot: TimeSlot, _hour24?: number): { title: string; subtitle: string } {
  switch (slot) {
    case 'early_morning':
      return {
        title: 'Dawn of Discipline',
        subtitle: 'The quiet hours before the world awakens. A moment for intentional focus, fresh ambition, and clarity of mind.',
      };
    case 'morning':
      return {
        title: 'Morning Momentum',
        subtitle: 'The sun rises on your potential. Channel your energy toward meaningful craft, learning, and purposeful work.',
      };
    case 'afternoon':
      return {
        title: 'Midday Equanimity',
        subtitle: 'Amidst the crescendo of daily demands, maintain your inner composure. Resilience is built in the middle hours.',
      };
    case 'evening':
      return {
        title: 'Twilight Reflection',
        subtitle: 'As shadows lengthen, pause to honor your progress, cultivate gratitude, and restore emotional equilibrium.',
      };
    case 'night':
      return {
        title: 'Night Contemplation',
        subtitle: 'The stillness of evening invites philosophical introspection. Unravel deep questions of purpose, virtue, and truth.',
      };
    case 'late_night':
      return {
        title: 'Midnight Solitude',
        subtitle: 'Under silent stars, the restless mind explores existential depths. Solitude is the sanctuary of original thought.',
      };
  }
}
