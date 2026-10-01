'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, PackageX, AlertTriangle } from 'lucide-react';

interface SosButtonProps {
  onSos: () => void;
  onTheft: () => void;
  onVolunteerRequest: () => void;
}

export default function SosButton({ onSos, onTheft, onVolunteerRequest }: SosButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  
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
    setToastVisible(true);
  };
  
  useEffect(() => {
    if (toastVisible) {
      const t = setTimeout(() => setToastVisible(false), 2000);
      return () => clearTimeout(t);
    }
  }, [toastVisible]);
  
  const size = 96;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center">
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
      
      <p className="text-xs text-[#7D8590] mb-6">Hold 0.8s to send</p>
      
      {/* Secondary Actions */}
      <div className="flex gap-4 w-full px-4 max-w-sm justify-center">
        <button
          onClick={onTheft}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/20 text-amber-400 font-medium transition-colors active:bg-[#F59E0B]/25"
        >
          <PackageX className="w-5 h-5" />
          <span>Theft</span>
        </button>
        <button
          onClick={onVolunteerRequest}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#22D3EE]/15 border border-[#22D3EE]/20 text-cyan-400 font-medium transition-colors active:bg-[#22D3EE]/25"
        >
          <AlertTriangle className="w-5 h-5" />
          <span>Need Help</span>
        </button>
      </div>

      {/* SOS Toast */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-red-600/30 flex items-center gap-2 z-50 whitespace-nowrap"
          >
            🆘 SOS Alert Sent!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
