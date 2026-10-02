'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Camera, Radio, AlertTriangle, Info, X } from 'lucide-react';

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('fg-onboarding-seen');
    if (!seen) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem('fg-onboarding-seen', '1');
  };

  return (
    <>
      {/* Re-trigger button (top-right info icon, visible when tutorial is dismissed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-[60px] right-3 z-40 w-8 h-8 rounded-full bg-guardian-surface/80 backdrop-blur-sm border border-white/10 flex items-center justify-center text-guardian-muted hover:text-guardian-text transition-colors"
          title="Show tutorial"
        >
          <Info className="w-4 h-4" />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-guardian-card border border-guardian-border rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#FF6600]/20 to-red-600/10 border-b border-guardian-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6600] to-red-600 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-black fill-black" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white font-mono tracking-wide">
                        GUARDIAN NODE
                      </h2>
                      <p className="text-[11px] text-guardian-muted">
                        Crowd Safety Monitoring System
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="text-guardian-muted hover:text-white transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Who holds this phone */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6600]/15 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Shield className="w-4 h-4 text-[#FF6600]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      This is a Guardian Node
                    </p>
                    <p className="text-xs text-guardian-muted mt-0.5 leading-relaxed">
                      Carried by event staff or volunteers stationed at gates and
                      chokepoints — not a general attendee app. Nodes are placed
                      deliberately, at elevated or fixed positions.
                    </p>
                  </div>
                </div>

                {/* What Vision Engine does */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-guardian-green/15 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Camera className="w-4 h-4 text-guardian-green" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Vision Engine
                    </p>
                    <p className="text-xs text-guardian-muted mt-0.5 leading-relaxed">
                      Continuously analyzes crowd density at this station using
                      on-device inference (TensorFlow.js, WebGL). Tap{' '}
                      <span className="text-guardian-amber font-medium">Auto Demo</span>{' '}
                      to preview Safe → Surge → Critical without a live camera.
                    </p>
                  </div>
                </div>

                {/* Relay */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-guardian-cyan/15 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Radio className="w-4 h-4 text-guardian-cyan" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Relay Network
                    </p>
                    <p className="text-xs text-guardian-muted mt-0.5 leading-relaxed">
                      Alerts hop between Guardian nodes even without cellular signal.
                      Current prototype uses BroadcastChannel (same-device demo);
                      production target is Android Nearby Connections API for
                      true cross-device relay.
                    </p>
                  </div>
                </div>

                {/* SOS & Actions */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-guardian-red/15 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-guardian-red" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      SOS · Theft · Need Help
                    </p>
                    <p className="text-xs text-guardian-muted mt-0.5 leading-relaxed">
                      One-tap manual triggers ride the same relay bus. SOS requires
                      a 0.8s hold to prevent accidental fires.
                    </p>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-guardian-bg/80 rounded-lg p-3 border border-guardian-border/60">
                  <p className="text-[10px] text-guardian-muted/70 leading-relaxed">
                    ⚠️ Counts, peer names, and locations shown are demo data for this
                    walkthrough. This is a working prototype — not a deployed safety
                    system.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 pt-0">
                <button
                  onClick={handleDismiss}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6600] to-red-600 text-white font-bold font-mono tracking-widest text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[#FF6600]/20"
                >
                  GOT IT — START MONITORING
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
