import React from 'react';
import { Clock, Calendar, Sparkles, SlidersHorizontal } from 'lucide-react';
import type { ISTTimeDetails } from '../utils/timeEngine';
import { TIME_SLOTS, TIME_SLOT_ORDER } from '../utils/timeEngine';
import type { TimeSlot } from '../types';

interface HeroSectionProps {
  timeDetails: ISTTimeDetails;
  selectedTimeSlot: TimeSlot;
  onSelectTimeSlot: (slot: TimeSlot) => void;
  isSimulated: boolean;
  onOpenSimulator: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  timeDetails,
  selectedTimeSlot,
  onSelectTimeSlot,
  isSimulated,
  onOpenSimulator,
}) => {
  const currentSlotConfig = TIME_SLOTS[selectedTimeSlot];

  return (
    <section className="relative pt-6 pb-5 sm:pt-12 sm:pb-8 text-center max-w-4xl mx-auto px-3 sm:px-4">
      {/* Time & IST Badge bar */}
      <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-1.5 rounded-2xl sm:rounded-full border border-[#E8E4DC] dark:border-[#262626] bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-sm text-xs text-[#555555] dark:text-[#A3A3A3] mb-5 sm:mb-6 shadow-xs max-w-full">
        <div className="flex items-center gap-1.5 font-mono-time shrink-0">
          <Clock className="w-3.5 h-3.5 text-[#737B5B] dark:text-[#9CA87F]" />
          <span className="font-semibold text-[#171717] dark:text-[#F4F1EA] tracking-wider text-xs sm:text-sm">
            {timeDetails.timeString12}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#737B5B] dark:text-[#9CA87F] bg-[#737B5B]/10 dark:bg-[#8F9779]/15 px-1.5 py-0.5 rounded">
            IST (UTC+05:30)
          </span>
        </div>

        <span className="text-stone-300 dark:text-stone-700 hidden sm:inline">•</span>

        <div className="flex items-center gap-1.5 font-sans text-[11px] sm:text-xs shrink-0">
          <Calendar className="w-3.5 h-3.5 text-[#737B5B] dark:text-[#9CA87F]" />
          <span>{timeDetails.dateString}</span>
        </div>

        {isSimulated && (
          <button
            onClick={onOpenSimulator}
            className="text-[10px] font-mono-time text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full hover:bg-amber-500/25 transition-colors cursor-pointer"
          >
            Simulated
          </button>
        )}
      </div>

      {/* Dynamic Contextual Greeting */}
      <div className="mb-2.5 sm:mb-3">
        <span className="text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-[#737B5B] dark:text-[#9CA87F] font-sans">
          {currentSlotConfig.greeting}
        </span>
      </div>

      {/* Main Editorial Headline */}
      <h1 className="font-editorial text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-[#171717] dark:text-[#F4F1EA] mb-3 sm:mb-4 leading-[1.2] text-balance">
        A thought for this moment.
      </h1>

      {/* Time-sensitive dynamic supporting subtitle */}
      <p className="max-w-2xl mx-auto text-xs sm:text-base md:text-lg text-[#666666] dark:text-[#A3A3A3] leading-relaxed font-sans mb-6 sm:mb-8 px-2 text-balance">
        {currentSlotConfig.themeDescription}
      </p>

      {/* Time Slot Explorer / Quick Pills */}
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="flex items-center justify-between w-full max-w-2xl px-1 text-xs text-[#777777] dark:text-[#888888]">
          <span className="font-medium tracking-wide flex items-center gap-1 text-[11px] sm:text-xs">
            <Sparkles className="w-3 h-3 text-[#737B5B] dark:text-[#9CA87F]" />
            Circadian Rhythm Slots
          </span>
          <button
            onClick={onOpenSimulator}
            className="hover:text-[#171717] dark:hover:text-[#F4F1EA] transition-colors flex items-center gap-1 cursor-pointer text-[11px] sm:text-xs"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Time Machine</span>
          </button>
        </div>

        {/* Horizontal scrollable slot selector with touch-friendly pills */}
        <div className="w-full max-w-2xl overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-white/70 dark:bg-[#1E1E1E]/70 border border-[#E8E4DC] dark:border-[#262626]">
          {TIME_SLOT_ORDER.map((slotKey) => {
            const slot = TIME_SLOTS[slotKey];
            const isSelected = selectedTimeSlot === slotKey;
            const isRealCurrent = timeDetails.activeSlot === slotKey;

            return (
              <button
                key={slotKey}
                onClick={() => onSelectTimeSlot(slotKey)}
                className={`relative px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 min-h-[34px] sm:min-h-[38px] flex items-center ${
                  isSelected
                    ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] shadow-xs'
                    : 'text-[#666666] dark:text-[#999999] hover:text-[#171717] dark:hover:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {isRealCurrent && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isSelected ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-emerald-500'
                      }`}
                      title="Current IST Time Slot"
                    />
                  )}
                  <span>{slot.label}</span>
                  <span className={`text-[10px] opacity-70 font-mono-time`}>
                    {slot.timeRange.split('–')[0].trim()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
