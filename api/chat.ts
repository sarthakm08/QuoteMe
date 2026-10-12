import type { IncomingMessage, ServerResponse } from 'http';

interface ExtendedRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
}

interface ExtendedResponse extends ServerResponse {
  status?: (statusCode: number) => ExtendedResponse;
  json?: (data: any) => void;
  send?: (data: any) => void;
}

const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
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
   - Provide an authentic, natural, and culturally resonant translation in the requested language (e.g., Hindi, Hinglish, Bengali, Marathi, Tamil, Telugu, Gujarati, Urdu, Sanskrit, etc.).
   - If translated into Hindi or other Indian languages, provide both the script and a brief explanation in conversational tone.
   - If translated into Hinglish, use natural, expressive conversational Hindi written in English script.
5. Formatting:
   - Keep answers well-structured with clean spacing, bullet points, and gentle highlights.
   - Avoid sterile or robotic disclaimers. Speak like a wise, compassionate friend sitting across a cup of tea.`;

// Helper to send JSON response uniformly across Vercel Node runtime and standard HTTP
function sendJson(res: ExtendedResponse, statusCode: number, data: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-api-key');

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode);
    res.json(data);
  } else {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
}

// Helper to parse request body
async function parseBody(req: ExtendedRequest): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

export default async function handler(req: ExtendedRequest, res: ExtendedResponse) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-api-key');
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed. Only POST is supported.' });
  }

  let body: any;
  try {
    body = await parseBody(req);
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON request body.' });
  }

  const { prompt, history, activeQuote } = body || {};

  // Input validation
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return sendJson(res, 400, { error: 'Prompt is required and must be a non-empty string.' });
  }

  if (prompt.length > 5000) {
    return sendJson(res, 400, { error: 'Prompt exceeds maximum length of 5000 characters.' });
  }

  // Resolve API key securely:
  // 1. Client custom override header (from in-app settings modal)
  // 2. Server environment variable GEMINI_API_KEY
  // 3. Server environment variable VITE_GEMINI_API_KEY
  const headerKey =
    (req.headers['x-gemini-api-key'] as string | undefined) ||
    (req.headers['X-Gemini-Api-Key'] as string | undefined) ||
    body?.customApiKey;

  const apiKey =
    (headerKey && typeof headerKey === 'string' && headerKey.trim()) ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.VITE_GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return sendJson(res, 400, {
      error:
        'No Gemini API Key found. Please add the GEMINI_API_KEY environment variable in your Vercel project settings, or enter your personal key in Shabby Settings (⚙️).',
    });
  }

  // Dynamic system instruction with active quote context
  let systemInstructionText = SYSTEM_INSTRUCTION;
  if (activeQuote && typeof activeQuote.text === 'string' && activeQuote.text.trim()) {
    systemInstructionText += `\n\n[Active Quote in View]\nQuote: "${activeQuote.text}"\nAuthor: ${activeQuote.author}${
      activeQuote.source ? ` (${activeQuote.source})` : ''
    }\nTime Categories: ${activeQuote.timeCategories?.join(', ') || 'N/A'}\nGenres: ${
      activeQuote.genres?.join(', ') || 'N/A'
    }\nWhen the user refers to "this quote" or asks to explain, unpack, or translate it, refer directly to this quote.`;
  }

  // Build contents payload
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  // Add recent history if provided (ensuring multi-turn contents begins with 'user')
  if (Array.isArray(history)) {
    const firstUserIdx = history.findIndex((m) => m?.role === 'user');
    const validHistory = firstUserIdx >= 0 ? history.slice(firstUserIdx).slice(-8) : [];
    for (const msg of validHistory) {
      if (msg && typeof msg.text === 'string' && (msg.role === 'user' || msg.role === 'model')) {
        contents.push({
          role: msg.role,
          parts: [{ text: msg.text }],
        });
      }
    }
  }

  // Add current prompt
  contents.push({
    role: 'user',
    parts: [{ text: prompt.trim() }],
  });

  let lastErrorMessage = 'Unknown error communicating with Gemini API.';

  // Attempt each fallback model sequentially
  for (const model of FALLBACK_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const geminiResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstructionText }],
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

      if (!geminiResponse.ok) {
        const errorData: any = await geminiResponse.json().catch(() => ({}));
        const rawMessage = errorData?.error?.message || `HTTP ${geminiResponse.status}`;

        // If model busy (503) or not found (404), try next model
        if (geminiResponse.status === 503 || geminiResponse.status === 404) {
          lastErrorMessage = rawMessage;
          continue;
        }

        // Invalid key or permission error
        if (geminiResponse.status === 400 || geminiResponse.status === 403) {
          return sendJson(res, 400, {
            error: `Gemini API authentication failed: ${rawMessage}. Please verify your API key in Vercel environment variables or Shabby Settings.`,
          });
        }

        lastErrorMessage = rawMessage;
        continue;
      }

      const data: any = await geminiResponse.json();
      const parts = data?.candidates?.[0]?.content?.parts;
      if (Array.isArray(parts)) {
        const text = parts
          .map((p: any) => p?.text)
          .filter((t: any) => typeof t === 'string' && t.trim())
          .join('\n\n');

        if (text) {
          return sendJson(res, 200, { text: text.trim() });
        }
      }

      lastErrorMessage = 'No text content returned by Gemini model.';
    } catch (err: any) {
      lastErrorMessage = err?.message || 'Network error communicating with Google servers.';
    }
  }

  // If all models failed
  return sendJson(res, 502, {
    error: `Shabby could not generate a response right now: ${lastErrorMessage}. Please try again in a few moments.`,
  });
}
