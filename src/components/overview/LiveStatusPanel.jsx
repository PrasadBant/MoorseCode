import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import SignalWaveform from '@/components/three/SignalWaveform';

const STATE_COLOR = { active: '#00E5FF', danger: '#FF3B5C', dim: '#3A4358' };

// Deterministic "looks random" jitter derived from an integer seed — keeps
// render pure (same tick always produces the same output) while still
// visibly varying every tick, unlike calling Math.random() during render.
const pseudoJitter = (seed, mod) => Math.abs((seed * 2654435761) % 2147483648) % mod;

const StatusRow = ({ label, value, state, delay, subtext }) => {
  const color = STATE_COLOR[state];
  return (
    <motion.div
      className="flex justify-between items-center py-3 border-b border-steel-800/60 last:border-0"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-center gap-3">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color, boxShadow: state !== 'dim' ? `0 0 6px ${color}` : 'none' }} />
        <span className="text-steel-400 tracking-[0.1em] text-[11px] uppercase font-semibold">{label}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="font-bold tracking-wide text-[13px] uppercase" style={{ color }}>
          {value}
        </span>
        {subtext && <span className="text-[10px] text-steel-600 tracking-wide font-mono">{subtext}</span>}
      </div>
    </motion.div>
  );
};

const LiveStatusPanel = ({ data }) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2500);
    return () => clearInterval(id);
  }, []);

  const isSystemActive = data.status === 'ACTIVE';
  const isEspConnected = data.esp_status === 'CONNECTED';
  const isPiOnline     = data.status !== 'OFFLINE' && data.status !== 'API_DOWN';
  const isSOS          = data.message === 'SOS';
  const timeStr        = data.time || '--:--:--.---';

  // Recomputed only on the panel's own 2.5s tick — not on every parent
  // re-render — so the jitter reads as one deliberate cadence.
  const { signal, latency } = useMemo(() => ({
    signal:  isEspConnected ? `-${42 + (tick % 7) + pseudoJitter(tick, 3)} dBm` : '-- dBm',
    latency: isPiOnline     ? `${14 + (tick % 5) + pseudoJitter(tick + 1, 2)} ms`   : '-- ms',
  }), [tick, isEspConnected, isPiOnline]);

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{
        background: 'linear-gradient(160deg, rgba(0,229,255,0.03) 0%, rgba(10,14,22,0.97) 100%)',
        border: `1px solid ${isSOS ? 'rgba(255,59,92,0.28)' : 'rgba(169,183,204,0.1)'}`,
        boxShadow: `0 4px 28px rgba(0,0,0,0.6)${isSOS ? ', 0 0 24px rgba(255,59,92,0.1)' : ''}`,
      }}
    >
      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.35), transparent)' }} />

      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-5 pb-3 border-b border-steel-800/60">
        <div>
          <h3 className="text-steel-50 font-bold tracking-wide text-[13px]">
            System Diagnostics
          </h3>
          <span className="text-[10px] text-steel-600 tracking-wide font-mono">NODE_ID: 0xFA21</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] tracking-[0.1em] font-mono">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-40" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neon-cyan" style={{ boxShadow: '0 0 5px #00E5FF' }} />
          </span>
          <span className="text-neon-cyan/60 font-semibold">LIVE</span>
        </div>
      </div>

      {/* 3D Signal Waveform */}
      <div className="px-5 pt-3 pb-1">
        <div className="flex items-center justify-between text-[9px] tracking-[0.1em] font-mono mb-1">
          <span className="text-steel-600 font-semibold uppercase">RF Signal Waveform</span>
          <span className={isSOS ? 'text-danger-red font-semibold' : 'text-steel-400'}>{signal}</span>
        </div>
        <SignalWaveform isConnected={isEspConnected} isSOS={isSOS} />
      </div>

      {/* Status Rows */}
      <div className="px-5 pb-4">
        <StatusRow label="Core Status"  value={isSystemActive ? 'Active'            : 'Offline'}       state={isSystemActive ? 'active' : 'danger'} delay={0.06} subtext="Main thread" />
        <StatusRow label="ESP8266 Node" value={isEspConnected ? 'Link Established'  : 'Disconnected'}  state={isEspConnected ? 'active' : 'danger'} delay={0.12} subtext={`Signal: ${signal}`} />
        <StatusRow label="Raspberry Pi" value={isPiOnline     ? 'Online'            : 'Offline'}       state={isPiOnline     ? 'active' : 'danger'} delay={0.18} subtext={`Latency: ${latency}`} />
        <StatusRow label="Mesh Network" value={isEspConnected ? 'ESP-NOW Active'    : 'Inactive'}      state={isEspConnected ? 'active' : 'dim'}    delay={0.24} subtext="Sec: AES-256-GCM" />
        <StatusRow label="Last Sync"    value={timeStr}                                                 state="active"                               delay={0.3}  subtext="UTC offset +5:30" />
      </div>
    </div>
  );
};

export default React.memo(LiveStatusPanel);
