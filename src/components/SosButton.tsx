'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, PackageX, AlertTriangle, HeartPulse } from 'lucide-react';

interface SosButtonProps {
  onSos: () => void;
  onTheft: () => void;
  onVolunteerRequest: () => void;
  onFirstAid?: () => void;
}

export default function SosButton({
  onSos,
  onTheft,
  onVolunteerRequest,
  onFirstAid,
}: SosButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const holdDuration = 800; // ms
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startHold = () => {
    setIsHolding(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min(elapsed / holdDuration, 1);
      setProgress(currentProgress);

      if (currentProgress >= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        triggerSos();
      }
    }, 16);
  };

  const stopHold = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progress < 1) {
      setIsHolding(false);
      setProgress(0);
    }
  };

  const triggerSos = () => {
    setIsHolding(false);
    setProgress(0);
    onSos();
    showToast('🆘 Critical SOS Emergency Alert Broadcasted!');
  };

  const handleFirstAid = () => {
    onFirstAid?.();
    showToast('🚑 Medical First Aid Request Dispatched via Mesh!');
  };

  const handleTheft = () => {
    onTheft();
    showToast('📦 Theft Incident Report Dispatched to Security!');
  };

  const handleHelp = () => {
    onVolunteerRequest();
    showToast('🙋 Volunteer Assistance Requested at Your Sector!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const size = 96;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto px-2">
      <div className="relative flex items-center justify-center mb-2">
        {/* Progress Ring */}
        <svg
          width={size}
          height={size}
          className="absolute pointer-events-none -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(239, 68, 68, 0.2)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#EF4444"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* SOS Button */}
        <motion.button
          animate={isHolding ? { scale: 1.1 } : { scale: 1 }}
          className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-white select-none touch-none ${
            isHolding ? 'bg-red-600' : 'bg-red-500'
          } ${!isHolding ? 'sos-pulse' : ''}`}
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
        >
          <ShieldAlert className="w-8 h-8 mb-0.5" />
          <span className="font-bold text-sm">SOS</span>
        </motion.button>
      </div>

      <p className="text-xs text-[#7D8590] mb-5 font-mono">Hold 0.8s to broadcast emergency</p>

      {/* Primary Emergency Secondary Actions */}
      <div className="w-full space-y-2">
        {/* Need First Aid - Primary Medical Emergency Button */}
        <button
          onClick={handleFirstAid}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-emerald-900/30 to-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 font-bold font-mono text-xs tracking-wider transition-all shadow-md active:scale-98"
        >
          <HeartPulse className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span>NEED FIRST AID / MEDICAL</span>
        </button>

        {/* Secondary Row: Theft & Volunteer Help */}
        <div className="flex gap-2 w-full">
          <button
            onClick={handleTheft}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 hover:border-amber-400 text-amber-400 font-medium font-mono text-xs transition-colors active:scale-98"
          >
            <PackageX className="w-4 h-4" />
            <span>Theft</span>
          </button>
          <button
            onClick={handleHelp}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#22D3EE]/15 border border-[#22D3EE]/30 hover:border-cyan-400 text-cyan-400 font-medium font-mono text-xs transition-colors active:scale-98"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Need Help</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-5 py-2.5 rounded-full font-mono font-bold text-xs shadow-2xl shadow-red-600/40 flex items-center gap-2 z-50 whitespace-nowrap border border-white/20"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
