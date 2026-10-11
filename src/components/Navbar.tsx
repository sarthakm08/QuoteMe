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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F7F5F0]/85 dark:bg-[#151515]/85 border-b border-[#E8E4DC] dark:border-[#262626] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            aria-label="ChronoQuotes Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#737B5B]/15 dark:bg-[#8F9779]/20 border border-[#737B5B]/30 flex items-center justify-center text-[#737B5B] dark:text-[#9CA87F] group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-editorial text-xl sm:text-2xl font-semibold tracking-tight text-[#171717] dark:text-[#F4F1EA]">
                ChronoQuotes
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono-time uppercase tracking-widest text-[#777777] dark:text-[#888888]">
                IST Edition
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] shadow-sm'
                : 'text-[#555555] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onSelectTab('explore')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] shadow-sm'
                : 'text-[#555555] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore</span>
          </button>

          <button
            onClick={() => onSelectTab('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] shadow-sm'
                : 'text-[#555555] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-[#737B5B]/20 text-[#737B5B] dark:text-[#9CA87F] font-mono-time">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenAbout}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-[#555555] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            aria-label="About ChronoQuotes"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </button>

          {/* Time Traveler / IST Clock trigger */}
          <button
            onClick={onOpenTimeSimulator}
            className={`ml-1 sm:ml-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono-time transition-all cursor-pointer ${
              isSimulated
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                : 'border-[#E8E4DC] dark:border-[#262626] bg-white/60 dark:bg-[#202020]/60 text-[#171717] dark:text-[#F4F1EA] hover:border-[#737B5B]'
            }`}
            title="Simulate or view IST time slots"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isSimulated ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className="font-medium hidden xs:inline">{timeDetails.timeString12.replace(/:\d\d\s/, ' ')}</span>
            <span className="text-[10px] opacity-75">IST</span>
            {isSimulated && <span className="text-[9px] uppercase px-1 rounded bg-amber-500/20">Sim</span>}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-[#555555] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Toggle light and dark mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
};
