import fs from 'node:fs/promises';
import path from 'node:path';

export interface AudioMeta {
  slug: string;
  contentHash: string;
  generatedAt: string;
  voice: string;
  model: string;
  scriptVersion: string;
  mimeType: string;
}

const AUDIO_ROOT = path.join(process.cwd(), 'public', 'audio');

export function getAudioPaths(slug: string) {
  const safeSlug = slug.replace(/[^a-zA-Z0-9-/_]/g, '-');
  return {
    dir: AUDIO_ROOT,
    audioPath: path.join(AUDIO_ROOT, `${safeSlug}.mp3`),
    metaPath: path.join(AUDIO_ROOT, `${safeSlug}.json`),
    lockPath: path.join(AUDIO_ROOT, `${safeSlug}.lock`),
    publicUrl: `/audio/${safeSlug}.mp3`,
  };
}

export async function ensureAudioDir() {
  await fs.mkdir(AUDIO_ROOT, { recursive: true });
}

export async function readAudioMeta(metaPath: string): Promise<AudioMeta | null> {
  try {
    const raw = await fs.readFile(metaPath, 'utf-8');
    return JSON.parse(raw) as AudioMeta;
  } catch {
    return null;
  }
}

export async function audioExists(audioPath: string): Promise<boolean> {
  try {
    await fs.access(audioPath);
    return true;
  } catch {
    return false;
  }
}

export async function writeAudioMeta(metaPath: string, meta: AudioMeta) {
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
}

export async function acquireLock(lockPath: string, staleAfterMs = 10 * 60 * 1000): Promise<boolean> {
  try {
    await fs.writeFile(lockPath, String(Date.now()), { flag: 'wx' });
    return true;
  } catch {
    try {
      const raw = await fs.readFile(lockPath, 'utf-8');
      const ts = Number(raw.trim());
      if (Number.isFinite(ts) && Date.now() - ts > staleAfterMs) {
        await fs.unlink(lockPath);
        await fs.writeFile(lockPath, String(Date.now()), { flag: 'wx' });
        return true;
      }
    } catch {
      // ignore and fall through
    }
    return false;
  }
}

export async function releaseLock(lockPath: string) {
  try {
    await fs.unlink(lockPath);
  } catch {
    // ignore
  }
}

export async function waitForAudio(audioPath: string, timeoutMs = 25000, intervalMs = 1000): Promise<boolean> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await audioExists(audioPath)) return true;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return false;
}
