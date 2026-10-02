'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, RotateCcw, Loader2, Activity, Sparkles } from 'lucide-react';
import type { BoundingBox, RiskData, DemoScenario } from '@/types';
import RiskMeter from './RiskMeter';

interface CameraRiskScreenProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  demoScenario: DemoScenario;
  onSelectScenario: (scenario: DemoScenario) => void;
  riskData: RiskData;
  detections: BoundingBox[];
  isModelReady: boolean;
  isModelLoading: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onToggleFacing: () => void;
  onInitModel: () => void;
  cameraError: string | null;
}

export default function CameraRiskScreen({
  videoRef,
  isActive,
  demoScenario,
  onSelectScenario,
  riskData,
  detections,
  isModelReady,
  isModelLoading,
  onStartCamera,
  onStopCamera,
  onToggleFacing,
  onInitModel,
  cameraError
}: CameraRiskScreenProps) {
  
  const isSimulating = demoScenario !== 'off';
  const showContent = isActive || isSimulating;

  const { color, gaugeColor, label } = useMemo(() => {
    switch (riskData.level) {
      case 'safe': return { color: '#22C55E', gaugeColor: '#00F59B', label: 'SAFE RISK' };
      case 'caution': return { color: '#84CC16', gaugeColor: '#84CC16', label: 'CAUTION RISK' };
      case 'warning': return { color: '#F59E0B', gaugeColor: '#FFB020', label: 'WARNING RISK' };
      case 'danger': return { color: '#F97316', gaugeColor: '#FF6600', label: 'DANGER RISK' };
      case 'critical': return { color: '#EF4444', gaugeColor: '#FF003C', label: 'CRITICAL RISK' };
      default: return { color: '#7D8590', gaugeColor: '#7D8590', label: 'UNKNOWN' };
    }
  }, [riskData.level]);

  // SVG Gauge calculations
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskData.score / 100) * circumference;

  return (
    <div className="relative w-full h-[68vh] min-h-[460px] max-h-[640px] rounded-2xl overflow-hidden bg-black border border-guardian-border shadow-2xl flex flex-col justify-between tactical-grid">
      
      {/* Video Element */}
      <video
        ref={videoRef as React.LegacyRef<HTMLVideoElement>}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Simulating Background */}
      {isSimulating && (
        <div className="absolute inset-0 bg-gradient-to-b from-guardian-bg via-black to-guardian-bg overflow-hidden flex items-end justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] z-10" />
          <div className="flex flex-wrap justify-center gap-2 p-8 pb-12 w-full h-full content-end z-0">
            {Array.from({ length: 28 }).map((_, i) => (
              <div 
                key={i} 
                className="w-9 h-20 rounded-t-full bg-gradient-to-b from-slate-600 to-slate-900 opacity-40 transform origin-bottom animate-pulse"
                style={{
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Scanner Elements */}
      {showContent && (
        <>
          <div className="scanner-beam z-10" />
          <div className="corner-bracket tl z-10" />
          <div className="corner-bracket tr z-10" />
          <div className="corner-bracket bl z-10" />
          <div className="corner-bracket br z-10" />
        </>
      )}

      {/* Bounding Boxes */}
      {showContent && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {detections.map((box, idx) => {
            let severityClass = '';
            if (riskData.level === 'danger' || riskData.level === 'critical') severityClass = 'danger';
            else if (riskData.level === 'warning') severityClass = 'warning';

            const video = videoRef.current;
            const videoW = video?.videoWidth || 640;
            const videoH = video?.videoHeight || 480;
            const scaleX = isSimulating ? 1 : (video?.clientWidth || 640) / videoW;
            const scaleY = isSimulating ? 1 : (video?.clientHeight || 480) / videoH;

            const left = isSimulating ? `${(box.x / 640) * 100}%` : `${box.x * scaleX}px`;
            const top = isSimulating ? `${(box.y / 480) * 100}%` : `${box.y * scaleY}px`;
            const width = isSimulating ? `${(box.width / 640) * 100}%` : `${box.width * scaleX}px`;
            const height = isSimulating ? `${(box.height / 480) * 100}%` : `${box.height * scaleY}px`;

            return (
              <div
                key={idx}
                className={`detection-box ${severityClass} absolute transition-all duration-300`}
                style={{ left, top, width, height }}
              />
            );
          })}
        </div>
      )}

      {/* Top HUD */}
      <div className="relative z-20 flex justify-between p-4 pointer-events-none">
        
        {/* Top-Left: Risk Stats */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="tactical-glass rounded-xl p-3 flex flex-col gap-3 pointer-events-auto shadow-lg backdrop-blur-md bg-black/40 border border-white/10"
            >
              <div className="flex items-center gap-4">
                {/* Gauge */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#162032"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke={gaugeColor}
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-mono font-black text-white leading-none">{riskData.score}</span>
                    <span className="text-[10px] font-mono text-guardian-muted">/100</span>
                  </div>
                </div>

                {/* Badge */}
                <div 
                  className="px-3 py-1.5 rounded-lg border flex items-center gap-2"
                  style={{ backgroundColor: `${color}33`, borderColor: `${color}66`, color }}
                >
                  <Activity size={16} />
                  <span className="text-sm font-bold tracking-wider">{label}</span>
                </div>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-[9px] text-guardian-muted font-mono tracking-wider">COUNT</span>
                  <span className="text-sm font-mono font-bold text-white">{riskData.personCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-guardian-muted font-mono tracking-wider">DENSITY</span>
                  <span className="text-sm font-mono font-bold text-white">{riskData.density.toFixed(1)} <span className="text-[10px] text-guardian-muted">p/m²</span></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-guardian-muted font-mono tracking-wider">FLOW DELTA</span>
                  <span className="text-sm font-mono font-bold text-white">{riskData.flowRate > 0 ? '+' : ''}{riskData.flowRate}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top-Right: Status */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="tactical-glass rounded-lg px-3 py-2 flex items-center gap-2 pointer-events-auto h-10 backdrop-blur-md bg-black/40 border border-white/10"
            >
              <span className="text-[10px] font-mono tracking-wider text-guardian-cyan font-bold mr-2">VISION ENGINE</span>
              <div className="h-3 w-[1px] bg-white/20 mx-1" />
              {isModelLoading ? (
                <div className="flex items-center gap-1.5 text-guardian-muted">
                  <Loader2 size={12} className="animate-spin" />
                  <span className="text-[10px] font-mono">LOADING...</span>
                </div>
              ) : isSimulating ? (
                <div className="flex items-center gap-1.5 text-guardian-amber">
                  <Sparkles size={12} />
                  <span className="text-[10px] font-mono">SIM CROWD</span>
                </div>
              ) : isModelReady ? (
                <div className="flex items-center gap-1.5 text-guardian-green">
                  <div className="w-1.5 h-1.5 rounded-full bg-guardian-green animate-pulse" />
                  <span className="text-[10px] font-mono">COCO-SSD</span>
                </div>
              ) : (
                <span className="text-[10px] font-mono text-guardian-muted">STANDBY</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Middle States: Loading, Error, Inactive */}
      <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none">
        {cameraError ? (
          <div className="flex flex-col items-center justify-center bg-black/80 p-8 rounded-2xl border border-guardian-red/30 pointer-events-auto">
            <CameraOff size={48} className="text-guardian-red mb-4" />
            <p className="text-white font-medium mb-2">Camera Error</p>
            <p className="text-guardian-muted text-sm text-center mb-6 max-w-xs">{cameraError}</p>
            <div className="flex gap-4">
              <button onClick={onStartCamera} className="px-4 py-2 bg-guardian-surface hover:bg-guardian-border text-white text-sm font-medium rounded-lg transition-colors border border-white/10 flex items-center gap-2">
                <RotateCcw size={16} /> Retry
              </button>
              <button onClick={() => onSelectScenario('safe')} className="px-4 py-2 bg-guardian-accent hover:bg-[#ff8533] text-black text-sm font-bold rounded-lg transition-colors">
                Use Demo
              </button>
            </div>
          </div>
        ) : !showContent && !isModelLoading ? (
          <div className="flex flex-col items-center justify-center pointer-events-auto">
            <div className="w-20 h-20 bg-guardian-surface rounded-full flex items-center justify-center border border-white/5 mb-6 text-guardian-muted">
              <Camera size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-wide">Surveillance Offline</h3>
            <p className="text-guardian-muted text-sm max-w-sm text-center">Start the camera feed or use the auto demo to begin analyzing crowd risks.</p>
          </div>
        ) : null}

        {isModelLoading && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-30 pointer-events-auto">
            <Loader2 size={48} className="text-guardian-accent animate-spin mb-6" />
            <p className="text-white font-mono tracking-widest text-sm animate-pulse">LOADING AI MODEL...</p>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="relative z-20 bg-black/40 backdrop-blur-md border-t border-white/5 p-3 flex items-center justify-between pointer-events-auto">
        {isSimulating ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-guardian-muted uppercase tracking-widest mr-2">Scenario:</span>
              {(['safe', 'surge', 'critical'] as const).map(sc => (
                <button
                  key={sc}
                  onClick={() => onSelectScenario(sc)}
                  className={`px-3 py-1.5 text-xs font-bold font-mono rounded transition-colors ${
                    demoScenario === sc 
                      ? sc === 'safe' ? 'bg-guardian-green text-black' 
                        : sc === 'surge' ? 'bg-guardian-amber text-black' 
                        : 'bg-guardian-red text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {sc.toUpperCase()}
                  {sc === 'safe' && ' (18)'}
                  {sc === 'surge' && ' (65)'}
                  {sc === 'critical' && ' (92)'}
                </button>
              ))}
            </div>
            <button 
              onClick={() => onSelectScenario('off')}
              className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded transition-colors"
            >
              EXIT DEMO
            </button>
          </>
        ) : isActive ? (
          <>
            <button 
              onClick={onToggleFacing}
              className="px-4 py-2 bg-guardian-surface hover:bg-guardian-border text-white text-xs font-bold rounded-lg transition-colors border border-white/10 flex items-center gap-2"
            >
              <RotateCcw size={14} />
              SWITCH CAMERA
            </button>
            <button 
              onClick={onStopCamera}
              className="px-4 py-2 bg-guardian-red/20 hover:bg-guardian-red/40 text-guardian-red text-xs font-bold rounded-lg transition-colors border border-guardian-red/30 flex items-center gap-2"
            >
              <CameraOff size={14} />
              STOP CAMERA
            </button>
          </>
        ) : (
          <div className="flex w-full items-center justify-center gap-4">
            <button 
              onClick={onStartCamera}
              disabled={isModelLoading}
              className="px-6 py-2.5 bg-guardian-accent hover:bg-[#ff8533] disabled:opacity-50 text-black text-sm font-bold tracking-wide rounded-lg transition-colors flex items-center gap-2"
            >
              <Camera size={16} />
              START CAMERA
            </button>
            <button 
              onClick={() => onSelectScenario('safe')}
              disabled={isModelLoading}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-sm font-bold tracking-wide rounded-lg transition-colors flex items-center gap-2"
            >
              <Activity size={16} />
              AUTO DEMO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
