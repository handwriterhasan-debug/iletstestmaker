import { useEffect, useRef, useState } from 'react';

interface LiveAudioVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

export default function LiveAudioVisualizer({ stream, isRecording }: LiveAudioVisualizerProps) {
  const [volumeData, setVolumeData] = useState<number[]>(Array(16).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (isRecording && stream) {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }
      
      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 64;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      sourceRef.current = ctx.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Sample 16 bars from the frequencies
        const newVolumes = [];
        const step = Math.floor(bufferLength / 16);
        for (let i = 0; i < 16; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += dataArray[i * step + j];
          }
          const avg = sum / step;
          // Normalize to 0-1
          newVolumes.push(Math.min(1, avg / 255));
        }
        setVolumeData(newVolumes);
        
        rafRef.current = requestAnimationFrame(draw);
      };

      draw();
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      setVolumeData(Array(16).fill(0));
      
      if (sourceRef.current && analyserRef.current) {
        sourceRef.current.disconnect();
      }
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRecording, stream]);

  return (
    <div className="flex items-end gap-1 h-12">
      {volumeData.map((vol, i) => {
        const height = Math.max(4, vol * 48); // Min height 4px, max 48px
        return (
          <div
            key={i}
            className="w-1.5 bg-[#0ea5e9] rounded-full transition-all duration-75"
            style={{ height: `${height}px`, opacity: Math.max(0.3, vol + 0.3) }}
          />
        );
      })}
    </div>
  );
}
