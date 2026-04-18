const DEFAULT_MODEL = 'gpt-4o-mini-tts';
const DEFAULT_VOICE = 'marin';

export async function generateSpeechMp3(text: string): Promise<{ buffer: Buffer; model: string; voice: string; mimeType: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY for TTS generation');

  const model = process.env.OPENAI_TTS_MODEL || DEFAULT_MODEL;
  const voice = process.env.OPENAI_TTS_VOICE || DEFAULT_VOICE;

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      format: 'mp3',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('TTS authentication failed. Check OPENAI_API_KEY in the preview environment.');
    }
    if (response.status === 429) {
      throw new Error('TTS is temporarily rate-limited. Please try again shortly.');
    }
    throw new Error(`OpenAI TTS failed: ${response.status} ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    model,
    voice,
    mimeType: 'audio/mpeg',
  };
}
