import fs from 'node:fs/promises';
import path from 'node:path';

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

import { generateSpeechMp3 } from '@/lib/audio/openaiTts';
import { buildSpokenScript } from '@/lib/audio/spokenScript';

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
    const tts = await generateSpeechMp3(script.text);

    return new Response(tts.buffer, {
      status: 200,
      headers: {
        'Content-Type': tts.mimeType,
        'Cache-Control': 'public, max-age=0, s-maxage=86400',
        'X-Audio-Content-Hash': script.hash,
        'X-Audio-Model': tts.model,
        'X-Audio-Voice': tts.voice,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'Unknown TTS error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
