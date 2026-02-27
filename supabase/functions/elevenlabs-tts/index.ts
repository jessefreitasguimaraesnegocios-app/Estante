import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ElevenLabs voice IDs mapped by type and emotional tone
const VOICE_MAP: Record<string, Record<string, string>> = {
  masculina: {
    default: 'nPczCjzI2devNBz1zQrb',   // Brian — warm narrator
    suspense: 'onwK4e9ZLuTAKqWW03F9',  // Daniel — deep, intense
    terror: 'N2lVS1w4EtoT3dr4eOWO',    // Callum — dark, eerie
    romance: 'JBFqnCBsd6RMkjVDRZzb',   // George — warm, smooth
    aventura: 'IKne3meq5aSn9XLyUdCD',  // Charlie — energetic
    ficção: 'CwhRBWXzGAHq8TQ4Fs17',    // Roger — authoritative
    fantasia: 'bIHbv24MWmeRgasZH58o',  // Will — expressive
    religioso: 'pqHfZKP75CvOlQylNhV4', // Bill — solemn
    clássico: 'JBFqnCBsd6RMkjVDRZzb',  // George — classical
    poesia: 'TX3LPaxmHKxFdv7VOQHJ',    // Liam — rhythmic
    autoajuda: 'nPczCjzI2devNBz1zQrb', // Brian — calm
  },
  feminina: {
    default: 'EXAVITQu4vr4xnSDxMaL',   // Sarah — natural, warm
    suspense: 'cgSgspJ2msm6clMCkdW9',   // Jessica — intense
    terror: 'Xb7hH8MSUJpSbSDYk0k2',    // Alice — eerie whisper
    romance: 'FGY2WhTYpPnrIDTdsKH5',   // Laura — gentle, romantic
    aventura: 'pFZP5JQG7iQjIQuC4Bku',  // Lily — dynamic
    ficção: 'EXAVITQu4vr4xnSDxMaL',    // Sarah — clear
    fantasia: 'XrExE9yKIg1WjnnlVkGX',  // Matilda — enchanting
    religioso: 'FGY2WhTYpPnrIDTdsKH5', // Laura — serene
    clássico: 'EXAVITQu4vr4xnSDxMaL',  // Sarah
    poesia: 'XrExE9yKIg1WjnnlVkGX',    // Matilda — poetic
    autoajuda: 'FGY2WhTYpPnrIDTdsKH5', // Laura — soothing
  },
  infantil: {
    default: 'SAz9YHcvj6GT2YYXdXww',   // River — playful
    suspense: 'SAz9YHcvj6GT2YYXdXww',
    terror: 'SAz9YHcvj6GT2YYXdXww',
    romance: 'SAz9YHcvj6GT2YYXdXww',
    aventura: 'SAz9YHcvj6GT2YYXdXww',
    ficção: 'SAz9YHcvj6GT2YYXdXww',
    fantasia: 'SAz9YHcvj6GT2YYXdXww',
    religioso: 'SAz9YHcvj6GT2YYXdXww',
    clássico: 'SAz9YHcvj6GT2YYXdXww',
    poesia: 'SAz9YHcvj6GT2YYXdXww',
    autoajuda: 'SAz9YHcvj6GT2YYXdXww',
  },
};

// Voice settings tuned per emotional genre
const VOICE_SETTINGS: Record<string, { stability: number; similarity_boost: number; style: number; speed: number }> = {
  default:    { stability: 0.55, similarity_boost: 0.75, style: 0.30, speed: 1.0 },
  suspense:   { stability: 0.40, similarity_boost: 0.80, style: 0.65, speed: 0.88 },
  terror:     { stability: 0.30, similarity_boost: 0.85, style: 0.80, speed: 0.82 },
  romance:    { stability: 0.60, similarity_boost: 0.75, style: 0.50, speed: 0.95 },
  aventura:   { stability: 0.45, similarity_boost: 0.78, style: 0.60, speed: 1.05 },
  ficção:     { stability: 0.50, similarity_boost: 0.75, style: 0.45, speed: 1.00 },
  fantasia:   { stability: 0.50, similarity_boost: 0.80, style: 0.55, speed: 0.95 },
  religioso:  { stability: 0.70, similarity_boost: 0.72, style: 0.20, speed: 0.90 },
  clássico:   { stability: 0.65, similarity_boost: 0.72, style: 0.30, speed: 0.93 },
  poesia:     { stability: 0.58, similarity_boost: 0.76, style: 0.55, speed: 0.90 },
  autoajuda:  { stability: 0.65, similarity_boost: 0.75, style: 0.35, speed: 0.95 },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      return new Response(JSON.stringify({ error: 'ELEVENLABS_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { text, voiceType = 'masculina', genre = 'default' } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Select voice ID based on type + genre
    const voiceGroup = VOICE_MAP[voiceType] ?? VOICE_MAP.masculina;
    const voiceId = voiceGroup[genre] ?? voiceGroup.default;
    const settings = VOICE_SETTINGS[genre] ?? VOICE_SETTINGS.default;

    // Limit text to 4500 chars to stay within ElevenLabs limits
    const limitedText = text.slice(0, 4500);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: limitedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: settings.stability,
            similarity_boost: settings.similarity_boost,
            style: settings.style,
            use_speaker_boost: true,
            speed: settings.speed,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`ElevenLabs API error [${response.status}]:`, errorBody);
      return new Response(JSON.stringify({ error: `ElevenLabs error: ${response.status}` }), {
        status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('TTS edge function error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
