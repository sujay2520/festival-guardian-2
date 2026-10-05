'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize2,
  Radio,
  Shield,
  Activity,
  Layers,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

export interface CctvCameraFeed {
  id: string;
  name: string;
  zone: string;
  src: string;
  status: 'ONLINE' | 'SURGE' | 'ELEVATED';
  riskScore: number;
  density: number;
  flow: number;
  fps: number;
  resolution: string;
  bitrate: string;
  latencyMs: number;
  codec: string;
}

export type CctvCamera = CctvCameraFeed;

export interface CctvStreamPlayerProps {
  selectedCameraId?: string;
  onCameraChange?: (feed: CctvCameraFeed) => void;
}

export const VENUE_CAMERAS: CctvCameraFeed[] = [
  {
    id: 'CAM-01',
    name: 'Main Stage Arena Overhead',
    zone: 'Zone B · Stage Front',
    src: '/concert-crowd.webm',
    status: 'ELEVATED',
    riskScore: 54,
    density: 3.4,
    flow: 1.2,
    fps: 30,
    resolution: '1920x1080',
    bitrate: '5.2 Mbps',
    latencyMs: 38,
    codec: 'H.264 / RTSP-WebRTC',
  },
  {
    id: 'CAM-02',
    name: 'Gate 3 Ingress Chokepoint',
    zone: 'Zone A · Gate 3 Bottleneck',
    src: '/event-video-1.webm',
    status: 'SURGE',
    riskScore: 68,
    density: 4.2,
    flow: 1.8,
    fps: 30,
    resolution: '1920x1080',
    bitrate: '4.8 Mbps',
    latencyMs: 44,
    codec: 'H.264 / RTSP-WebRTC',
  },
  {
    id: 'CAM-03',
    name: 'East Concourse Entrance',
    zone: 'Zone C · East Gate 1',
    src: '/event-video-2.webm',
    status: 'ONLINE',
    riskScore: 22,
    density: 1.8,
    flow: 0.6,
    fps: 30,
    resolution: '1920x1080',
    bitrate: '4.1 Mbps',
    latencyMs: 32,
    codec: 'H.264 / RTSP-WebRTC',
  },
];

export default function CctvStreamPlayer({
  selectedCameraId,
  onCameraChange,
}: CctvStreamPlayerProps = {}) {
  const [selectedCam, setSelectedCam] = useState<CctvCameraFeed>(() => {
    if (selectedCameraId) {
      const match = VENUE_CAMERAS.find((c) => c.id === selectedCameraId);
      if (match) return match;
    }
    return VENUE_CAMERAS[1]; // Default to Gate 3 Bottleneck
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCameraId) {
      const match = VENUE_CAMERAS.find((c) => c.id === selectedCameraId);
      if (match && match.id !== selectedCam.id) {
        setSelectedCam(match);
        if (videoRef.current) {
          videoRef.current.src = match.src;
          videoRef.current.play().catch(() => {});
        }
      }
    }
  }, [selectedCameraId, selectedCam.id]);

  // Real-time security camera timestamp with millisecond accuracy
  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date();
      const pad = (n: number, z = 2) => String(n).padStart(z, '0');
      const yyyy = now.getFullYear();
      const mm = pad(now.getMonth() + 1);
      const dd = pad(now.getDate());
      const hh = pad(now.getHours());
      const min = pad(now.getMinutes());
      const ss = pad(now.getSeconds());
      const ms = pad(Math.floor(now.getMilliseconds() / 10));
      setCurrentTime(`${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}.${ms}`);
    };

    updateTimestamp();
    const interval = setInterval(updateTimestamp, 65);
    return () => clearInterval(interval);
  }, []);

  const handleSelectCamera = (cam: CctvCameraFeed) => {
    setSelectedCam(cam);
    onCameraChange?.(cam);
    if (videoRef.current) {
      videoRef.current.src = cam.src;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Strategic Header & Architecture Explainer */}
      <div className="bg-gradient-to-r from-guardian-surface to-guardian-card border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-guardian-cyan/20 border border-guardian-cyan/40 flex items-center justify-center text-guardian-cyan">
              <Video size={16} />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold tracking-wider text-white uppercase flex items-center gap-2">
                Venue CCTV / RTSP Integration
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-guardian-cyan/15 border border-guardian-cyan/40 text-guardian-cyan font-bold tracking-widest uppercase">
                  Phase 2 Roadmap
                </span>
              </h3>
              <p className="text-[11px] text-guardian-muted">
                Ingests existing stadium & venue security camera feeds via WebRTC Edge Gateway
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-black/60 border border-white/10 text-guardian-green flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-guardian-green animate-pulse" />
              EDGE GATEWAY: SYNCED
            </span>
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex items-start gap-2.5 text-[11px] text-slate-300">
          <Info size={16} className="text-guardian-cyan shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="text-white font-semibold">Zero Hardware Procurement:</span> Large festivals and religious venues do not need new hardware for every attendee or gate. The same on-device TensorFlow vision pipeline ingests live RTSP/ONVIF streams over WebRTC to compute real-time density across all chokepoints simultaneously.
          </p>
        </div>
      </div>

      {/* Security Camera Video Feed Container with Tactical OSD */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video min-h-[260px] sm:min-h-[320px] rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl flex flex-col justify-between"
      >
        {/* Raw Video Feed */}
        <video
          ref={videoRef}
          src={selectedCam.src}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Tactical Scanlines & Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/70 pointer-events-none z-10" />

        {/* Security OSD Top Bar */}
        <div className="relative z-20 p-3 flex items-start justify-between text-white font-mono pointer-events-none">
          {/* Top Left: REC + Camera ID + Timestamp */}
          <div className="flex flex-col gap-1 drop-shadow-md">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600/80 border border-red-500 text-white text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                REC
              </div>
              <span className="text-xs font-bold text-white bg-black/60 px-2 py-0.5 rounded border border-white/10">
                {selectedCam.id} · {selectedCam.name}
              </span>
            </div>
            <div className="text-[11px] text-zinc-300 bg-black/60 px-2 py-0.5 rounded border border-white/10 w-fit tracking-wider">
              {currentTime || '2026-10-05 18:30:00.00'}
            </div>
          </div>

          {/* Top Right: Stream Specs */}
          <div className="flex flex-col items-end gap-1 drop-shadow-md">
            <div className="flex items-center gap-2 text-[10px] bg-black/70 px-2 py-0.5 rounded border border-white/10">
              <span className="text-guardian-cyan font-bold">STREAM:</span>
              <span className="text-zinc-200">{selectedCam.codec}</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-zinc-400 bg-black/60 px-2 py-0.5 rounded border border-white/10">
              <span>{selectedCam.resolution}</span>
              <span>•</span>
              <span className="text-guardian-green font-bold">{selectedCam.fps} FPS</span>
              <span>•</span>
              <span>{selectedCam.bitrate}</span>
              <span>•</span>
              <span className="text-guardian-cyan">{selectedCam.latencyMs}ms</span>
            </div>
          </div>
        </div>

        {/* Corner Brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#FF6600]/70 pointer-events-none z-15" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#FF6600]/70 pointer-events-none z-15" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#FF6600]/70 pointer-events-none z-15" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#FF6600]/70 pointer-events-none z-15" />

        {/* Security OSD Bottom Telemetry Bar */}
        <div className="relative z-20 p-3 flex flex-wrap items-end justify-between gap-2 pointer-events-auto">
          {/* Bottom Left: Live AI Vision Analysis on Stream */}
          {showAiOverlay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/75 backdrop-blur-md rounded-xl p-2.5 border border-white/15 flex items-center gap-3 font-mono shadow-lg"
            >
              <div className="flex flex-col">
                <span className="text-[9px] text-guardian-muted tracking-wider">AI RISK SCORE</span>
                <span className={`text-base font-bold ${
                  selectedCam.riskScore >= 70 ? 'text-guardian-red' :
                  selectedCam.riskScore >= 50 ? 'text-guardian-amber' : 'text-guardian-green'
                }`}>
                  {selectedCam.riskScore} <span className="text-[10px] text-guardian-muted">/100</span>
                </span>
              </div>
              <div className="h-6 w-[1px] bg-white/20" />
              <div className="flex flex-col">
                <span className="text-[9px] text-guardian-muted tracking-wider">EST. DENSITY</span>
                <span className="text-xs font-bold text-white">
                  {selectedCam.density.toFixed(1)} <span className="text-[9px] text-zinc-400">p/m²</span>
                </span>
              </div>
              <div className="h-6 w-[1px] bg-white/20" />
              <div className="flex flex-col">
                <span className="text-[9px] text-guardian-muted tracking-wider">STATUS</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                  selectedCam.status === 'SURGE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  selectedCam.status === 'ELEVATED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                  'bg-green-500/20 text-green-400 border border-green-500/40'
                }`}>
                  {selectedCam.status}
                </span>
              </div>
            </motion.div>
          )}

          {/* Bottom Right: Playback & Tactical Controls */}
          <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded-xl border border-white/15">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              title={isPlaying ? 'Pause Feed' : 'Resume Feed'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <button
              onClick={() => setShowAiOverlay(!showAiOverlay)}
              className={`p-1.5 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1 ${
                showAiOverlay ? 'bg-guardian-cyan text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
              title="Toggle On-Screen AI HUD Telemetry"
            >
              <Layers size={14} />
              <span className="text-[10px] hidden sm:inline">HUD</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              title="Fullscreen Stream"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Camera Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {VENUE_CAMERAS.map((cam) => {
          const isSelected = selectedCam.id === cam.id;
          return (
            <button
              key={cam.id}
              onClick={() => handleSelectCamera(cam)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-guardian-cyan/15 border-guardian-cyan shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                  : 'bg-guardian-card/80 border-white/10 hover:border-white/20 hover:bg-guardian-surface'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-guardian-cyan text-black font-black' : 'bg-black/60 text-zinc-300'
                }`}>
                  {cam.id}
                </span>
                <span className={`text-[10px] font-mono font-bold ${
                  cam.status === 'SURGE' ? 'text-amber-400' :
                  cam.status === 'ELEVATED' ? 'text-cyan-400' : 'text-green-400'
                }`}>
                  {cam.status}
                </span>
              </div>
              <p className="text-xs font-semibold text-white truncate">{cam.name}</p>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[10px] font-mono text-guardian-muted">
                <span>{cam.density} p/m²</span>
                <span>Risk: {cam.riskScore}/100</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
