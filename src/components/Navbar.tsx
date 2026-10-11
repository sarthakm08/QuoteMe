import React from 'react';
import { Sun, Moon, Bookmark, Clock, Compass, Info } from 'lucide-react';
import type { ISTTimeDetails } from '../utils/timeEngine';

interface NavbarProps {
  activeTab: 'home' | 'explore' | 'favorites';
  onSelectTab: (tab: 'home' | 'explore' | 'favorites') => void;
  favoritesCount: number;
  timeDetails: ISTTimeDetails;
  isSimulated: boolean;
  onOpenTimeSimulator: () => void;
  onOpenAbout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  favoritesCount,
  timeDetails,
  isSimulated,
  onOpenTimeSimulator,
  onOpenAbout,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F7F5F0]/90 dark:bg-[#151515]/90 border-b border-[#E8E4DC] dark:border-[#262626] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2 text-left group focus:outline-none cursor-pointer"
            aria-label="ChronoQuotes Home"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#737B5B]/15 dark:bg-[#8F9779]/20 border border-[#737B5B]/30 flex items-center justify-center text-[#737B5B] dark:text-[#9CA87F] group-hover:scale-105 transition-transform shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="flex items-baseline">
              <span className="font-editorial text-lg sm:text-2xl font-semibold tracking-tight text-[#171717] dark:text-[#F4F1EA] truncate">
                QuoteMe
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono-time uppercase tracking-widest text-[#777777] dark:text-[#888888]">
                IST Edition
              </span>
            </div>
          </button>
        </div>

        {/* Center/Desktop Navigation Links (>= md) */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2" aria-label="Desktop Navigation">
          <button
            onClick={() => onSelectTab('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === 'home'
                ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] shadow-sm'
                : 'text-[#555555] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
          >
            Home
          </button>

          <button
            onClick={() => onSelectTab('explore')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === 'explore'
                ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] shadow-sm'
                : 'text-[#555555] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore</span>
          </button>

          <button
            onClick={() => onSelectTab('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === 'favorites'
                ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] shadow-sm'
                : 'text-[#555555] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Favorites</span>
            {favoritesCount > 0 && (
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-[#737B5B]/20 text-[#737B5B] dark:text-[#9CA87F] font-mono-time">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenAbout}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-[#555555] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            aria-label="About ChronoQuotes"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </button>
        </nav>

        {/* Right Tools: Live Clock Pill & Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Time Traveler / IST Clock trigger button */}
          <button
            onClick={onOpenTimeSimulator}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border text-xs font-mono-time transition-all cursor-pointer shrink-0 ${isSimulated
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                : 'border-[#E8E4DC] dark:border-[#262626] bg-white/70 dark:bg-[#202020]/70 text-[#171717] dark:text-[#F4F1EA] hover:border-[#737B5B]'
              }`}
            title="Open IST Time Traveler"
            aria-label="Open IST Time Traveler"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isSimulated ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                }`}
            />
            <span className="font-medium text-[11px] sm:text-xs">
              {timeDetails.timeString12.replace(/:\d\d\s/, ' ')}
            </span>
            <span className="text-[9px] sm:text-[10px] opacity-75 font-semibold">IST</span>
            {isSimulated && (
              <span className="text-[9px] uppercase px-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                Sim
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 rounded-lg text-[#555555] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle light and dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
