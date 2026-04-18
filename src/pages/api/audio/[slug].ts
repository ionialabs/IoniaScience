import fs from 'node:fs/promises';
import path from 'node:path';

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

import {
  acquireLock,
  audioExists,
  ensureAudioDir,
  getAudioPaths,
  readAudioMeta,
  releaseLock,
  waitForAudio,
  writeAudioMeta,
} from '@/lib/audio/cache';
import { generateSpeechMp3 } from '@/lib/audio/openaiTts';
import { buildSpokenScript } from '@/lib/audio/spokenScript';

const SCRIPT_VERSION = 'v1';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
  }

  const posts = await getCollection('blog');
  const post = posts.find((entry) => entry.id === slug || entry.id.endsWith(`/${slug}`));
  if (!post) {
    return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 });
  }
  if (post.data.draft === true) {
    return new Response(JSON.stringify({ error: 'Audio is unavailable for draft posts' }), { status: 403 });
  }

  const candidatePaths = [
    path.join(process.cwd(), 'src', 'data', 'blog', `${post.id}.mdx`),
    path.join(process.cwd(), 'src', 'data', 'blog', `${post.id}.md`),
    path.join(process.cwd(), 'src', 'data', 'blog', post.id, 'index.mdx'),
    path.join(process.cwd(), 'src', 'data', 'blog', post.id, 'index.md'),
  ];
  let content = '';
  let loaded = false;
  for (const candidatePath of candidatePaths) {
    try {
      content = await fs.readFile(candidatePath, 'utf-8');
      loaded = true;
      break;
    } catch {
      // try next path
    }
  }
  if (!loaded) {
    return new Response(JSON.stringify({ error: 'Post source file not found' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const script = buildSpokenScript({
    slug,
    title: post.data.title,
    description: post.data.description,
    content,
  });

  await ensureAudioDir();
  const paths = getAudioPaths(slug);
  const existingMeta = await readAudioMeta(paths.metaPath);
  const cached = await audioExists(paths.audioPath);

  if (cached && existingMeta && existingMeta.contentHash === script.hash && existingMeta.scriptVersion === SCRIPT_VERSION) {
    return new Response(JSON.stringify({ ok: true, audioUrl: `${paths.publicUrl}?v=${existingMeta.contentHash}` }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const lockAcquired = await acquireLock(paths.lockPath);
  if (!lockAcquired) {
    const ready = await waitForAudio(paths.audioPath);
    if (ready) {
      const meta = await readAudioMeta(paths.metaPath);
      if (meta) {
        return new Response(JSON.stringify({ ok: true, audioUrl: `${paths.publicUrl}?v=${meta.contentHash}` }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    return new Response(JSON.stringify({ ok: false, pending: true, error: 'Audio generation already in progress' }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const tts = await generateSpeechMp3(script.text);
    await fs.writeFile(paths.audioPath, tts.buffer);
    await writeAudioMeta(paths.metaPath, {
      slug,
      contentHash: script.hash,
      generatedAt: new Date().toISOString(),
      voice: tts.voice,
      model: tts.model,
      scriptVersion: SCRIPT_VERSION,
      mimeType: tts.mimeType,
    });

    return new Response(JSON.stringify({ ok: true, audioUrl: `${paths.publicUrl}?v=${script.hash}` }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'Unknown TTS error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  } finally {
    await releaseLock(paths.lockPath);
  }
};
