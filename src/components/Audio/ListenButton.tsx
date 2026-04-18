import { useEffect, useRef, useState } from 'react';

type Props = {
  slug: string;
};

export default function ListenButton({ slug }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const onClick = async () => {
    if (audioUrl) {
      setStatus('ready');
      return;
    }
    setStatus('loading');
    setMessage('Generating audio...');
    try {
      const res = await fetch(`/api/audio/${slug}`);
      if (!res.ok) {
        let errorMessage = 'Audio generation failed';
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          errorMessage = data?.error || errorMessage;
        } else {
          const text = await res.text();
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }
      const blob = await res.blob();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const nextUrl = URL.createObjectURL(blob);
      objectUrlRef.current = nextUrl;
      setAudioUrl(nextUrl);
      setStatus('ready');
      setMessage('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Audio unavailable right now');
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-base-300 p-4 dark:border-base-600/60" data-pagefind-ignore>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onClick}
          disabled={false}
          className="inline-flex w-fit items-center gap-2 rounded-md bg-base-content px-4 py-2 text-sm font-medium text-base-100 transition opacity-100 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={audioUrl ? 'Play article audio' : 'Generate and play article audio'}
        >
          <span aria-hidden="true" className="text-base leading-none">
            {audioUrl ? '🔊' : status === 'loading' ? '⏳' : '🔈'}
          </span>
          <span>{audioUrl ? 'Play article audio' : status === 'loading' ? 'Preparing audio...' : 'Listen to this article'}</span>
        </button>

        {message && <p className="text-sm opacity-80">{message}</p>}

        {audioUrl && (
          <audio controls preload="none" className="w-full">
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    </div>
  );
}
