import { useEffect, useRef, useState } from 'react';

type Props = {
  slug: string;
};

export default function ListenButton({ slug }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const pollTimeoutRef = useRef<number | null>(null);

  const requestAudio = async () => {
    const res = await fetch(`/api/audio/${slug}`);
    const data = await res.json();
    if (res.status === 202 || data?.pending) {
      setStatus('loading');
      setMessage('Audio is being prepared...');
      pollTimeoutRef.current = window.setTimeout(() => {
        void requestAudio();
      }, 4000);
      return;
    }
    if (!res.ok || !data?.audioUrl) {
      throw new Error(data?.error || 'Audio generation failed');
    }
    setAudioUrl(data.audioUrl);
    setStatus('ready');
    setMessage('');
  };

  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current !== null) {
        window.clearTimeout(pollTimeoutRef.current);
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
      await requestAudio();
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
          className="inline-flex w-fit items-center rounded-md bg-base-content px-4 py-2 text-sm font-medium text-base-100 transition opacity-100 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {audioUrl ? 'Play article audio' : status === 'loading' ? 'Preparing audio...' : 'Listen to this article'}
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
