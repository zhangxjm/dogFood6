'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Radio, Wifi } from 'lucide-react';

interface LivePlayerProps {
  hlsUrl: string;
  webrtcUrl?: string;
  isLive: boolean;
  lowLatency?: boolean;
  title: string;
}

export default function LivePlayer({ hlsUrl, webrtcUrl, isLive, lowLatency = true, title }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [latency, setLatency] = useState<number>(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported() && hlsUrl) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: lowLatency,
        backBufferLength: lowLatency ? 2 : 30,
        maxBufferLength: lowLatency ? 4 : 60,
        liveSyncDuration: lowLatency ? 0.5 : 3,
        liveMaxLatencyDuration: lowLatency ? 2 : 10,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          console.log('Autoplay prevented');
        });
      });

      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        if (video.buffered.length > 0) {
          const end = video.buffered.end(video.buffered.length - 1);
          const current = video.currentTime;
          setLatency(Math.round((end - current) * 1000));
        }
      });

      return () => {
        hls.destroy();
      };
    }
  }, [hlsUrl, lowLatency]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3005);
  };

  const getLatencyColor = () => {
    if (latency < 800) return 'text-green-400';
    if (latency < 1500) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {isLive && (
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <span className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
            <Radio size={14} className="live-indicator" />
            <span>直播中</span>
          </span>
          {lowLatency && (
            <span className="flex items-center space-x-1 bg-heritage-gold text-white px-3 py-1 rounded text-sm">
              <Wifi size={14} />
              <span>低延迟</span>
            </span>
          )}
          <span className={`text-sm font-mono ${getLatencyColor()}`}>
            {latency}ms
          </span>
        </div>
      )}

      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
        {title}
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-heritage-gold transition-colors"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={toggleMute}
              className="text-white hover:text-heritage-gold transition-colors"
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            <div className="text-white text-sm">
              {quality}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-white hover:text-heritage-gold transition-colors">
              <Settings size={20} />
            </button>
            <button className="text-white hover:text-heritage-gold transition-colors">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>

      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
        >
          <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
            <Play size={40} className="text-heritage-red ml-1" fill="currentColor" />
          </div>
        </button>
      )}
    </div>
  );
}
