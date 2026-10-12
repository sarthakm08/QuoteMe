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

const DEFAULT_API_KEY =
  (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || '';

const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
];

const SYSTEM_INSTRUCTION = `You are "Shabby", the personal literary philosopher and companion of ChronoQuotes.
Your core traits:
1. Warm, deeply insightful, poetic, articulate, and encouraging.
2. An expert in timeless philosophy (Stoicism, Eastern thought, Vedanta, Existentialism, Taoism), literature, psychology, history, and personal growth.
3. When explaining a quote:
   - Provide its deeper philosophical and psychological meaning.
   - Clarify the context/background of the author or book if known.
   - Offer 1-2 practical reflections or everyday takeaways on how the reader can live or apply this wisdom.
4. When translating:
   - Provide an authentic, natural, and culturally resonant translation in the requested language (e.g., Hindi, Hinglish, Bengali, Marathi, Tamil, Telugu, Gujarati, Urdu, etc.).
   - If translated into Hindi or other Indian languages, provide both the script and a brief explanation in conversational tone.
   - If translated into Hinglish, use natural, expressive conversational Hindi written in English script.
5. Formatting:
   - Keep answers well-structured with clean spacing, bullet points, and gentle highlights.
   - Avoid sterile or robotic disclaimers. Speak like a wise, compassionate friend sitting across a cup of tea.`;

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

  private getApiKey(): string {
    const storage = this.getStorage();
    if (storage) {
      const customKey = storage.getItem('shabby_custom_api_key');
      if (customKey?.trim()) {
        return customKey.trim();
      }
    }
    return DEFAULT_API_KEY;
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
    return this.getApiKey();
  }

  public hasCustomApiKey(): boolean {
    const storage = this.getStorage();
    if (storage) {
      return Boolean(storage.getItem('shabby_custom_api_key'));
    }
    return false;
  }

  public async callGeminiWithFallback(
    prompt: string,
    history: ChatMessage[] = [],
    activeQuote?: Quote
  ): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error(
        'No Gemini API Key found. Please add your Gemini API Key in Settings (⚙️) or set VITE_GEMINI_API_KEY in your environment to chat with Shabby.'
      );
    }

    // Prepare contents array
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // If active quote is present, inject brief quote context in history if needed
    if (activeQuote && history.length === 0) {
      contents.push({
        role: 'user',
        parts: [
          {
            text: `[Context: I am reflecting on this quote from ChronoQuotes: "${activeQuote.text}" by ${activeQuote.author}${activeQuote.source ? ` (${activeQuote.source})` : ''}. Time theme: ${activeQuote.timeCategories.join(', ')}. Genres: ${activeQuote.genres.join(', ')}.]`,
          },
        ],
      });
      contents.push({
        role: 'model',
        parts: [
          {
            text: `Understood! I am ready to delve into "${activeQuote.text}" by ${activeQuote.author} with you. How would you like us to explore it?`,
          },
        ],
      });
    }

    // Add previous history (last 8 messages for context window management)
    const recentHistory = history.slice(-8);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role,
        parts: [{ text: msg.text }],
      });
    }

    // Add current prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    let lastError: Error | null = null;

    // Try each model sequentially in case of 503 high demand or temporary errors
    for (const model of FALLBACK_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            contents,
            generationConfig: {
              temperature: 0.75,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1000,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errMsg = errorData?.error?.message || `HTTP ${response.status}`;
          // If model is busy (503) or not found (404), try next model
          if (response.status === 503 || response.status === 404) {
            console.warn(`Model ${model} unavailable (${errMsg}), falling back to next...`);
            lastError = new Error(errMsg);
            continue;
          }
          throw new Error(errMsg);
        }

        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (candidateText && typeof candidateText === 'string') {
          return candidateText.trim();
        }

        throw new Error('No response text returned by model.');
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini request failed on model ${model}:`, err?.message);
      }
    }

    throw lastError || new Error('Could not connect to Shabby right now. Please check your network or try again.');
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
