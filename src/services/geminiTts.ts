import { GoogleGenAI } from '@google/genai';
import type { VoiceType } from '@/data/books';
import { pcmBase64ToWavBlob } from '@/lib/audioUtils';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

/** Gemini prebuilt voice names: masculina, feminina, infantil */
const VOICE_NAMES: Record<VoiceType, string> = {
  masculina: 'Puck',
  feminina: 'Kore',
  infantil: 'Aoede',
};

/** Map app language labels to Gemini languageCode (ISO 639). */
function toLanguageCode(language: string): string {
  const lower = language.toLowerCase();
  if (lower.includes('português') || lower === 'pt') return 'pt-BR';
  if (lower.includes('español') || lower === 'es') return 'es-ES';
  if (lower.includes('hebraico') || lower === 'he') return 'he-IL';
  if (lower.includes('aramaico') || lower === 'ar') return 'ar-XA';
  if (lower.includes('english') || lower === 'en') return 'en-US';
  return 'pt-BR';
}

export function isGeminiTtsAvailable(): boolean {
  return Boolean(typeof GEMINI_API_KEY === 'string' && GEMINI_API_KEY.trim());
}

export interface GeminiTtsResult {
  blob: Blob;
  play: () => Promise<void>;
}

/**
 * Generate speech with Gemini TTS and return a WAV blob + play helper.
 * Returns null if API key is missing or request fails.
 */
export async function generateGeminiSpeech(
  text: string,
  voiceType: VoiceType,
  language: string
): Promise<GeminiTtsResult | null> {
  if (!isGeminiTtsAvailable() || !text.trim()) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY! });
    const languageCode = toLanguageCode(language);
    const voiceName = VOICE_NAMES[voiceType];

    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ role: 'user', parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
          languageCode,
        },
      },
    });

    const data = response.data;
    if (!data || typeof data !== 'string') return null;

    const blob = pcmBase64ToWavBlob(data);

    return {
      blob,
      play: () => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        return new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(url);
            resolve();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            reject(audio.error);
          };
          audio.play().catch(reject);
        });
      },
    };
  } catch (err) {
    console.warn('Gemini TTS error:', err);
    return null;
  }
}
