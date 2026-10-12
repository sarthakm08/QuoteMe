import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Send,
  RotateCcw,
  Languages,
  Copy,
  Check,
  Volume2,
  VolumeX,
  BookOpen,
  Lightbulb,
  Globe,
  Settings,
  Quote as QuoteIcon,
  ChevronDown,
} from 'lucide-react';
import type { Quote } from '../types';
import {
  shabbyService,
  SUPPORTED_LANGUAGES,
  type ChatMessage,
} from '../services/shabbyAiService';

interface ShabbyChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeQuote: Quote | null;
  onShowToast: (message: string, type?: 'success' | 'info') => void;
}

export const ShabbyChatModal: React.FC<ShabbyChatModalProps> = ({
  isOpen,
  onClose,
  activeQuote,
  onShowToast,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-1',
        role: 'model',
        text: `Greetings, traveller of thoughts! I am **Shabby**, your literary and philosophical companion.\n\nWhether you wish to unpack the hidden depths of a quotation, understand the ancient or modern wisdom behind it, or translate words into **Hindi**, **Hinglish**, or regional Indian languages, I am by your side.\n\nHow may we explore together today?`,
        timestamp: Date.now(),
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Clean up speech synthesis on close or unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend ?? inputText).trim();
    if (!prompt || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: prompt,
      timestamp: Date.now(),
      relatedQuote: activeQuote
        ? { text: activeQuote.text, author: activeQuote.author }
        : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const responseText = await shabbyService.sendMessage(
        prompt,
        messages,
        activeQuote ?? undefined
      );

      const aiMsg: ChatMessage = {
        id: `shabby-${Date.now()}`,
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `⚠️ **Apologies from Shabby:** ${
          err?.message || 'I encountered a brief connection issue. Please check your network and try again.'
        }`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      onShowToast('Could not fetch response from Shabby', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainCurrentQuote = async () => {
    if (!activeQuote || isLoading) return;
    const prompt = `Explain this quote in detail: "${activeQuote.text}" — ${activeQuote.author}`;
    await handleSendMessage(prompt);
  };

  const handleTranslateCurrentQuote = async (langName: string, langNative: string) => {
    if (!activeQuote || isLoading) return;
    const prompt = `Translate this quote and unpack its meaning in ${langName} (${langNative}): "${activeQuote.text}" — ${activeQuote.author}`;
    await handleSendMessage(prompt);
  };

  const handleCopyMessage = async (msg: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(msg.text);
      setCopiedId(msg.id);
      onShowToast('Copied to clipboard', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onShowToast('Failed to copy', 'info');
    }
  };

  const handleSpeakMessage = (msg: ChatMessage) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onShowToast('Speech audio is not supported in this browser', 'info');
      return;
    }

    if (speakingId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown stars and brackets for cleaner pronunciation
    const cleanText = msg.text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/\[.*?\]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msg.id);
    window.speechSynthesis.speak(utterance);
  };

  const handleClearHistory = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `Conversation cleared. I am ready for fresh inquiries! What quote or wisdom would you like to reflect upon?`,
        timestamp: Date.now(),
      },
    ]);
    onShowToast('Chat cleared', 'info');
  };

  const handleSaveCustomKey = () => {
    shabbyService.setCustomApiKey(customKeyInput);
    setShowSettings(false);
    onShowToast(
      customKeyInput.trim()
        ? 'Custom Gemini API Key saved'
        : 'Reset to default Gemini API Key',
      'success'
    );
  };

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) ||
    SUPPORTED_LANGUAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl h-[92dvh] sm:h-[85vh] bg-[#F7F5F0] dark:bg-[#1C1C1C] rounded-2xl sm:rounded-3xl border border-[#E8E4DC] dark:border-[#2C2C2C] shadow-2xl flex flex-col overflow-hidden text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shabby-chat-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-[#E8E4DC] dark:border-[#2C2C2C] bg-white/70 dark:bg-[#222222]/70 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Shabby Avatar Icon */}
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#737B5B] to-[#9CA87F] text-white flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1C1C1C]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  id="shabby-chat-title"
                  className="font-editorial text-base sm:text-lg font-bold text-[#171717] dark:text-[#F4F1EA] truncate"
                >
                  Shabby
                </h3>
                <span className="text-[10px] font-mono-time uppercase px-1.5 py-0.5 rounded-full bg-[#737B5B]/15 text-[#737B5B] dark:text-[#9CA87F] font-semibold shrink-0">
                  Philosopher & Translator
                </span>
              </div>
              <p className="text-[11px] text-[#777777] dark:text-[#888888] truncate font-sans">
                Explains deep wisdom • Translates to Indian & Global languages
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={() => {
                setShowSettings((s) => !s);
                setCustomKeyInput(
                  shabbyService.hasCustomApiKey()
                    ? shabbyService.getActiveApiKey()
                    : ''
                );
              }}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#666666] dark:text-[#AAAAAA] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
              title="API Key Settings"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#666666] dark:text-[#AAAAAA] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
              title="Reset conversation"
              aria-label="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-[#E8E4DC] dark:border-[#2C2C2C] hover:bg-black/5 dark:hover:bg-white/5 text-[#555555] dark:text-[#AAAAAA] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close Shabby Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Custom API Key Settings Drawer (collapsible) */}
        {showSettings && (
          <div className="p-3.5 sm:p-4 bg-amber-500/10 border-b border-amber-500/30 text-xs font-sans shrink-0 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                Gemini API Configuration
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono-time">
                {shabbyService.hasCustomApiKey() ? 'Custom Key' : 'Default Pre-configured'}
              </span>
            </div>
            <p className="text-[11px] text-[#666666] dark:text-[#AAAAAA] mb-2">
              ChronoQuotes is currently using the provided Google AI Studio Gemini API key. You may also specify your own:
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AQ.Ab8... (Google Gemini API Key)"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#E8E4DC] dark:border-[#333] bg-white dark:bg-[#1E1E1E] text-[#171717] dark:text-[#F4F1EA]"
              />
              <button
                onClick={handleSaveCustomKey}
                className="px-3 py-1.5 rounded-xl bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] text-xs font-medium cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Active Quote Context Strip */}
        {activeQuote && (
          <div className="px-3.5 sm:px-4 py-2.5 bg-white/50 dark:bg-[#171717]/50 border-b border-[#E8E4DC] dark:border-[#2C2C2C] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <QuoteIcon className="w-3.5 h-3.5 text-[#737B5B] dark:text-[#9CA87F] shrink-0" />
              <div className="text-[11px] truncate font-sans text-[#555555] dark:text-[#BBBBBB]">
                <strong className="text-[#171717] dark:text-[#F4F1EA]">
                  {activeQuote.author}:
                </strong>{' '}
                “{activeQuote.text}”
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleExplainCurrentQuote}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#737B5B]/15 text-[#737B5B] dark:text-[#9CA87F] hover:bg-[#737B5B]/25 font-medium transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                Explain Quote
              </button>
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeaking = speakingId === msg.id;
            const isCopied = copiedId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div
                  className={`relative max-w-[88%] sm:max-w-[82%] p-3.5 sm:p-4 rounded-2xl ${
                    isUser
                      ? 'bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] rounded-tr-xs'
                      : 'bg-white dark:bg-[#252525] border border-[#E8E4DC] dark:border-[#333333] text-[#171717] dark:text-[#F4F1EA] rounded-tl-xs shadow-xs'
                  }`}
                >
                  {/* Context quote badge if user was addressing a specific quote */}
                  {msg.relatedQuote && isUser && (
                    <div className="mb-2 pb-1.5 border-b border-white/20 dark:border-black/20 text-[10px] opacity-75 font-serif-quote italic line-clamp-1">
                      Ref: “{msg.relatedQuote.text}” — {msg.relatedQuote.author}
                    </div>
                  )}

                  {/* Body text with clean formatting */}
                  <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-[13px] break-words">
                    {msg.text.split('\n\n').map((para, i) => (
                      <p key={i} className={i > 0 ? 'mt-2.5' : ''}>
                        {para.split('**').map((seg, idx) =>
                          idx % 2 === 1 ? (
                            <strong
                              key={idx}
                              className={
                                isUser
                                  ? 'font-bold'
                                  : 'font-semibold text-[#737B5B] dark:text-[#B5C296]'
                              }
                            >
                              {seg}
                            </strong>
                          ) : (
                            seg
                          )
                        )}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Shabby Message Utilities (Copy & Text-to-speech) */}
                {!isUser && (
                  <div className="flex items-center gap-2 px-1 text-[11px] text-[#888888]">
                    <button
                      onClick={() => handleCopyMessage(msg)}
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#171717] dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      title="Copy response"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSpeakMessage(msg)}
                      className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1 cursor-pointer ${
                        isSpeaking
                          ? 'text-[#737B5B] font-medium'
                          : 'hover:text-[#171717] dark:hover:text-white'
                      }`}
                      title={isSpeaking ? 'Stop speaking' : 'Read out loud'}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3 h-3 text-rose-500" />
                          <span className="text-rose-500">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="p-3 rounded-2xl rounded-tl-xs bg-white dark:bg-[#252525] border border-[#E8E4DC] dark:border-[#333333] shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#737B5B] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#737B5B] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#737B5B] animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-[#777777] dark:text-[#999999] ml-1.5 font-editorial italic">
                  Shabby is contemplating...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Suggestion Chips */}
        <div className="px-3.5 py-2 bg-white/40 dark:bg-[#181818]/40 border-t border-[#E8E4DC]/80 dark:border-[#2C2C2C]/80 overflow-x-auto no-scrollbar shrink-0 flex items-center gap-1.5">
          <button
            onClick={() => handleSendMessage('Explain the deeper philosophical meaning of this quote and its historical context.')}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs bg-white dark:bg-[#222] border border-[#E8E4DC] dark:border-[#2F2F2F] hover:border-[#737B5B] text-[#555555] dark:text-[#CCCCCC] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <BookOpen className="w-3 h-3 text-[#737B5B]" />
            <span>Explain Meaning</span>
          </button>

          <button
            onClick={() => handleTranslateCurrentQuote(currentLangObj.name, currentLangObj.nativeName)}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs bg-[#737B5B]/10 border border-[#737B5B]/30 text-[#737B5B] dark:text-[#9CA87F] hover:bg-[#737B5B]/20 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Globe className="w-3 h-3" />
            <span>Translate into {currentLangObj.name}</span>
          </button>

          <button
            onClick={() => handleSendMessage('Translate this quote into conversational Hinglish with a friendly modern takeaway.')}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs bg-white dark:bg-[#222] border border-[#E8E4DC] dark:border-[#2F2F2F] hover:border-[#737B5B] text-[#555555] dark:text-[#CCCCCC] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Languages className="w-3 h-3 text-amber-600" />
            <span>Hinglish</span>
          </button>

          <button
            onClick={() => handleSendMessage('Give me 2 practical actions to live out this quote in my daily routine.')}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs bg-white dark:bg-[#222] border border-[#E8E4DC] dark:border-[#2F2F2F] hover:border-[#737B5B] text-[#555555] dark:text-[#CCCCCC] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Actionable Takeaway</span>
          </button>
        </div>

        {/* Input Bar & Language Selector */}
        <div className="p-3 sm:p-4 bg-white/80 dark:bg-[#202020]/80 border-t border-[#E8E4DC] dark:border-[#2C2C2C] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Language Selector Popover Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen((o) => !o)}
                className="flex items-center gap-1 px-2.5 py-2.5 rounded-xl border border-[#E8E4DC] dark:border-[#333] bg-white dark:bg-[#252525] text-xs text-[#555555] dark:text-[#AAAAAA] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                title="Change Translation Target Language"
                aria-label="Target language"
              >
                <Languages className="w-3.5 h-3.5 text-[#737B5B] dark:text-[#9CA87F]" />
                <span className="hidden xs:inline sm:inline text-[11px] font-medium font-sans">
                  {currentLangObj.name}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-48 max-h-56 overflow-y-auto bg-white dark:bg-[#222] rounded-xl border border-[#E8E4DC] dark:border-[#333] shadow-xl p-1 z-50">
                  <div className="text-[10px] font-semibold uppercase px-2 py-1 text-[#888888]">
                    Select Language
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selectedLanguage === lang.code
                          ? 'bg-[#737B5B]/15 text-[#737B5B] dark:text-[#9CA87F] font-semibold'
                          : 'text-[#444] dark:text-[#CCC] hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-[10px] opacity-70 font-mono-time">
                        {lang.nativeName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input field */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Shabby anything about quotes, life, or translation..."
                disabled={isLoading}
                className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E8E4DC] dark:border-[#333] bg-white dark:bg-[#252525] text-[#171717] dark:text-[#F4F1EA] placeholder-[#999999] focus:outline-none focus:ring-1 focus:ring-[#737B5B]"
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-[#171717] dark:bg-[#F4F1EA] text-[#F7F5F0] dark:text-[#171717] hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
