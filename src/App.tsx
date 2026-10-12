import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GenreSelector } from './components/GenreSelector';
import { FeaturedQuoteCard } from './components/FeaturedQuoteCard';
import { ExploreSection } from './components/ExploreSection';
import { FavoritesModal } from './components/FavoritesModal';
import { AboutModal } from './components/AboutModal';
import { TimeTravelerModal } from './components/TimeTravelerModal';
import { ShabbyChatModal } from './components/ShabbyChatModal';
import { ShabbyTriggerButton } from './components/ShabbyTriggerButton';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';

import type { Genre, Quote, TimeSlot, UserPreferences } from './types';
import {
  getISTDateDetails,
  createSimulatedISTDate,
  TIME_SLOTS,
} from './utils/timeEngine';
import type { ISTTimeDetails } from './utils/timeEngine';
import { getRecommendedQuotes } from './utils/quoteAlgorithm';
import {
  loadUserPreferences,
  saveUserPreferences,
  addRecentlyViewed,
  toggleFavoriteId,
} from './services/storageService';
import { QuoteService } from './services/quoteService';
import type { QuoteServiceStatus } from './services/quoteService';

export const App: React.FC = () => {
  // --- Preferences & State ---
  const [prefs, setPrefs] = useState<UserPreferences>(() => loadUserPreferences());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = loadUserPreferences().theme;
    if (saved === 'dark' || saved === 'light') return saved;
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Time Engine state
  const [simulatedDate, setSimulatedDate] = useState<Date | null>(null);
  const [timeDetails, setTimeDetails] = useState<ISTTimeDetails>(() => getISTDateDetails());
  const [manualSlot, setManualSlot] = useState<TimeSlot | null>(null);

  // Quote database & algorithm state
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [dbStatus, setDbStatus] = useState<QuoteServiceStatus>({
    source: 'Local Verified Seed Data',
    isLiveDb: false,
    totalQuotes: 0,
  });
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [curatedContext, setCuratedContext] = useState<{
    pool: Quote[];
    title: string;
  } | null>(null);
  const [viewedSnapshot, setViewedSnapshot] = useState<string[]>(() => prefs.recentlyViewed);

  // Modals & Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'favorites'>('home');
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isShabbyOpen, setIsShabbyOpen] = useState(false);
  const [shabbyQuote, setShabbyQuote] = useState<Quote | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply theme to HTML root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const updated = { ...prefs, theme };
    setPrefs(updated);
    saveUserPreferences(updated);
  }, [theme]);

  // Load quotes from service on mount
  useEffect(() => {
    let isMounted = true;
    QuoteService.fetchQuotes().then((res) => {
      if (isMounted) {
        setAllQuotes(res.quotes);
        setDbStatus(res.status);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Clock ticker (every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      if (simulatedDate) {
        setSimulatedDate((prev) => (prev ? new Date(prev.getTime() + 1000) : null));
        setTimeDetails(getISTDateDetails(simulatedDate));
      } else {
        const details = getISTDateDetails();
        setTimeDetails(details);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [simulatedDate]);

  // Active time slot: either manually chosen or dynamically determined by IST clock
  const effectiveTimeSlot: TimeSlot = useMemo(() => {
    if (manualSlot) return manualSlot;
    return timeDetails.activeSlot;
  }, [manualSlot, timeDetails.activeSlot]);

  // Handle Toast feedback
  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Deterministic recommendation computation: evaluates either curated context or circadian recommendation
  const activeQuoteData = useMemo(() => {
    if (allQuotes.length === 0) return null;

    if (curatedContext && curatedContext.pool.length > 0) {
      const pool = curatedContext.pool;
      const safeIndex = ((quoteIndex % pool.length) + pool.length) % pool.length;
      const quote = pool[safeIndex];

      return {
        quote,
        reason: {
          type: 'curated_collection' as const,
          label: curatedContext.title,
          description: `Curated from the ${curatedContext.title.toLowerCase()} collection.`,
          isRelaxedFallback: false,
        },
        totalMatchingQuotes: pool.length,
        currentIndex: safeIndex,
        isCuratedContext: true,
      };
    }

    const rec = getRecommendedQuotes({
      quotes: allQuotes,
      selectedGenres: prefs.selectedGenres,
      timeSlot: effectiveTimeSlot,
      recentlyViewedIds: viewedSnapshot,
      currentIndex: quoteIndex,
    });

    if (!rec) return null;

    return {
      quote: rec.quote,
      reason: rec.reason,
      totalMatchingQuotes: rec.totalMatchingQuotes,
      currentIndex: rec.currentIndex,
      isCuratedContext: false,
    };
  }, [allQuotes, curatedContext, quoteIndex, prefs.selectedGenres, effectiveTimeSlot, viewedSnapshot]);

  // Record viewed quote to history without mutating pool order
  useEffect(() => {
    if (activeQuoteData?.quote) {
      if (!prefs.recentlyViewed.includes(activeQuoteData.quote.id)) {
        const updatedHistory = addRecentlyViewed(activeQuoteData.quote.id, prefs.recentlyViewed);
        const updated = { ...prefs, recentlyViewed: updatedHistory };
        setPrefs(updated);
        saveUserPreferences(updated);
      }
    }
  }, [activeQuoteData?.quote?.id]);

  // Handlers
  const handleToggleFavorite = useCallback(
    (quoteId: string) => {
      const isFav = prefs.favorites.includes(quoteId);
      const updatedFavs = toggleFavoriteId(quoteId, prefs.favorites);
      const updated = { ...prefs, favorites: updatedFavs };
      setPrefs(updated);
      saveUserPreferences(updated);
      showToast(isFav ? 'Removed from favorites' : 'Saved to favorites', 'success');
    },
    [prefs, showToast]
  );

  const handleNextQuote = useCallback(() => {
    setQuoteIndex((prev) => prev + 1);
  }, []);

  const handlePrevQuote = useCallback(() => {
    setQuoteIndex((prev) => {
      if (!activeQuoteData || activeQuoteData.totalMatchingQuotes <= 1) return 0;
      return (prev - 1 + activeQuoteData.totalMatchingQuotes) % activeQuoteData.totalMatchingQuotes;
    });
  }, [activeQuoteData]);

  // Selection from Curation / Archive section: syncs directly into the pool
  const handleSelectQuoteFromArchive = useCallback(
    (quote: Quote, contextPool?: Quote[], contextTitle?: string) => {
      const pool = contextPool && contextPool.length > 0 ? contextPool : [quote];
      const title = contextTitle || `${TIME_SLOTS[effectiveTimeSlot].label} Curations`;

      // If the selected quote belongs to a different time slot, update time slot
      if (quote.timeCategories.length > 0 && !quote.timeCategories.includes(effectiveTimeSlot)) {
        setManualSlot(quote.timeCategories[0]);
      }

      setCuratedContext({ pool, title });

      const targetIdx = pool.findIndex((q) => q.id === quote.id);
      setQuoteIndex(targetIdx !== -1 ? targetIdx : 0);

      window.scrollTo({ top: 220, behavior: 'smooth' });
      showToast(`Focused “${quote.author}” from ${title}`, 'info');
    },
    [effectiveTimeSlot, showToast]
  );

  const handleReturnToCircadian = useCallback(() => {
    setCuratedContext(null);
    setQuoteIndex(0);
    setViewedSnapshot(prefs.recentlyViewed);
    showToast('Returned to circadian recommendation stream', 'info');
  }, [prefs.recentlyViewed, showToast]);

  const handleChangeSelectedGenres = useCallback(
    (genres: Genre[]) => {
      setCuratedContext(null);
      setQuoteIndex(0);
      setViewedSnapshot(prefs.recentlyViewed);
      const updated = { ...prefs, selectedGenres: genres };
      setPrefs(updated);
      saveUserPreferences(updated);
    },
    [prefs]
  );

  const handleSelectTimeSlot = useCallback((slot: TimeSlot) => {
    setCuratedContext(null);
    setQuoteIndex(0);
    setViewedSnapshot(prefs.recentlyViewed);
    setManualSlot(slot);
  }, [prefs.recentlyViewed]);

  const handleApplySimulatedTime = useCallback((hour24: number, minute: number = 0) => {
    const simDate = createSimulatedISTDate(hour24, minute);
    setSimulatedDate(simDate);
    setTimeDetails(getISTDateDetails(simDate));
    setCuratedContext(null);
    setManualSlot(null);
    setQuoteIndex(0);
    setViewedSnapshot(prefs.recentlyViewed);
  }, [prefs.recentlyViewed]);

  const handleResetToLive = useCallback(() => {
    setSimulatedDate(null);
    setManualSlot(null);
    setCuratedContext(null);
    setQuoteIndex(0);
    setViewedSnapshot(prefs.recentlyViewed);
    setTimeDetails(getISTDateDetails());
    showToast('Reconnected to live real-time IST clock', 'info');
  }, [prefs.recentlyViewed, showToast]);

  const handleSelectTab = useCallback((tab: 'home' | 'explore' | 'favorites') => {
    setActiveTab(tab);
    if (tab === 'favorites') {
      setIsFavoritesOpen(true);
    } else if (tab === 'explore') {
      const el = document.getElementById('explore-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleOpenShabby = useCallback((quote?: Quote) => {
    if (quote) {
      setShabbyQuote(quote);
    } else if (activeQuoteData) {
      setShabbyQuote(activeQuoteData.quote);
    }
    setIsShabbyOpen(true);
  }, [activeQuoteData]);

  const currentSlotConfig = TIME_SLOTS[effectiveTimeSlot];

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${currentSlotConfig.ambientClass}`}
    >
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        favoritesCount={prefs.favorites.length}
        timeDetails={timeDetails}
        isSimulated={Boolean(simulatedDate || manualSlot)}
        onOpenTimeSimulator={() => setIsSimulatorOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onOpenShabby={() => handleOpenShabby()}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center">
        {/* Hero Section with Live Clock and Slot Explorer */}
        <HeroSection
          timeDetails={timeDetails}
          selectedTimeSlot={effectiveTimeSlot}
          onSelectTimeSlot={handleSelectTimeSlot}
          isSimulated={Boolean(simulatedDate || manualSlot)}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        {/* Multi-Genre Selector Bar */}
        <GenreSelector
          selectedGenres={prefs.selectedGenres}
          onChangeSelectedGenres={handleChangeSelectedGenres}
        />

        {/* Featured Editorial Quote Card */}
        {activeQuoteData ? (
          <FeaturedQuoteCard
            quote={activeQuoteData.quote}
            reason={activeQuoteData.reason}
            isFavorite={prefs.favorites.includes(activeQuoteData.quote.id)}
            onToggleFavorite={handleToggleFavorite}
            onNextQuote={handleNextQuote}
            onPrevQuote={handlePrevQuote}
            onShowToast={showToast}
            collectionInfo={{
              current: activeQuoteData.currentIndex + 1,
              total: activeQuoteData.totalMatchingQuotes,
            }}
            isCuratedContext={activeQuoteData.isCuratedContext}
            onReturnToCircadian={handleReturnToCircadian}
            onOpenShabby={handleOpenShabby}
          />
        ) : (
          <div className="w-full max-w-xl mx-auto p-12 text-center text-stone-500 font-sans">
            Loading curated reflections...
          </div>
        )}

        {/* Explore More Archive Section */}
        <ExploreSection
          allQuotes={allQuotes}
          currentTimeSlot={effectiveTimeSlot}
          recentlyViewedIds={prefs.recentlyViewed}
          favoriteIds={prefs.favorites}
          onSelectAsFeatured={handleSelectQuoteFromArchive}
          onToggleFavorite={handleToggleFavorite}
          onShowToast={showToast}
          onOpenShabby={handleOpenShabby}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        databaseStatus={dbStatus}
      />

      {/* Floating Shabby AI Trigger Button */}
      <ShabbyTriggerButton
        onOpenShabby={() => handleOpenShabby()}
        isOpen={isShabbyOpen}
      />

      {/* Mobile Bottom Navigation Bar (Android & iPhone thumbs) */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        favoritesCount={prefs.favorites.length}
        isSimulated={Boolean(simulatedDate || manualSlot)}
        onOpenTimeSimulator={() => setIsSimulatorOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Modals */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => {
          setIsFavoritesOpen(false);
          if (activeTab === 'favorites') setActiveTab('home');
        }}
        allQuotes={allQuotes}
        favoriteIds={prefs.favorites}
        onToggleFavorite={handleToggleFavorite}
        onSelectQuote={handleSelectQuoteFromArchive}
        onShowToast={showToast}
        onOpenShabby={handleOpenShabby}
      />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <TimeTravelerModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        isSimulated={Boolean(simulatedDate)}
        simulatedHour={simulatedDate ? timeDetails.hour24 : null}
        onApplySimulatedTime={handleApplySimulatedTime}
        onResetToLive={handleResetToLive}
      />

      {/* Shabby AI Chatbot Modal */}
      <ShabbyChatModal
        isOpen={isShabbyOpen}
        onClose={() => setIsShabbyOpen(false)}
        activeQuote={shabbyQuote || activeQuoteData?.quote || null}
        onShowToast={showToast}
      />
    </div>
  );
};

export default App;
