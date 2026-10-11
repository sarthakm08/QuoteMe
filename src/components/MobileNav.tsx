import React from 'react';
import { Home, Compass, Bookmark, Clock, Info } from 'lucide-react';

interface MobileNavProps {
  activeTab: 'home' | 'explore' | 'favorites';
  onSelectTab: (tab: 'home' | 'explore' | 'favorites') => void;
  favoritesCount: number;
  isSimulated: boolean;
  onOpenTimeSimulator: () => void;
  onOpenAbout: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  favoritesCount,
  isSimulated,
  onOpenTimeSimulator,
  onOpenAbout,
}) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F7F5F0]/95 dark:bg-[#151515]/95 backdrop-blur-xl border-t border-[#E8E4DC] dark:border-[#262626] safe-bottom transition-colors duration-300"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 items-center justify-around px-2 py-2">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-[#171717] dark:text-[#F4F1EA] font-semibold'
              : 'text-[#777777] dark:text-[#888888] hover:text-[#171717] dark:hover:text-[#F4F1EA]'
          }`}
          aria-label="Home"
        >
          <div
            className={`p-1.5 rounded-lg transition-transform ${
              activeTab === 'home'
                ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] scale-105'
                : ''
            }`}
          >
            <Home className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight font-sans">Home</span>
        </button>

        {/* Explore Archive */}
        <button
          onClick={() => onSelectTab('explore')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'explore'
              ? 'text-[#171717] dark:text-[#F4F1EA] font-semibold'
              : 'text-[#777777] dark:text-[#888888] hover:text-[#171717] dark:hover:text-[#F4F1EA]'
          }`}
          aria-label="Explore Archive"
        >
          <div
            className={`p-1.5 rounded-lg transition-transform ${
              activeTab === 'explore'
                ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] scale-105'
                : ''
            }`}
          >
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight font-sans">Explore</span>
        </button>

        {/* Favorites */}
        <button
          onClick={() => onSelectTab('favorites')}
          className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'favorites'
              ? 'text-[#171717] dark:text-[#F4F1EA] font-semibold'
              : 'text-[#777777] dark:text-[#888888] hover:text-[#171717] dark:hover:text-[#F4F1EA]'
          }`}
          aria-label="Favorites"
        >
          <div
            className={`relative p-1.5 rounded-lg transition-transform ${
              activeTab === 'favorites'
                ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] scale-105'
                : ''
            }`}
          >
            <Bookmark className="w-4 h-4" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center font-mono-time">
                {favoritesCount > 99 ? '99+' : favoritesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight font-sans">Saved</span>
        </button>

        {/* Time Machine */}
        <button
          onClick={onOpenTimeSimulator}
          className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer text-[#777777] dark:text-[#888888] hover:text-[#171717] dark:hover:text-[#F4F1EA]`}
          aria-label="Time Traveler"
        >
          <div
            className={`p-1.5 rounded-lg transition-transform ${
              isSimulated
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : ''
            }`}
          >
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight font-sans">
            {isSimulated ? 'Simulated' : 'Time'}
          </span>
        </button>

        {/* About */}
        <button
          onClick={onOpenAbout}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer text-[#777777] dark:text-[#888888] hover:text-[#171717] dark:hover:text-[#F4F1EA]"
          aria-label="About ChronoQuotes"
        >
          <div className="p-1.5 rounded-lg">
            <Info className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight font-sans">About</span>
        </button>
      </div>
    </nav>
  );
};
