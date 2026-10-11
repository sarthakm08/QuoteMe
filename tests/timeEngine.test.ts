import { describe, it, expect } from 'vitest';
import {
  getTimeSlotForHour,
  getISTDateDetails,
  createSimulatedISTDate,
  TIME_SLOTS,
} from '../src/utils/timeEngine';

describe('Time Engine & IST Timezone Tests', () => {
  it('correctly maps 24-hour time to the 6 configured time slots', () => {
    // Early Morning: 5:00 AM – 8:00 AM (hours 5, 6, 7)
    expect(getTimeSlotForHour(5)).toBe('early_morning');
    expect(getTimeSlotForHour(6)).toBe('early_morning');
    expect(getTimeSlotForHour(7)).toBe('early_morning');

    // Morning: 8:00 AM – 12:00 PM (hours 8, 9, 10, 11)
    expect(getTimeSlotForHour(8)).toBe('morning');
    expect(getTimeSlotForHour(10)).toBe('morning');
    expect(getTimeSlotForHour(11)).toBe('morning');

    // Afternoon: 12:00 PM – 4:00 PM (hours 12, 13, 14, 15)
    expect(getTimeSlotForHour(12)).toBe('afternoon');
    expect(getTimeSlotForHour(13)).toBe('afternoon');
    expect(getTimeSlotForHour(15)).toBe('afternoon');

    // Evening: 4:00 PM – 7:00 PM (hours 16, 17, 18)
    expect(getTimeSlotForHour(16)).toBe('evening');
    expect(getTimeSlotForHour(17)).toBe('evening');
    expect(getTimeSlotForHour(18)).toBe('evening');

    // Night: 7:00 PM – 11:00 PM (hours 19, 20, 21, 22)
    expect(getTimeSlotForHour(19)).toBe('night');
    expect(getTimeSlotForHour(20)).toBe('night');
    expect(getTimeSlotForHour(22)).toBe('night');

    // Late Night: 11:00 PM – 5:00 AM (hours 23, 0, 1, 2, 3, 4)
    expect(getTimeSlotForHour(23)).toBe('late_night');
    expect(getTimeSlotForHour(0)).toBe('late_night');
    expect(getTimeSlotForHour(2)).toBe('late_night');
    expect(getTimeSlotForHour(4)).toBe('late_night');
  });

  it('correctly resolves simulated IST dates for specified test times', () => {
    // 5:30 AM IST (Early Morning)
    const date530am = createSimulatedISTDate(5, 30);
    const details530 = getISTDateDetails(date530am);
    expect(details530.hour24).toBe(5);
    expect(details530.minute).toBe(30);
    expect(details530.activeSlot).toBe('early_morning');
    expect(details530.slotConfig.id).toBe('early_morning');

    // 12:30 PM IST (Afternoon)
    const date1230pm = createSimulatedISTDate(12, 30);
    const details1230 = getISTDateDetails(date1230pm);
    expect(details1230.hour24).toBe(12);
    expect(details1230.minute).toBe(30);
    expect(details1230.activeSlot).toBe('afternoon');

    // 8:00 PM IST (Night)
    const date800pm = createSimulatedISTDate(20, 0);
    const details800 = getISTDateDetails(date800pm);
    expect(details800.hour24).toBe(20);
    expect(details800.minute).toBe(0);
    expect(details800.activeSlot).toBe('night');

    // 2:00 AM IST (Late Night)
    const date200am = createSimulatedISTDate(2, 0);
    const details200 = getISTDateDetails(date200am);
    expect(details200.hour24).toBe(2);
    expect(details200.minute).toBe(0);
    expect(details200.activeSlot).toBe('late_night');
  });

  it('verifies that TIME_SLOTS covers all 6 periods with greetings and ranges', () => {
    const slots = Object.keys(TIME_SLOTS);
    expect(slots).toHaveLength(6);
    expect(TIME_SLOTS.early_morning.timeRange).toBe('5:00 AM – 8:00 AM');
    expect(TIME_SLOTS.morning.timeRange).toBe('8:00 AM – 12:00 PM');
    expect(TIME_SLOTS.afternoon.timeRange).toBe('12:00 PM – 4:00 PM');
    expect(TIME_SLOTS.evening.timeRange).toBe('4:00 PM – 7:00 PM');
    expect(TIME_SLOTS.night.timeRange).toBe('7:00 PM – 11:00 PM');
    expect(TIME_SLOTS.late_night.timeRange).toBe('11:00 PM – 5:00 AM');
  });
});
