'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Radio } from 'lucide-react';

export interface HeaderProps {
  isRelayActive: boolean;
  peerCount: number;
}

export default function Header({ isRelayActive, peerCount }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-tactical-glass border-b border-guardian-border/80 h-14 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Shield Icon */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6600] to-red-600 flex items-center justify-center shadow-sm">
          <Shield className="w-5 h-5 text-black fill-black" />
        </div>

        {/* Title and Subtitle */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-sm tracking-widest font-semibold text-guardian-text uppercase">
              Festival Guardian
            </h1>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#FF6600]/40 text-[#FF6600] bg-[#FF6600]/10 tracking-wider">
              iQOO
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-guardian-green animate-pulse shadow-[0_0_5px_#22C55E]"></span>
            <span className="text-[10px] font-mono text-guardian-muted tracking-wide">
              ON-DEVICE · WEBGL · 30 FPS
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        {/* Mesh Node Count Indicator */}
        <div className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Radio className="w-4 h-4 text-guardian-cyan" />
          </motion.div>
          <span className="text-sm font-semibold text-guardian-cyan font-mono leading-none">
            {peerCount}
          </span>
          <span className="text-[10px] text-guardian-muted font-mono tracking-widest uppercase leading-none">
            Nodes
          </span>
        </div>
      </div>
    </header>
  );
}
