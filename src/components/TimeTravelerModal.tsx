import React from 'react';
import { X, Clock, RotateCcw } from 'lucide-react';
import type { TimeSlot } from '../types';
import { TIME_SLOTS } from '../utils/timeEngine';

interface TimeTravelerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSimulated: boolean;
  simulatedHour: number | null;
  onApplySimulatedTime: (hour24: number, minute?: number) => void;
  onResetToLive: () => void;
}

interface TestPreset {
  label: string;
  hour: number;
  minute: number;
  slot: TimeSlot;
  description: string;
}

const PRESETS: TestPreset[] = [
  {
    label: '5:30 AM',
    hour: 5,
    minute: 30,
    slot: 'early_morning',
    description: 'Dawn of Discipline — Habits, ambition & fresh starts',
  },
  {
    label: '10:00 AM',
    hour: 10,
    minute: 0,
    slot: 'morning',
    description: 'Morning Momentum — Productivity, creativity & craft',
  },
  {
    label: '12:30 PM',
    hour: 12,
    minute: 30,
    slot: 'afternoon',
    description: 'Midday Equanimity — Resilience, patience & consistency',
  },
  {
    label: '5:30 PM',
    hour: 17,
    minute: 30,
    slot: 'evening',
    description: 'Twilight Reflection — Gratitude, balance & relationships',
  },
  {
    label: '8:00 PM',
    hour: 20,
    minute: 0,
    slot: 'night',
    description: 'Night Contemplation — Philosophy, stoicism & deep thinking',
  },
  {
    label: '2:00 AM',
    hour: 2,
    minute: 0,
    slot: 'late_night',
    description: 'Midnight Solitude — Existentialism & quiet resilience',
  },
];

export const TimeTravelerModal: React.FC<TimeTravelerModalProps> = ({
  isOpen,
  onClose,
  isSimulated,
  simulatedHour,
  onApplySimulatedTime,
  onResetToLive,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-xl max-h-[90dvh] flex flex-col bg-[#F7F5F0] dark:bg-[#1E1E1E] rounded-2xl sm:rounded-3xl border border-[#E8E4DC] dark:border-[#2C2C2C] shadow-2xl overflow-hidden text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="simulator-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#E8E4DC] dark:border-[#2C2C2C] shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 id="simulator-title" className="font-editorial text-lg sm:text-xl font-semibold text-[#171717] dark:text-[#F4F1EA]">
                IST Time Traveler
              </h3>
              <p className="text-[11px] sm:text-xs text-[#777777] dark:text-[#888888] line-clamp-1">
                Explore quotes & ambient themes across any time of day
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isSimulated && (
              <button
                onClick={() => {
                  onResetToLive();
                  onClose();
                }}
                className="px-2 sm:px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-mono-time hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Reset to live IST"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden xs:inline sm:inline">Live IST</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-[#E8E4DC] dark:border-[#2C2C2C] hover:bg-black/5 dark:hover:bg-white/5 text-[#555555] dark:text-[#AAAAAA] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content body with responsive scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6">
          {/* Status banner */}
          <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-xs ${
            isSimulated
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
          }`}>
            <div className="font-semibold flex items-center gap-1.5 mb-1 font-sans">
              <span className={`w-2 h-2 rounded-full ${isSimulated ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span>{isSimulated ? 'Simulated IST Clock Active' : 'Real-time Live IST Engine Active'}</span>
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed">
              {isSimulated
                ? 'Quotes and ambient lighting reflect your selected test time in Asia/Kolkata timezone.'
                : 'Quotes update automatically with the actual solar progression in India Standard Time.'}
            </p>
          </div>

          {/* Rapid Presets Grid */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-[#737B5B] dark:text-[#9CA87F] mb-2.5">
              Core Test Presets
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {PRESETS.map((preset) => {
                const isCurrentSim = simulatedHour === preset.hour;
                return (
                  <button
                    key={preset.label}
                    onClick={() => {
                      onApplySimulatedTime(preset.hour, preset.minute);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isCurrentSim
                        ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] border-transparent shadow-xs'
                        : 'bg-white dark:bg-[#252525] border-[#E8E4DC] dark:border-[#2E2E2E] hover:border-[#737B5B] text-[#171717] dark:text-[#F4F1EA]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono-time font-bold text-sm">
                        {preset.label}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans uppercase font-medium ${
                        isCurrentSim ? 'bg-white/20 dark:bg-black/20' : 'bg-[#737B5B]/10 text-[#737B5B] dark:text-[#9CA87F]'
                      }`}>
                        {TIME_SLOTS[preset.slot].label}
                      </span>
                    </div>
                    <p className={`text-[11px] line-clamp-1 ${isCurrentSim ? 'opacity-85' : 'text-[#777777] dark:text-[#999999]'}`}>
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time of Day Slider */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#252525] border border-[#E8E4DC] dark:border-[#2E2E2E]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#171717] dark:text-[#F4F1EA]">
                Custom Hour Slider
              </span>
              <span className="font-mono-time text-xs text-[#737B5B] dark:text-[#9CA87F]">
                {simulatedHour !== null ? `${simulatedHour.toString().padStart(2, '0')}:00 IST` : 'Live'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              step="1"
              value={simulatedHour ?? 12}
              onChange={(e) => onApplySimulatedTime(parseInt(e.target.value, 10), 0)}
              className="w-full accent-[#737B5B] cursor-pointer h-6"
            />
            <div className="flex justify-between text-[10px] font-mono-time text-[#888888] mt-1.5">
              <span>00:00 (Night)</span>
              <span>08:00 (Morn)</span>
              <span>12:00 (Noon)</span>
              <span>18:00 (Eve)</span>
              <span>23:00</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-white/40 dark:bg-[#181818]/40 border-t border-[#E8E4DC] dark:border-[#2C2C2C] flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              onResetToLive();
              onClose();
            }}
            className="text-xs text-[#666666] dark:text-[#AAAAAA] hover:text-[#171717] dark:hover:text-white underline underline-offset-2 transition-colors font-sans cursor-pointer py-1"
          >
            Reset to real-world clock
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
