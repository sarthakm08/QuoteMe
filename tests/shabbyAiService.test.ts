import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shabbyService, SUPPORTED_LANGUAGES } from '../src/services/shabbyAiService';

describe('Shabby AI Service', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const mockLocalStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    };
    vi.stubGlobal('localStorage', mockLocalStorage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('provides supported local and global languages', () => {
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThan(10);
    const hindi = SUPPORTED_LANGUAGES.find((l) => l.code === 'hi');
    const hinglish = SUPPORTED_LANGUAGES.find((l) => l.code === 'hinglish');
    const bengali = SUPPORTED_LANGUAGES.find((l) => l.code === 'bn');
    const tamil = SUPPORTED_LANGUAGES.find((l) => l.code === 'ta');

    expect(hindi).toBeDefined();
    expect(hindi?.nativeName).toBe('हिन्दी');
    expect(hinglish).toBeDefined();
    expect(bengali).toBeDefined();
    expect(tamil).toBeDefined();
  });

  it('manages API key correctly with default and custom override', () => {
    expect(shabbyService.hasCustomApiKey()).toBe(false);

    // Set custom key
    shabbyService.setCustomApiKey('custom-test-key-123');
    expect(shabbyService.hasCustomApiKey()).toBe(true);
    expect(shabbyService.getActiveApiKey()).toBe('custom-test-key-123');

    // Clear custom key
    shabbyService.setCustomApiKey('');
    expect(shabbyService.hasCustomApiKey()).toBe(false);
  });

  it('formats quote explanation prompts and parses responses properly', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: 'This quote by Marcus Aurelius inspires perseverance.' }],
            },
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const testQuote = {
      id: 'test-1',
      text: 'Waste no more time arguing about what a good man should be. Be one.',
      author: 'Marcus Aurelius',
      source: 'Meditations',
      timeCategories: ['morning' as const],
      genres: ['stoicism' as const],
    };

    const explanation = await shabbyService.explainQuote(testQuote);
    expect(explanation).toBe('This quote by Marcus Aurelius inspires perseverance.');
    expect(mockFetch).toHaveBeenCalled();
  });

  it('formats translation prompts into local language properly', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: 'अनुवाद: बहस करने में समय बर्बाद न करें कि एक अच्छा व्यक्ति कैसा होना चाहिए। एक बनें।' }],
            },
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const testQuote = {
      id: 'test-1',
      text: 'Waste no more time arguing about what a good man should be. Be one.',
      author: 'Marcus Aurelius',
      source: 'Meditations',
      timeCategories: ['morning' as const],
      genres: ['stoicism' as const],
    };

    const translation = await shabbyService.translateQuote(testQuote, 'Hindi (हिन्दी)');
    expect(translation).toContain('अनुवाद:');
    expect(mockFetch).toHaveBeenCalled();
  });
});
