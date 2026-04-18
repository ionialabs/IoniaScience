const DEFAULT_MODEL = 'gpt-4o-mini-tts';
const DEFAULT_VOICE = 'marin';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export async function generateSpeechMp3(input: string) {
  const apiKey = getRequiredEnv('OPENAI_API_KEY');
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
      input,
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
    mimeType: response.headers.get('content-type') || 'audio/mpeg',
    model,
    voice,
  };
}
