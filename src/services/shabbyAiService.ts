import type { Quote } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  relatedQuote?: {
    text: string;
    author: string;
  };
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'hinglish', name: 'Hinglish', nativeName: 'Hinglish (Roman Hindi)' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
];

class ShabbyAiService {
  private getStorage(): Storage | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
    return null;
  }

  public setCustomApiKey(key: string) {
    const storage = this.getStorage();
    if (storage) {
      if (key.trim()) {
        storage.setItem('shabby_custom_api_key', key.trim());
      } else {
        storage.removeItem('shabby_custom_api_key');
      }
    }
  }

  public getActiveApiKey(): string {
    const storage = this.getStorage();
    if (storage) {
      const customKey = storage.getItem('shabby_custom_api_key');
      if (customKey?.trim()) {
        return customKey.trim();
      }
    }
    return '';
  }

  public hasCustomApiKey(): boolean {
    const storage = this.getStorage();
    if (storage) {
      return Boolean(storage.getItem('shabby_custom_api_key')?.trim());
    }
    return false;
  }

  public async callGeminiWithFallback(
    prompt: string,
    history: ChatMessage[] = [],
    activeQuote?: Quote
  ): Promise<string> {
    const customKey = this.getActiveApiKey();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (customKey) {
      headers['x-gemini-api-key'] = customKey;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt,
          history: history.slice(-8),
          activeQuote,
        }),
      });

      if (!response.ok) {
        let errorMsg = `Server error (HTTP ${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData?.error && typeof errorData.error === 'string') {
            errorMsg = errorData.error;
          }
        } catch {
          // Response body was not JSON
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (data?.text && typeof data.text === 'string') {
        return data.text.trim();
      }

      throw new Error('No response text returned by Shabby service.');
    } catch (err: any) {
      throw err instanceof Error
        ? err
        : new Error('Network error connecting to Shabby service.');
    }
  }

  /**
   * Explain a quote in detail
   */
  public async explainQuote(quote: Quote): Promise<string> {
    const prompt = `Please explain this quote in rich, thoughtful detail:
“${quote.text}”
— ${quote.author}${quote.source ? ` (${quote.source})` : ''}

Please structure your answer with:
1. **Core Wisdom & Deep Meaning**: What truth is the author conveying beneath the surface?
2. **Context & Philosophical Roots**: Who was the author, and what worldview does this stem from?
3. **Everyday Life Application**: 1 or 2 practical ways I can apply this in my modern routine today.`;

    return this.callGeminiWithFallback(prompt, [], quote);
  }

  /**
   * Translate a quote into a local language
   */
  public async translateQuote(quote: Quote, targetLanguage: string): Promise<string> {
    const prompt = `Please translate and explain this quote in **${targetLanguage}**:
“${quote.text}”
— ${quote.author}${quote.source ? ` (${quote.source})` : ''}

Please provide:
1. **The Translation**: Accurate, poetic, and natural translation in ${targetLanguage} (if Indian language like Hindi, provide both standard script and conversational essence).
2. **Key Nuance / Meaning in ${targetLanguage}**: Explain what the quote means in simple, beautiful words of that language.
3. **A brief inspirational closing line** in ${targetLanguage}.`;

    return this.callGeminiWithFallback(prompt, [], quote);
  }

  /**
   * Free-form conversation with Shabby
   */
  public async sendMessage(
    message: string,
    history: ChatMessage[],
    activeQuote?: Quote
  ): Promise<string> {
    return this.callGeminiWithFallback(message, history, activeQuote);
  }
}

export const shabbyService = new ShabbyAiService();
