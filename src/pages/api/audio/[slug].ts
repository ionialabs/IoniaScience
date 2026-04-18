import fs from 'node:fs/promises';
import path from 'node:path';

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

import { generateSpeechMp3 } from '@/lib/audio/openaiTts';
import { buildSpokenScript } from '@/lib/audio/spokenScript';
import { getAudioStoragePath, getStoredAudioUrl, uploadAudioToStorage } from '@/lib/audio/storage';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const posts = await getCollection('blog');
  const post = posts.find((entry) => entry.id === slug || entry.id.endsWith(`/${slug}`));
  if (!post) {
    return new Response(JSON.stringify({ error: 'Post not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (post.data.draft === true) {
    return new Response(JSON.stringify({ error: 'Audio is unavailable for draft posts' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const candidatePaths = [
    path.join(process.cwd(), 'src', 'data', 'blog', `${post.id}.mdx`),
    path.join(process.cwd(), 'src', 'data', 'blog', `${post.id}.md`),
    path.join(process.cwd(), 'src', 'data', 'blog', post.id, 'index.mdx'),
    path.join(process.cwd(), 'src', 'data', 'blog', post.id, 'index.md'),
  ];

  let content = '';
  for (const candidatePath of candidatePaths) {
    try {
      content = await fs.readFile(candidatePath, 'utf-8');
      break;
    } catch {
      // try next path
    }
  }

  if (!content) {
    return new Response(JSON.stringify({ error: 'Post source file not found' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const script = buildSpokenScript({
      slug,
      title: post.data.title,
      description: post.data.description,
      content,
    });

    const storagePath = getAudioStoragePath(slug, script.hash);
    const existingUrl = await getStoredAudioUrl(storagePath);
    if (existingUrl) {
      return new Response(JSON.stringify({ ok: true, audioUrl: existingUrl, cached: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const tts = await generateSpeechMp3(script.text);
    const audioUrl = await uploadAudioToStorage(storagePath, tts.buffer, tts.mimeType);

    return new Response(
      JSON.stringify({
        ok: true,
        audioUrl,
        cached: false,
        contentHash: script.hash,
        voice: tts.voice,
        model: tts.model,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown TTS error';
    return new Response(JSON.stringify({ ok: false, error: message, detail: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
