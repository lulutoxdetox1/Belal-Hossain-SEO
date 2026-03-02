
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
  currentTime: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioBuffer, isPlaying, currentTime }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !audioBuffer) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(0, amp);

      for (let i = 0; i < canvas.width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
          const datum = data[i * step + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }
        
        const x = i;
        const y = (1 + min) * amp;
        const h = Math.max(1, (max - min) * amp);

        // Highlight played part
        const progress = currentTime / audioBuffer.duration;
        const currentX = canvas.width * progress;

        ctx.fillStyle = x < currentX ? '#3b82f6' : '#cbd5e1';
        ctx.fillRect(x, y, 1, h);
      }
    };

    draw();
  }, [audioBuffer, currentTime]);

  return (
    <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-200">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={100} 
        className="w-full h-24 rounded-lg"
      />
    </div>
  );
};

export default AudioVisualizer;
