import React from 'react';
import { X, Clock, Feather, Compass, ShieldCheck } from 'lucide-react';
import { TIME_SLOTS, TIME_SLOT_ORDER } from '../utils/timeEngine';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#F7F5F0] dark:bg-[#1E1E1E] rounded-3xl border border-[#E8E4DC] dark:border-[#2C2C2C] shadow-2xl flex flex-col overflow-hidden text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8E4DC] dark:border-[#2C2C2C]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#737B5B]/15 text-[#737B5B] dark:text-[#9CA87F] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 id="about-title" className="font-editorial text-xl font-semibold text-[#171717] dark:text-[#F4F1EA]">
                About ChronoQuotes
              </h3>
              <p className="text-xs text-[#777777] dark:text-[#888888]">
                Time-Based Quote Discovery Platform
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-[#E8E4DC] dark:border-[#2C2C2C] hover:bg-black/5 dark:hover:bg-white/5 text-[#555555] dark:text-[#AAAAAA] hover:text-[#171717] dark:hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-sm text-[#444444] dark:text-[#CCCCCC] leading-relaxed">
          {/* Mission statement */}
          <div>
            <h4 className="font-editorial text-lg text-[#171717] dark:text-[#F4F1EA] mb-2 font-medium">
              Harmonizing Words with the Cadence of Day and Night
            </h4>
            <p>
              ChronoQuotes is designed as a sanctuary of quiet reflection—blending the utility of a minimalist productivity companion, the depth of a philosophical journal, and the typography of an editorial publication.
            </p>
            <p className="mt-2 text-xs text-[#777777] dark:text-[#888888]">
              Regardless of where you are in the world, the engine synchronizes with <strong>Indian Standard Time (IST, UTC+05:30)</strong>, aligning the rhythm of human inquiry with the natural progression of solar time.
            </p>
          </div>

          {/* Time Slots Breakdown */}
          <div className="pt-2">
            <h4 className="text-xs uppercase font-semibold tracking-wider text-[#737B5B] dark:text-[#9CA87F] mb-3">
              The Six Circadian Curations
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TIME_SLOT_ORDER.map((slotKey) => {
                const slot = TIME_SLOTS[slotKey];
                return (
                  <div
                    key={slotKey}
                    className="p-3.5 rounded-xl bg-white dark:bg-[#252525] border border-[#E8E4DC] dark:border-[#2E2E2E]"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#171717] dark:text-[#F4F1EA] mb-1">
                      <span>{slot.label}</span>
                      <span className="font-mono-time text-[10px] text-[#737B5B] dark:text-[#9CA87F]">
                        {slot.timeRange}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777777] dark:text-[#999999] leading-snug">
                      {slot.themeDescription}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Tenets */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-white/50 dark:bg-[#252525]/50 border border-[#E8E4DC] dark:border-[#2E2E2E]">
              <ShieldCheck className="w-4 h-4 text-[#737B5B] dark:text-[#9CA87F] mb-1.5" />
              <div className="font-semibold text-xs text-[#171717] dark:text-[#F4F1EA] mb-1">
                Verified Attribution
              </div>
              <p className="text-[11px] text-[#777777] dark:text-[#999999]">
                Zero fabricated quotes. Every citation links back to historic manuscripts, dialogues, and verified publications.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/50 dark:bg-[#252525]/50 border border-[#E8E4DC] dark:border-[#2E2E2E]">
              <Feather className="w-4 h-4 text-[#737B5B] dark:text-[#9CA87F] mb-1.5" />
              <div className="font-semibold text-xs text-[#171717] dark:text-[#F4F1EA] mb-1">
                Editorial Typography
              </div>
              <p className="text-[11px] text-[#777777] dark:text-[#999999]">
                Generous whitespace, quiet luxury palettes, and serif proportions tuned for focused, distraction-free reading.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/50 dark:bg-[#252525]/50 border border-[#E8E4DC] dark:border-[#2E2E2E]">
              <Compass className="w-4 h-4 text-[#737B5B] dark:text-[#9CA87F] mb-1.5" />
              <div className="font-semibold text-xs text-[#171717] dark:text-[#F4F1EA] mb-1">
                Offline Resilience
              </div>
              <p className="text-[11px] text-[#777777] dark:text-[#999999]">
                Works immediately offline or in guest mode without mandatory account creation or cloud dependencies.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/40 dark:bg-[#181818]/40 border-t border-[#E8E4DC] dark:border-[#2C2C2C] text-center text-xs text-[#888888]">
          <span>Crafted with intention. Synchronized with the timeless heartbeat of words.</span>
        </div>
      </div>
    </div>
  );
};
