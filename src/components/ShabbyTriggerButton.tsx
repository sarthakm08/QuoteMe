import React from 'react';
import { Sparkles } from 'lucide-react';

interface ShabbyTriggerButtonProps {
  onOpenShabby: () => void;
  isOpen: boolean;
}

export const ShabbyTriggerButton: React.FC<ShabbyTriggerButtonProps> = ({
  onOpenShabby,
  isOpen,
}) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 animate-fade-in">
      <button
        onClick={onOpenShabby}
        className="group relative flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] shadow-xl hover:shadow-2xl border border-white/20 dark:border-black/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        aria-label="Open Shabby AI Chatbot"
      >
        {/* Glowing aura */}
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#737B5B] to-amber-500 opacity-60 group-hover:opacity-100 blur-xs transition duration-300 -z-10 animate-pulse" />

        {/* Icon */}
        <div className="w-7 h-7 rounded-full bg-[#737B5B] dark:bg-[#737B5B] text-white flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
        </div>

        {/* Label */}
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold leading-tight flex items-center gap-1 font-editorial tracking-wide">
            Ask Shabby
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
          </span>
          <span className="text-[9px] opacity-75 leading-none font-mono-time">
            AI Companion
          </span>
        </div>
      </button>
    </div>
  );
};
