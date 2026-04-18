const DEFAULT_BUCKET = 'tts-audio';

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} for audio storage`);
  }
  return value;
}

function getSupabaseUrl(): string {
  return getEnv('SUPABASE_URL').replace(/\/$/, '');
}

function getSupabaseKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
}

function getStorageHeaders(contentType?: string): HeadersInit {
  const key = getSupabaseKey();
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY for audio storage');
  }
  return {
    Authorization: `Bearer ${key}`,
    apikey: key,
    ...(contentType ? { 'Content-Type': contentType } : {}),
  };
}

export function getAudioStorageBucket(): string {
  return process.env.SUPABASE_AUDIO_BUCKET || DEFAULT_BUCKET;
}

export function getAudioStoragePath(slug: string, contentHash: string): string {
  const safeSlug = slug.replace(/[^a-zA-Z0-9-/_]/g, '-');
  return `${safeSlug}/${contentHash}.mp3`;
}

export async function getStoredAudioUrl(path: string): Promise<string | null> {
  const res = await fetch(`${getSupabaseUrl()}/storage/v1/object/sign/${getAudioStorageBucket()}/${path}`, {
    method: 'POST',
    headers: getStorageHeaders('application/json'),
    body: JSON.stringify({ expiresIn: 60 * 60 * 24 * 7 }),
  });
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as { signedURL?: string };
  if (!data?.signedURL) {
    return null;
  }
  return `${getSupabaseUrl()}/storage/v1${data.signedURL}`;
}

export async function uploadAudioToStorage(path: string, buffer: Buffer, contentType = 'audio/mpeg'): Promise<string> {
  const res = await fetch(`${getSupabaseUrl()}/storage/v1/object/${getAudioStorageBucket()}/${path}`, {
    method: 'POST',
    headers: {
      ...getStorageHeaders(contentType),
      'x-upsert': 'true',
    },
    body: buffer,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase audio upload failed: ${res.status} ${text}`);
  }
  const signedUrl = await getStoredAudioUrl(path);
  if (!signedUrl) {
    throw new Error('Supabase audio upload succeeded, but signed URL generation failed');
  }
  return signedUrl;
}
