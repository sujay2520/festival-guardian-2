'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Radio,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Users,
  CheckCircle2,
  X,
  Clock,
  Battery,
  BatteryCharging,
  Signal,
  Eye,
  Video,
  Layers,
  Send,
  Megaphone,
  UserCheck,
  Smartphone,
  Check,
  Server,
  Network,
  Cpu,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { Alert, AlertType, Peer, RiskData } from '@/types';
import CctvStreamPlayer from './CctvStreamPlayer';

// ─── Component Props ───────────────────────────────────────────────
export interface OrganizerControlRoomProps {
  alerts: Alert[];
  peers: Peer[];
  onDismissAlert: (id: string) => void;
  onClearAlerts: () => void;
  onDispatchVolunteer?: (alertId: string) => void;
  onBroadcastAdvisory?: (message: string) => void;
  onSwitchToFieldNode: () => void;
}

// ─── Strategic Festival Zone Specification ─────────────────────────
interface FestivalZone {
  id: string;
  name: string;
  location: string;
  riskScore: number;
  density: number; // people per m²
  status: string;
  assignedNode: string;
  attendeeEst: number;
  cameraId: string;
  cameraName: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  description: string;
}

const STRATEGIC_ZONES: FestivalZone[] = [
  {
    id: 'zone-1',
    name: 'Gate 3 Ingress Bottleneck',
    location: 'South Perimeter Turnstiles',
    riskScore: 68,
    density: 4.2,
    status: 'SURGE ADVISORY',
    assignedNode: 'Guardian-Node-Gate3',
    attendeeEst: 1420,
    cameraId: 'CAM-02',
    cameraName: 'Gate 3 Ingress Chokepoint (CAM 02)',
    trend: '+0.8 p/m² (Surging)',
    trendDirection: 'up',
    description: 'Ingress surge causing slow turnstile throughput. Volunteer diversion advised.',
  },
  {
    id: 'zone-2',
    name: 'Main Concert Stage Arena',
    location: 'Central Lawn & Pit Barricade',
    riskScore: 52,
    density: 3.4,
    status: 'ELEVATED',
    assignedNode: 'Guardian-Node-Stage7',
    attendeeEst: 4850,
    cameraId: 'CAM-01',
    cameraName: 'Main Stage Arena Overhead (CAM 01)',
    trend: '+0.2 p/m² (Dense)',
    trendDirection: 'up',
    description: 'High crowd concentration near center speaker arrays. Flow moderately restricted.',
  },
  {
    id: 'zone-3',
    name: 'Gate 1 Main Entrance',
    location: 'North Ingress Plaza',
    riskScore: 22,
    density: 1.8,
    status: 'OPTIMAL',
    assignedNode: 'Guardian-Node-Gate1',
    attendeeEst: 890,
    cameraId: 'CAM-03',
    cameraName: 'East Concourse Entrance (CAM 03)',
    trend: '-0.3 p/m² (Flowing)',
    trendDirection: 'down',
    description: 'Steady attendee flow across 6 active scanners. Adequate corridor clearance.',
  },
  {
    id: 'zone-4',
    name: 'North Food & Water Court',
    location: 'Hydration Station & Vendor Row',
    riskScore: 14,
    density: 0.9,
    status: 'CLEAR',
    assignedNode: 'Guardian-Node-Food4',
    attendeeEst: 620,
    cameraId: 'CAM-03',
    cameraName: 'East Concourse Entrance (CAM 03)',
    trend: 'Nominal Flow',
    trendDirection: 'neutral',
    description: 'Low congestion, water distribution queue moving smoothly under 2 mins.',
  },
  {
    id: 'zone-5',
    name: 'Emergency Medical Corridor',
    location: 'Zone C Rapid Evacuation Lane',
    riskScore: 8,
    density: 0.3,
    status: 'UNOBSTRUCTED',
    assignedNode: 'Medic-Zone-C',
    attendeeEst: 45,
    cameraId: 'CAM-02',
    cameraName: 'Gate 3 Ingress Chokepoint (CAM 02)',
    trend: '100% Unrestricted',
    trendDirection: 'neutral',
    description: 'Critical evacuation artery kept fully clear for emergency response golf carts.',
  },
];

// ─── Fixed Guardian Nodes Telemetry ────────────────────────────────
interface FixedGuardianNode {
  id: string;
  name: string;
  sector: string;
  hardware: string;
  battery: number;
  isCharging: boolean;
  hopDistance: number | 'Direct';
  signalDbm: number;
  relayedPackets: number;
  uptime: string;
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'STANDBY';
}

const FIXED_GUARDIAN_NODES: FixedGuardianNode[] = [
  {
    id: 'node-g3',
    name: 'Guardian-Node-Gate3',
    sector: 'Gate 3 Ingress Bottleneck',
    hardware: 'Mast Unit #01 (Solar + Batt)',
    battery: 94,
    isCharging: true,
    hopDistance: 1,
    signalDbm: -58,
    relayedPackets: 1482,
    uptime: '4h 12m',
    healthStatus: 'HEALTHY',
  },
  {
    id: 'node-stage7',
    name: 'Guardian-Node-Stage7',
    sector: 'Main Concert Stage Arena',
    hardware: 'Truss Mast #07 (High Gain)',
    battery: 88,
    isCharging: false,
    hopDistance: 1,
    signalDbm: -62,
    relayedPackets: 3210,
    uptime: '5h 40m',
    healthStatus: 'HEALTHY',
  },
  {
    id: 'node-gate1',
    name: 'Guardian-Node-Gate1',
    sector: 'Gate 1 Main Entrance',
    hardware: 'Turnstile Gateway Hub',
    battery: 99,
    isCharging: true,
    hopDistance: 'Direct',
    signalDbm: -51,
    relayedPackets: 894,
    uptime: '6h 15m',
    healthStatus: 'HEALTHY',
  },
  {
    id: 'node-food4',
    name: 'Guardian-Node-Food4',
    sector: 'North Food & Water Court',
    hardware: 'Pavilion Pole #04',
    battery: 76,
    isCharging: false,
    hopDistance: 2,
    signalDbm: -68,
    relayedPackets: 642,
    uptime: '3h 25m',
    healthStatus: 'HEALTHY',
  },
  {
    id: 'node-medic-c',
    name: 'Medic-Zone-C',
    sector: 'Emergency Medical Corridor',
    hardware: 'Mobile Command Unit',
    battery: 91,
    isCharging: true,
    hopDistance: 1,
    signalDbm: -54,
    relayedPackets: 518,
    uptime: '5h 50m',
    healthStatus: 'HEALTHY',
  },
  {
    id: 'node-east-rep',
    name: 'Perimeter-Repeater-East',
    sector: 'East Ingress Concourse',
    hardware: 'Outer Perimeter Beacon',
    battery: 84,
    isCharging: false,
    hopDistance: 2,
    signalDbm: -72,
    relayedPackets: 1029,
    uptime: '4h 05m',
    healthStatus: 'HEALTHY',
  },
  {
    id: 'node-south-aux',
    name: 'Turnstile-Relay-South',
    sector: 'South Egress Corridor',
    hardware: 'Egress Mast #02',
    battery: 82,
    isCharging: false,
    hopDistance: 2,
    signalDbm: -66,
    relayedPackets: 775,
    uptime: '3h 50m',
    healthStatus: 'HEALTHY',
  },
  {
    id: 'node-eoc-gw',
    name: 'EOC-Master-Gateway',
    sector: 'HQ Operations Tent',
    hardware: 'Central Control Hub',
    battery: 100,
    isCharging: true,
    hopDistance: 'Direct',
    signalDbm: -40,
    relayedPackets: 9840,
    uptime: '8h 22m',
    healthStatus: 'HEALTHY',
  },
];

// ─── Default Tactical Simulated Alerts ─────────────────────────────
const DEFAULT_TACTICAL_ALERTS: Alert[] = [
  {
    id: 'tac-inc-01',
    type: AlertType.CROWD_RISK,
    lat: 12.9716,
    lng: 77.5946,
    timestamp: Date.now() - 110000,
    message: 'Density surge detected at Gate 3 Turnstiles (4.2 p/m²). Surge advisory in effect.',
    riskScore: 68,
    senderName: 'Guardian-Node-Gate3',
    ttlHops: 3,
  },
  {
    id: 'tac-inc-02',
    type: AlertType.VOLUNTEER_REQUEST,
    lat: 12.9719,
    lng: 77.5949,
    timestamp: Date.now() - 240000,
    message: 'Requesting 3 volunteer marshals to implement Gate 1 ingress diversion line.',
    senderName: 'Guardian-Node-Gate3',
    ttlHops: 4,
  },
  {
    id: 'tac-inc-03',
    type: AlertType.SOS_HELP,
    lat: 12.9735,
    lng: 77.5962,
    timestamp: Date.now() - 410000,
    message: 'Medical support needed: Attendee feeling dizzy near Stage 7 Front Barricade.',
    riskScore: 82,
    senderName: 'Guardian-Node-Stage7',
    ttlHops: 2,
  },
  {
    id: 'tac-inc-04',
    type: AlertType.THEFT,
    lat: 12.9708,
    lng: 77.5938,
    timestamp: Date.now() - 670000,
    message: 'Reported lost credential lanyard and backpack at North Food Court table 4.',
    senderName: 'Guardian-Node-Food4',
    ttlHops: 4,
  },
];

// ─── Helper Functions ──────────────────────────────────────────────
function formatRelativeTime(ts: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.floor(diffMin / 60)}h ago`;
}

function getAlertConfig(type: AlertType) {
  switch (type) {
    case AlertType.CROWD_RISK:
      return {
        label: 'CROWD DENSITY SURGE',
        badge: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        icon: AlertTriangle,
        iconColor: 'text-amber-400',
        border: 'border-amber-500/30',
      };
    case AlertType.SOS_HELP:
      return {
        label: 'SOS EMERGENCY BEACON',
        badge: 'text-red-400 bg-red-500/15 border-red-500/40',
        icon: ShieldAlert,
        iconColor: 'text-red-400',
        border: 'border-red-500/40',
      };
    case AlertType.THEFT:
      return {
        label: 'SECURITY / THEFT REPORT',
        badge: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
        icon: Shield,
        iconColor: 'text-orange-400',
        border: 'border-orange-500/30',
      };
    case AlertType.VOLUNTEER_REQUEST:
      return {
        label: 'VOLUNTEER MARSHAL NEEDED',
        badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        icon: Users,
        iconColor: 'text-cyan-400',
        border: 'border-cyan-500/30',
      };
    case AlertType.VOLUNTEER_RESPONSE:
      return {
        label: 'VOLUNTEER EN ROUTE',
        badge: 'text-green-400 bg-green-500/10 border-green-500/30',
        icon: CheckCircle2,
        iconColor: 'text-green-400',
        border: 'border-green-500/30',
      };
  }
}

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  timestamp: number;
}

export default function OrganizerControlRoom({
  alerts,
  peers,
  onDismissAlert,
  onClearAlerts,
  onDispatchVolunteer,
  onBroadcastAdvisory,
  onSwitchToFieldNode,
}: OrganizerControlRoomProps) {
  // Local active states
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-1');
  const [incidentFilter, setIncidentFilter] = useState<'ALL' | AlertType>('ALL');
  const [dismissedLocalIds, setDismissedLocalIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);
  const [broadcastInput, setBroadcastInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'zones' | 'cctv' | 'queue' | 'mesh'>('overview');

  const cctvSectionRef = useRef<HTMLDivElement | null>(null);

  // Aggregated venue risk telemetry typed with RiskData
  const aggregatedRiskData: RiskData = useMemo(() => ({
    score: 68,
    personCount: 7825,
    density: 2.6,
    flowRate: 1.4,
    level: 'caution',
    timestamp: Date.now(),
  }), []);

  // Trigger Toast Notification
  const addToast = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'danger' = 'info'
  ) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      timestamp: Date.now(),
    };
    setToasts((prev) => [...prev.slice(-3), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4200);
  };

  // Merge provided alerts with tactical defaults if props are sparse
  const effectiveAlerts = useMemo(() => {
    const combined = [...alerts];
    DEFAULT_TACTICAL_ALERTS.forEach((def) => {
      if (!combined.some((a) => a.id === def.id)) {
        combined.push(def);
      }
    });
    return combined.filter((a) => !dismissedLocalIds.has(a.id));
  }, [alerts, dismissedLocalIds]);

  const filteredAlerts = useMemo(() => {
    if (incidentFilter === 'ALL') return effectiveAlerts;
    return effectiveAlerts.filter((a) => a.type === incidentFilter);
  }, [effectiveAlerts, incidentFilter]);

  // Handlers for Dispatch Actions
  const handleDispatch = (alert: Alert) => {
    if (onDispatchVolunteer) {
      onDispatchVolunteer(alert.id);
    }
    const targetSector = alert.senderName || 'Incident Location';
    addToast(
      'MARSHAL DISPATCHED',
      `Volunteer task force assigned to ${targetSector} via local mesh channel.`,
      'success'
    );
  };

  const handleBroadcastAlert = (alert: Alert) => {
    const defaultMsg = `ADVISORY: Caution near ${alert.senderName || 'Venue Zone'}. Please follow marshal directions.`;
    if (onBroadcastAdvisory) {
      onBroadcastAdvisory(defaultMsg);
    }
    addToast(
      'ADVISORY BROADCASTED',
      `Push message transmitted to all ${8 + peers.length} active mesh nodes.`,
      'info'
    );
  };

  const handleResolveAlert = (alertId: string) => {
    setDismissedLocalIds((prev) => {
      const next = new Set(prev);
      next.add(alertId);
      return next;
    });
    onDismissAlert(alertId);
    addToast(
      'INCIDENT RESOLVED',
      `Incident #${alertId.slice(-6)} closed and archived in operations audit log.`,
      'warning'
    );
  };

  const handleSendCustomBroadcast = () => {
    if (!broadcastInput.trim()) return;
    if (onBroadcastAdvisory) {
      onBroadcastAdvisory(broadcastInput.trim());
    }
    addToast(
      'VENUE ADVISORY BROADCASTED',
      `"${broadcastInput.trim()}" dispatched across entire mesh topology.`,
      'success'
    );
    setBroadcastInput('');
    setIsBroadcastModalOpen(false);
  };

  const handleSelectZoneFeed = (zone: FestivalZone) => {
    setSelectedZoneId(zone.id);
    addToast(
      'SWITCHING LIVE CCTV FEED',
      `Viewing ${zone.cameraName} for ${zone.name}`,
      'info'
    );
    if (cctvSectionRef.current) {
      cctvSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-[#060609] text-guardian-text selection:bg-guardian-accent selection:text-white font-sans pb-24">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. EXECUTIVE TACTICAL HEADER / TOP NAVIGATION               */}
      {/* ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#060609]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand & Mode Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6600] to-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(255,102,0,0.35)] shrink-0">
              <Shield className="w-6 h-6 text-black fill-black" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-base sm:text-lg font-bold tracking-widest text-white uppercase flex items-center gap-2">
                  ORGANIZER COMMAND CENTER
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-[#FF6600]/40 text-[#FF6600] bg-[#FF6600]/10 tracking-widest font-mono">
                  EOC LEVEL 1
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  OFF-GRID MESH LIVE
                </span>
              </div>
              <p className="text-[11px] font-mono text-guardian-muted tracking-wide flex items-center gap-2 mt-0.5">
                <span>FESTIVAL GUARDIAN TACTICAL SYSTEM</span>
                <span>•</span>
                <span className="text-cyan-400">8 FIXED MASTS</span>
                <span>•</span>
                <span>{peers.length} MOBILE PEERS</span>
                <span>•</span>
                <span className="text-amber-400">ZERO CLOUD RETENTION</span>
              </p>
            </div>
          </div>

          {/* Action Center Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
            {/* Quick Broadcast Advisory Button */}
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-xs font-semibold tracking-wider transition-colors flex items-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
            >
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>BROADCAST ADVISORY</span>
            </button>

            {/* Switch to Field Node Mode Button */}
            <button
              onClick={onSwitchToFieldNode}
              className="px-4 py-1.5 rounded-lg border border-[#FF6600]/50 bg-gradient-to-r from-[#FF6600] to-orange-600 hover:from-orange-500 hover:to-[#FF6600] text-black font-mono text-xs font-bold tracking-wider transition-all shadow-[0_0_18px_rgba(255,102,0,0.35)] flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-black" />
              <span>SWITCH TO FIELD NODE</span>
              <ChevronRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>

        {/* Tactical Sub-Bar Navigation Pills */}
        <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-mono overflow-x-auto gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-guardian-muted uppercase tracking-wider mr-1">VIEWPORT:</span>
            {[
              { id: 'overview', label: 'EXECUTIVE OVERVIEW' },
              { id: 'zones', label: '5-ZONE GRID' },
              { id: 'cctv', label: 'RTSP CCTV PIPELINE' },
              { id: 'queue', label: `DISPATCH QUEUE (${effectiveAlerts.length})` },
              { id: 'mesh', label: 'MESH TOPOLOGY' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  if (tab.id === 'cctv' && cctvSectionRef.current) {
                    cctvSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold tracking-wider transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-guardian-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3 text-[11px] text-guardian-muted">
            <span className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5 text-emerald-400" />
              <span>GATEWAY: WEBRTC 38ms</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI INFERENCE: TF.js WebGL</span>
            </span>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MAIN CONTAINER                                               */}
      {/* ──────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* ────────────────────────────────────────────────────────── */}
        {/* SECTION 1: STATS BAR / EXECUTIVE KPI TILES                 */}
        {/* ────────────────────────────────────────────────────────── */}
        <section aria-label="Executive KPI Overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1: Aggregated Venue Density */}
            <div className="bg-[#0D1117] border border-white/10 rounded-xl p-4 relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-lg">
              <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between text-xs font-mono text-guardian-muted mb-2">
                <span className="uppercase tracking-wider">AGGREGATED VENUE DENSITY</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {aggregatedRiskData.level.toUpperCase()}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-white tracking-tight">
                  {aggregatedRiskData.density}
                </span>
                <span className="text-sm font-mono text-guardian-muted">p/m²</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-guardian-muted">
                <span className="flex items-center gap-1 text-amber-400">
                  <TrendingUp className="w-3.5 h-3.5" /> +0.4 p/m² / 15m
                </span>
                <span>NFPA Limit: 4.0 p/m²</span>
              </div>
              {/* Progress meter bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 w-[65%]" />
              </div>
            </div>

            {/* Tile 2: Active Fixed Nodes */}
            <div className="bg-[#0D1117] border border-white/10 rounded-xl p-4 relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-lg">
              <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/5 blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between text-xs font-mono text-guardian-muted mb-2">
                <span className="uppercase tracking-wider">ACTIVE FIXED NODES</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  100% HEALTH
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-cyan-400 tracking-tight">8</span>
                <span className="text-sm font-mono text-guardian-muted">Stationed</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-guardian-muted">
                <span className="text-emerald-400 font-semibold">
                  +{peers.length} Mobile Field Units
                </span>
                <span>Mesh Latency: ~12ms</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-cyan-400 w-full" />
              </div>
            </div>

            {/* Tile 3: Active Incidents Count */}
            <div className="bg-[#0D1117] border border-white/10 rounded-xl p-4 relative overflow-hidden group hover:border-red-500/40 transition-all shadow-lg">
              <div className="absolute top-0 right-0 w-28 h-28 bg-red-500/5 blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between text-xs font-mono text-guardian-muted mb-2">
                <span className="uppercase tracking-wider">ACTIVE INCIDENTS</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                    effectiveAlerts.length > 0
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {effectiveAlerts.length > 0 ? 'DISPATCH QUEUED' : 'NOMINAL'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-bold font-mono tracking-tight ${
                    effectiveAlerts.length > 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {effectiveAlerts.length}
                </span>
                <span className="text-sm font-mono text-guardian-muted">Active in Queue</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-guardian-muted">
                <span>1 Surge • 1 SOS • 1 Assist</span>
                <button
                  onClick={() => {
                    const el = document.getElementById('incident-queue-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-cyan-400 hover:underline"
                >
                  View Queue →
                </button>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${Math.min(100, effectiveAlerts.length * 25)}%` }}
                />
              </div>
            </div>

            {/* Tile 4: High Risk Bottlenecks */}
            <div className="bg-[#0D1117] border border-white/10 rounded-xl p-4 relative overflow-hidden group hover:border-orange-500/40 transition-all shadow-lg">
              <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/5 blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between text-xs font-mono text-guardian-muted mb-2">
                <span className="uppercase tracking-wider">PRIMARY BOTTLENECK</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                  SURGE ADVISORY
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold font-mono text-white truncate tracking-tight">
                  Gate 3 Ingress
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-guardian-muted">
                <span className="text-red-400 font-semibold">Risk 68/100 (4.2 p/m²)</span>
                <button
                  onClick={() => handleSelectZoneFeed(STRATEGIC_ZONES[0])}
                  className="text-guardian-accent hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> Ingest Feed
                </button>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-[68%]" />
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/* SECTION 2: MULTI-ZONE VENUE STATUS GRID (5 ZONES)          */}
        {/* ────────────────────────────────────────────────────────── */}
        <section aria-label="Multi-Zone Venue Status Grid" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
                  <Layers className="w-5 h-5 text-guardian-cyan" />
                  MULTI-ZONE VENUE STATUS GRID
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  5 STRATEGIC SECTORS
                </span>
              </div>
              <p className="text-xs text-guardian-muted font-mono mt-0.5">
                Real-time spatial density telemetry computed by assigned Guardian fixed mast cameras and field nodes.
              </p>
            </div>

            <div className="text-xs font-mono text-guardian-muted flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Surge Advisory
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Elevated
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Optimal / Clear
              </span>
            </div>
          </div>

          {/* 5 Zone Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {STRATEGIC_ZONES.map((zone) => {
              const isSelected = selectedZoneId === zone.id;
              // Risk color mapping
              let badgeClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
              let barClasses = 'bg-emerald-400';
              if (zone.riskScore >= 65) {
                badgeClasses = 'bg-red-500/15 text-red-400 border-red-500/40 animate-pulse';
                barClasses = 'bg-gradient-to-r from-orange-500 to-red-500';
              } else if (zone.riskScore >= 45) {
                badgeClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                barClasses = 'bg-gradient-to-r from-cyan-400 to-amber-500';
              } else if (zone.riskScore >= 20) {
                badgeClasses = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
                barClasses = 'bg-gradient-to-r from-emerald-400 to-cyan-400';
              }

              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`relative bg-[#0D1117] border rounded-xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-md ${
                    isSelected
                      ? 'border-guardian-accent ring-1 ring-guardian-accent/50 bg-[#121820]'
                      : 'border-white/10 hover:border-white/25 hover:bg-[#10141c]'
                  }`}
                >
                  {/* Top Bar: Zone Name & Status Badge */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-guardian-muted uppercase tracking-wider block">
                          {zone.location}
                        </span>
                        <h3 className="text-sm font-bold font-mono text-white tracking-wide truncate group-hover:text-guardian-accent transition-colors">
                          {zone.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${badgeClasses}`}
                      >
                        {zone.status}
                      </span>
                      <span className="text-xs font-mono text-guardian-muted">
                        {zone.attendeeEst.toLocaleString()} est.
                      </span>
                    </div>

                    {/* Risk Score Progress Bar */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-guardian-muted text-[11px]">RISK SCORE</span>
                        <span className="font-bold text-white text-xs">{zone.riskScore}/100</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${barClasses}`}
                          style={{ width: `${zone.riskScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="bg-[#060609]/60 border border-white/5 rounded-lg p-2.5 mb-3 text-[11px] font-mono space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-guardian-muted">DENSITY:</span>
                        <span className="font-bold text-white">{zone.density} p/m²</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-guardian-muted">FLOW TREND:</span>
                        <span
                          className={`font-semibold flex items-center gap-1 ${
                            zone.trendDirection === 'up'
                              ? 'text-red-400'
                              : zone.trendDirection === 'down'
                              ? 'text-emerald-400'
                              : 'text-guardian-muted'
                          }`}
                        >
                          {zone.trendDirection === 'up' && <TrendingUp className="w-3 h-3" />}
                          {zone.trendDirection === 'down' && <TrendingDown className="w-3 h-3" />}
                          {zone.trend}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-guardian-muted">ASSIGNED:</span>
                        <span className="text-cyan-400 truncate max-w-[130px]" title={zone.assignedNode}>
                          {zone.assignedNode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 'VIEW FEED' Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectZoneFeed(zone);
                    }}
                    className="w-full py-2 px-3 rounded-lg font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 border bg-white/5 text-guardian-text border-white/10 hover:bg-guardian-accent hover:text-white hover:border-guardian-accent"
                  >
                    <Video className="w-3.5 h-3.5 text-guardian-accent group-hover:text-white" />
                    <span>VIEW FEED ({zone.cameraId})</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/* SECTION 3: LIVE CCTV / RTSP INTEGRATION SECTION            */}
        {/* ────────────────────────────────────────────────────────── */}
        <section
          ref={cctvSectionRef}
          id="cctv-surveillance-section"
          aria-label="Live CCTV RTSP Surveillance Ingestion"
          className="space-y-3 pt-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
                  <Video className="w-5 h-5 text-guardian-accent" />
                  LIVE CCTV / RTSP STREAM INGESTION (EDGE WEBRTC)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF6600]/10 text-guardian-accent border border-[#FF6600]/30">
                  CAMERA SWITCHER ACTIVE
                </span>
              </div>
              <p className="text-xs text-guardian-muted font-mono mt-0.5">
                Active RTSP stream decoding directly on local workstation via WebRTC bridge. 0-hop privacy preserved.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-guardian-muted">ACTIVE ZONE FOCUS:</span>
              <span className="text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                {STRATEGIC_ZONES.find((z) => z.id === selectedZoneId)?.name || 'Gate 3 Ingress'}
              </span>
            </div>
          </div>

          {/* Embedded CctvStreamPlayer with camera switching capabilities */}
          <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-3 sm:p-5 shadow-2xl">
            <CctvStreamPlayer />
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/* SECTION 4: ACTIVE INCIDENT DISPATCH QUEUE                  */}
        {/* ────────────────────────────────────────────────────────── */}
        <section
          id="incident-queue-section"
          aria-label="Active Incident Dispatch Queue"
          className="space-y-4 pt-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  ACTIVE INCIDENT DISPATCH QUEUE
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                  {effectiveAlerts.length} PENDING ACTION
                </span>
              </div>
              <p className="text-xs text-guardian-muted font-mono mt-0.5">
                Aggregated P2P mesh alert feed with hop distance, TTL remaining, and volunteer dispatch triggers.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 bg-[#161B22] p-1 rounded-lg border border-white/10 text-xs font-mono">
                {(
                  [
                    { id: 'ALL', label: 'ALL' },
                    { id: AlertType.CROWD_RISK, label: 'SURGES' },
                    { id: AlertType.SOS_HELP, label: 'SOS' },
                    { id: AlertType.VOLUNTEER_REQUEST, label: 'VOLUNTEER' },
                    { id: AlertType.THEFT, label: 'THEFT' },
                  ] as const
                ).map((filt) => (
                  <button
                    key={filt.id}
                    onClick={() => setIncidentFilter(filt.id)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                      incidentFilter === filt.id
                        ? 'bg-guardian-accent text-white'
                        : 'text-guardian-muted hover:text-white'
                    }`}
                  >
                    {filt.label}
                  </button>
                ))}
              </div>

              {/* Clear All Alerts Button */}
              {effectiveAlerts.length > 0 && (
                <button
                  onClick={() => {
                    const allIds = effectiveAlerts.map((a) => a.id);
                    setDismissedLocalIds((prev) => {
                      const next = new Set(prev);
                      allIds.forEach((id) => next.add(id));
                      return next;
                    });
                    onClearAlerts();
                    addToast('DISPATCH QUEUE CLEARED', 'All active queue alerts resolved.', 'warning');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-guardian-muted hover:text-white text-xs font-mono transition-colors"
                >
                  CLEAR QUEUE
                </button>
              )}
            </div>
          </div>

          {/* Incidents List */}
          {filteredAlerts.length === 0 ? (
            <div className="bg-[#0D1117] border border-white/10 rounded-xl p-8 text-center space-y-2 font-mono">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white tracking-wider uppercase">
                ALL SECTORS NOMINAL
              </h4>
              <p className="text-xs text-guardian-muted max-w-md mx-auto">
                No active incidents matching the selected filter. Off-grid relay network continuously monitoring.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredAlerts.map((alert) => {
                  const cfg = getAlertConfig(alert.type);
                  const Icon = cfg.icon;
                  const ttl = alert.ttlHops != null ? alert.ttlHops : 3;
                  const hopsRelayed = Math.max(1, 5 - ttl);

                  return (
                    <motion.div
                      key={alert.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`bg-[#0D1117] border ${cfg.border} rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group`}
                    >
                      {/* Top Header */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg bg-black/40 ${cfg.iconColor} border border-white/10`}>
                              <Icon className="w-4 h-4" />
                            </span>
                            <div>
                              <span
                                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${cfg.badge}`}
                              >
                                {cfg.label}
                              </span>
                              {alert.riskScore && (
                                <span className="ml-2 text-xs font-mono font-bold text-red-400">
                                  RISK {alert.riskScore}/100
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] font-mono text-guardian-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(alert.timestamp)}
                          </span>
                        </div>

                        {/* Incident Message */}
                        <p className="text-xs sm:text-sm font-sans text-guardian-text leading-relaxed mb-3">
                          {alert.message || 'Automated safety threshold exceeded by field sensor.'}
                        </p>

                        {/* Telemetry metadata tags */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#060609]/70 border border-white/5 rounded-lg p-2.5 mb-4 text-[11px] font-mono">
                          <div>
                            <span className="text-guardian-muted text-[10px] block">ORIGIN SENDER</span>
                            <span className="text-white font-semibold truncate block">
                              {alert.senderName || 'Guardian-Node-Field'}
                            </span>
                          </div>

                          <div>
                            <span className="text-guardian-muted text-[10px] block">RELAY DISTANCE</span>
                            <span className="text-cyan-400 font-semibold block">
                              {hopsRelayed} Hop{hopsRelayed > 1 ? 's' : ''} (TTL: {ttl})
                            </span>
                          </div>

                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-guardian-muted text-[10px] block">COORDINATES</span>
                            <span className="text-guardian-muted truncate block">
                              {alert.lat ? `${alert.lat.toFixed(4)}, ${alert.lng.toFixed(4)}` : 'Zone Perimeter'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: DISPATCH, BROADCAST, RESOLVE */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5 flex-wrap">
                        {/* 1. DISPATCH VOLUNTEER */}
                        <button
                          onClick={() => handleDispatch(alert)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold tracking-wider transition-colors flex items-center justify-center gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>DISPATCH VOLUNTEER</span>
                        </button>

                        {/* 2. BROADCAST ADVISORY */}
                        <button
                          onClick={() => handleBroadcastAlert(alert)}
                          className="py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold tracking-wider transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Megaphone className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">BROADCAST</span> ADVISORY
                        </button>

                        {/* 3. RESOLVE */}
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-guardian-muted hover:text-emerald-400 border border-white/10 hover:border-emerald-500/40 text-xs font-mono font-bold tracking-wider transition-colors flex items-center justify-center gap-1.5"
                          title="Mark resolved and remove from queue"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>RESOLVE</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/* SECTION 5: MESH NETWORK TOPOLOGY & NODE TELEMETRY          */}
        {/* ────────────────────────────────────────────────────────── */}
        <section
          id="mesh-topology-section"
          aria-label="Mesh Network Topology and Telemetry"
          className="space-y-4 pt-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
                  <Network className="w-5 h-5 text-emerald-400" />
                  MESH NETWORK TOPOLOGY & NODE TELEMETRY
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  8 STATIONED • ZERO CELLULAR DEPENDENCY
                </span>
              </div>
              <p className="text-xs text-guardian-muted font-mono mt-0.5">
                Simulated battery reserves, RF signal levels, packet relay volume, and sector assignments across festival grounds.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-guardian-muted">
              <span>Relay Channel: festival-guardian-relay</span>
              <span>•</span>
              <span className="text-cyan-400">{peers.length} Roaming Field Peers</span>
            </div>
          </div>

          {/* Node Telemetry Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {FIXED_GUARDIAN_NODES.map((node) => {
              // Battery color
              let batteryColor = 'text-emerald-400';
              if (node.battery < 50) batteryColor = 'text-amber-400';
              if (node.battery < 25) batteryColor = 'text-red-400';

              return (
                <div
                  key={node.id}
                  className="bg-[#0D1117] border border-white/10 rounded-xl p-3.5 font-mono text-xs hover:border-emerald-500/40 transition-colors shadow-md flex flex-col justify-between"
                >
                  {/* Node Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <span className="text-[10px] text-guardian-muted uppercase tracking-wider block truncate">
                          {node.sector}
                        </span>
                        <h4 className="text-sm font-bold text-white tracking-wide truncate">
                          {node.name}
                        </h4>
                      </div>

                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                        {node.healthStatus}
                      </span>
                    </div>

                    <p className="text-[10px] text-guardian-muted mb-3 truncate">
                      {node.hardware}
                    </p>

                    {/* Stats List */}
                    <div className="space-y-1.5 bg-[#060609]/60 border border-white/5 rounded-lg p-2.5 mb-3 text-[11px]">
                      {/* Battery */}
                      <div className="flex items-center justify-between">
                        <span className="text-guardian-muted flex items-center gap-1.5">
                          {node.isCharging ? (
                            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Battery className={`w-3.5 h-3.5 ${batteryColor}`} />
                          )}
                          BATTERY:
                        </span>
                        <span className={`font-bold ${batteryColor}`}>
                          {node.battery}% {node.isCharging ? '(Mains/Solar)' : '(Batt)'}
                        </span>
                      </div>

                      {/* Hop Distance */}
                      <div className="flex items-center justify-between">
                        <span className="text-guardian-muted flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-cyan-400" />
                          HOP DISTANCE:
                        </span>
                        <span className="font-semibold text-cyan-400">
                          {typeof node.hopDistance === 'number'
                            ? `${node.hopDistance} Hop${node.hopDistance > 1 ? 's' : ''}`
                            : node.hopDistance}
                        </span>
                      </div>

                      {/* RF Signal */}
                      <div className="flex items-center justify-between">
                        <span className="text-guardian-muted flex items-center gap-1.5">
                          <Signal className="w-3.5 h-3.5 text-guardian-muted" />
                          RF SIGNAL:
                        </span>
                        <span className="text-white font-mono">
                          {node.signalDbm} dBm
                        </span>
                      </div>

                      {/* Packets */}
                      <div className="flex items-center justify-between">
                        <span className="text-guardian-muted flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-guardian-muted" />
                          RELAYED:
                        </span>
                        <span className="text-white font-mono">
                          {node.relayedPackets.toLocaleString()} pkts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Node Footer */}
                  <div className="flex items-center justify-between text-[10px] text-guardian-muted pt-2 border-t border-white/5">
                    <span>UPTIME: {node.uptime}</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> PING 8ms
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connected Roaming Mobile Peers Section */}
          <div className="bg-[#0D1117] border border-white/10 rounded-xl p-4 font-mono">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white tracking-wider uppercase">
                  ROAMING VOLUNTEER & FIELD PEERS ({peers.length})
                </h4>
              </div>
              <span className="text-[10px] text-guardian-muted">
                AUTOMATIC DISCOVERY OVER LOCAL BROADCAST
              </span>
            </div>

            {peers.length === 0 ? (
              <div className="text-xs text-guardian-muted py-2 text-center bg-[#060609]/40 rounded-lg border border-white/5">
                No active mobile volunteer handsets connected to this station. Fixed guardian masts providing full backbone relay.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {peers.map((peer) => (
                  <div
                    key={peer.id}
                    className="bg-[#161B22]/70 border border-white/5 rounded-lg p-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-white truncate block">
                        {peer.name}
                      </span>
                      <span className="text-[10px] text-guardian-muted">
                        {peer.isVolunteer ? 'Volunteer Marshal' : 'Field Scout'}
                      </span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* BROADCAST ADVISORY MODAL                                     */}
      {/* ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isBroadcastModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0D1117] border border-white/15 rounded-2xl p-5 shadow-2xl space-y-4 font-mono text-guardian-text"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <Megaphone className="w-5 h-5" />
                  <h3 className="text-sm font-bold tracking-wider uppercase text-white">
                    VENUE-WIDE BROADCAST TRANSMITTER
                  </h3>
                </div>
                <button
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="text-guardian-muted hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-guardian-muted">
                Transmits high-priority emergency advisory to all field units and attendees over off-grid P2P mesh relay.
              </p>

              {/* Preset Quick Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase text-guardian-muted tracking-wider block">
                  TACTICAL PRESETS:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {[
                    'GATE 3 SURGE: Divert to Gate 1 (Clear flow)',
                    'MEDICAL CORRIDOR: Keep Zone C clear for medics',
                    'HYDRATION ALERT: Free water stations at Food 4',
                    'STAGE FRONT: Step back 2 paces to relieve pressure',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBroadcastInput(preset)}
                      className="p-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-left text-guardian-text text-[11px] truncate"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-guardian-muted tracking-wider block">
                  ADVISORY MESSAGE PAYLOAD:
                </label>
                <textarea
                  rows={3}
                  value={broadcastInput}
                  onChange={(e) => setBroadcastInput(e.target.value)}
                  placeholder="Enter high priority advisory message for mesh push..."
                  className="w-full bg-[#060609] border border-white/15 rounded-lg p-3 text-xs text-white placeholder-guardian-muted focus:outline-none focus:border-guardian-accent font-sans"
                />
              </div>

              {/* Transmission Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-guardian-muted transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSendCustomBroadcast}
                  disabled={!broadcastInput.trim()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-black font-bold text-xs tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>TRANSMIT ACROSS MESH</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* FLOATING ACTION TOASTS FEEDBACK                              */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let toastBg = 'bg-[#0D1117] border-cyan-500/40 text-cyan-400';
            if (toast.type === 'success') toastBg = 'bg-[#0D1117] border-emerald-500/40 text-emerald-400';
            if (toast.type === 'warning') toastBg = 'bg-[#0D1117] border-amber-500/40 text-amber-400';
            if (toast.type === 'danger') toastBg = 'bg-[#0D1117] border-red-500/40 text-red-400';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                className={`p-3 rounded-xl border ${toastBg} shadow-2xl backdrop-blur-md pointer-events-auto font-mono flex items-start gap-2.5`}
              >
                <div className="mt-0.5">
                  <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider">{toast.title}</div>
                  <div className="text-[11px] text-zinc-300 font-sans mt-0.5 leading-snug">
                    {toast.message}
                  </div>
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-zinc-500 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
