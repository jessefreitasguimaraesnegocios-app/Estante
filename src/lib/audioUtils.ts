/**
 * Gemini TTS returns 16-bit PCM mono at 24000 Hz.
 * Build a WAV blob so we can play it with HTMLAudioElement.
 */
const SAMPLE_RATE = 24000;
const NUM_CHANNELS = 1;
const BITS_PER_SAMPLE = 16;

export function pcmBase64ToWavBlob(pcmBase64: string): Blob {
  const binary = atob(pcmBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return pcmToWavBlob(bytes.buffer);
}

export function pcmToWavBlob(pcmBuffer: ArrayBuffer): Blob {
  const dataLength = pcmBuffer.byteLength;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size (16 for PCM)
  view.setUint16(20, 1, true);   // audio format (1 = PCM)
  view.setUint16(22, NUM_CHANNELS, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8), true);
  view.setUint16(32, NUM_CHANNELS * (BITS_PER_SAMPLE / 8), true);
  view.setUint16(34, BITS_PER_SAMPLE, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLength, true);

  return new Blob([header, pcmBuffer], { type: 'audio/wav' });
}
