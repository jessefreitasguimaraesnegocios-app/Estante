import type { VoiceType, Genre } from '@/data/books';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export interface ElevenLabsTtsResult {
  blob: Blob;
}

/**
 * Call the ElevenLabs TTS edge function.
 * Returns a Blob of MP3 audio or null on failure.
 */
export async function generateElevenLabsSpeech(
  text: string,
  voiceType: VoiceType,
  genre: Genre | 'default' = 'default'
): Promise<ElevenLabsTtsResult | null> {
  if (!text.trim() || !SUPABASE_URL) return null;

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ text, voiceType, genre }),
    });

    if (!response.ok) return null;

    const blob = await response.blob();
    return { blob };
  } catch (err) {
    console.warn('ElevenLabs TTS error:', err);
    return null;
  }
}

export function isElevenLabsAvailable(): boolean {
  return Boolean(SUPABASE_URL);
}
