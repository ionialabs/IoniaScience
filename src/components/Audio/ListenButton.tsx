import { useState } from 'react';

interface Props {
  slug: string;
}

export default function ListenButton({ slug }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const onClick = async () => {
    if (audioUrl) {
      setStatus('ready');
      return;
    }

    setStatus('loading');
    setMessage('Generating audio...');

    try {
      const res = await fetch(`/api/audio/${slug}`);
      const contentType = res.headers.get('content-type') || '';
      const payload = contentType.includes('application/json') ? await res.json() : null;

      if (!res.ok) {
        let errorMessage = `Audio generation failed (${res.status})`;
        if (payload) {
          errorMessage = payload?.error || payload?.detail || errorMessage;
        } else if (res.status === 500) {
          errorMessage = 'Server-side TTS failed in preview. Check function logs or runtime environment.';
        } else if (res.status === 404) {
          errorMessage = 'Audio route was not found in preview.';
        } else if (res.status === 502 || res.status === 503 || res.status === 504) {
          errorMessage = `Preview function failed upstream (${res.status}).`;
        }
        throw new Error(errorMessage);
      }

      const nextUrl = payload?.audioUrl;
      if (!nextUrl) {
        throw new Error('Audio URL was not returned by the preview function.');
      }

      setAudioUrl(nextUrl);
      setStatus('ready');
      setMessage(payload?.cached ? 'Audio loaded from cache.' : 'Audio ready.');
    } catch (error) {
      setStatus('error');
      if (error instanceof TypeError) {
        setMessage('Network or preview function error while requesting audio.');
        return;
      }
      setMessage(error instanceof Error ? error.message : 'Audio unavailable right now');
    }
  };

  return (
    <div className="my-8 rounded-xl border border-base-300 bg-base-200/40 p-4 dark:border-base-700 dark:bg-base-900/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-base-content">Article audio</p>
          <p className="text-sm opacity-80">Listen to a generated narration of this post.</p>
        </div>

        <button
          type="button"
          onClick={onClick}
          className="inline-flex w-fit items-center gap-2 rounded-md bg-base-content px-4 py-2 text-sm font-medium text-base-100 transition opacity-100 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={audioUrl ? 'Play article audio' : 'Generate and play article audio'}
        >
          <span aria-hidden="true" className="text-base leading-none">
            {audioUrl ? '🔊' : status === 'loading' ? '⏳' : '🔈'}
          </span>
          <span>{audioUrl ? 'Play article audio' : status === 'loading' ? 'Preparing audio...' : 'Listen to this article'}</span>
        </button>
      </div>

      {message && <p className="mt-3 text-sm opacity-80">{message}</p>}

      {audioUrl && (
        <audio className="mt-4 w-full" controls preload="none" src={audioUrl}>
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}
