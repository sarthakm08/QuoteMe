import React from 'react';

interface FooterProps {
  onOpenAbout: () => void;
  onOpenSimulator: () => void;
  databaseStatus: {
    source: string;
    isLiveDb: boolean;
    totalQuotes: number;
  };
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAbout,
  onOpenSimulator,
  databaseStatus,
}) => {
  return (
    <footer className="w-full border-t border-[#E8E4DC] dark:border-[#262626] bg-white/40 dark:bg-[#141414]/40 mt-auto py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#E8E4DC]/60 dark:border-[#262626]/60">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-editorial text-xl font-bold tracking-tight text-[#171717] dark:text-[#F4F1EA]">
                ChronoQuotes
              </span>
              <span className="text-[10px] font-mono-time uppercase px-1.5 py-0.5 rounded bg-[#737B5B]/15 text-[#737B5B] dark:text-[#9CA87F]">
                Asia/Kolkata
              </span>
            </div>
            <p className="text-xs text-[#777777] dark:text-[#888888] max-w-md leading-relaxed font-sans">
              Moments captured in words. Synchronized with the circadian cadence of daily existence in Indian Standard Time (UTC+05:30).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">
            <button
              onClick={onOpenAbout}
              className="hover:text-[#171717] dark:hover:text-[#F4F1EA] transition-colors"
            >
              Philosophy & Method
            </button>
            <button
              onClick={onOpenSimulator}
              className="hover:text-[#171717] dark:hover:text-[#F4F1EA] transition-colors"
            >
              Time Traveler Mode
            </button>
            <a
              href="#explore-section"
              className="hover:text-[#171717] dark:hover:text-[#F4F1EA] transition-colors"
            >
              Archive
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#888888] dark:text-[#777777] font-sans">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${databaseStatus.isLiveDb ? 'bg-emerald-500' : 'bg-[#737B5B]'}`} />
            <span>
              Engine: <strong className="font-medium text-[#555555] dark:text-[#AAAAAA]">{databaseStatus.source}</strong> ({databaseStatus.totalQuotes} verified quotations)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>Non-commercial philosophical project</span>
            <span>•</span>
            <span>Minimalism × Quiet Luxury</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
