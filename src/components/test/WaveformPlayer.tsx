import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause } from 'lucide-react';

interface WaveformPlayerProps {
  blobUrl: string;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export default function WaveformPlayer({ blobUrl, onEnded, onPlay, onPause }: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    wavesurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(14,165,233, 0.4)', // lime slightly faded
      progressColor: 'rgb(5, 150, 105)', // main lime
      height: 48,
      cursorWidth: 2,
      cursorColor: 'rgb(5, 150, 105)',
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
    });

    wavesurferRef.current.load(blobUrl);

    wavesurferRef.current.on('ready', () => {
      setDuration(wavesurferRef.current?.getDuration() || 0);
    });

    wavesurferRef.current.on('play', () => {
      setIsPlaying(true);
      onPlay?.();
    });

    wavesurferRef.current.on('pause', () => {
      setIsPlaying(false);
      onPause?.();
    });

    wavesurferRef.current.on('finish', () => {
      setIsPlaying(false);
      onEnded?.();
    });

    wavesurferRef.current.on('timeupdate', (time) => {
      setCurrentTime(time);
    });

    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [blobUrl]);

  const togglePlay = () => {
    wavesurferRef.current?.playPause();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4 w-full bg-slate-200 dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/5">
      <button 
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center shrink-0 hover:bg-[#0284c7] transition-colors relative"
      >
        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
      </button>
      <div className="flex-1" ref={containerRef}></div>
      <div className="text-xs font-mono font-bold text-slate-500 w-16 text-right shrink-0">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
}
