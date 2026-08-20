import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * TacticalMap.jsx
 * Plots the coordinate history produced by the terminal's `locate` command
 * on a small SVG scope — same ring/crosshair language as the login
 * screen's RadarSweep, so a triangulated fix actually pays off visually
 * instead of just scrolling past in the log feed.
 */

const SEVERITY_COLOR = {
  SOS: '#FF2D55',
  HELP: '#F59E0B',
  'SURVIVOR DETECTED': '#F97316',
  OK: '#00E5FF',
};

const colorFor = (severity) => SEVERITY_COLOR[severity] || SEVERITY_COLOR.OK;

const TacticalMap = ({ pins }) => {
  const hasPins = pins.length > 0;

  return (
    <div className="glass-panel p-6 w-full relative overflow-hidden">
      {/* Corner brackets — same accent treatment as the Alert Protocol panel */}
      {[['top-0 left-0', 'border-t-2 border-l-2'], ['top-0 right-0', 'border-t-2 border-r-2'],
        ['bottom-0 left-0', 'border-b-2 border-l-2'], ['bottom-0 right-0', 'border-b-2 border-r-2']].map(([pos, brd], i) => (
        <div key={i} className={`absolute ${pos} w-5 h-5 ${brd} m-3 opacity-40 pointer-events-none`} style={{ borderColor: 'rgba(0,229,255,0.5)' }} />
      ))}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 border-b border-steel-800/60 pb-4">
        <div>
          <h3 className="text-steel-50 text-[15px] font-bold tracking-wide flex items-center">
            <span className="relative flex h-2 w-2 mr-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-cyan" style={{ boxShadow: '0 0 6px #00E5FF' }} />
            </span>
            Tactical Map
          </h3>
          <p className="text-[10px] text-steel-600 tracking-wide mt-1 font-medium uppercase">
            Triangulated fixes from the <span className="text-steel-400">locate</span> command
          </p>
        </div>
        <span className="text-[9px] px-2 py-1 rounded font-mono font-bold tracking-wider text-steel-400 border border-steel-800 bg-black/30 uppercase self-start sm:self-auto">
          {pins.length} FIX{pins.length === 1 ? '' : 'ES'} LOGGED
        </span>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-6 items-start">
        {/* ── Scope ── */}
        <div className="relative w-full aspect-square max-w-[220px] mx-auto md:mx-0">
          <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
            {[38, 68, 98].map(r => (
              <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="rgba(0,229,255,0.14)" strokeWidth="1" />
            ))}
            <line x1="100" y1="2" x2="100" y2="198" stroke="rgba(0,229,255,0.09)" strokeWidth="1" />
            <line x1="2" y1="100" x2="198" y2="100" stroke="rgba(0,229,255,0.09)" strokeWidth="1" />
            <circle cx="100" cy="100" r="2" fill="rgba(169,183,204,0.4)" />

            <AnimatePresence>
              {pins.map((pin, i) => {
                const isLatest = i === pins.length - 1;
                const color = colorFor(pin.severity);
                return (
                  <motion.g key={pin.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                    {isLatest && (
                      <motion.circle
                        cx={pin.x} cy={pin.y} fill="none" stroke={color} strokeWidth="1"
                        initial={{ r: 4, opacity: 0.6 }}
                        animate={{ r: [4, 16], opacity: [0.6, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                      />
                    )}
                    <circle
                      cx={pin.x} cy={pin.y} r={isLatest ? 3.5 : 2.5}
                      fill={color}
                      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                    />
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </svg>

          {!hasPins && (
            <div className="absolute inset-0 flex items-center justify-center text-center px-4">
              <span className="text-[9px] tracking-[0.1em] text-steel-600 uppercase font-mono">No fixes yet<br />run "locate" in the terminal</span>
            </div>
          )}
        </div>

        {/* ── Fix log ── */}
        <div className="w-full">
          {hasPins ? (
            <div className="space-y-1 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
              {pins.slice().reverse().map((pin, i) => {
                const color = colorFor(pin.severity);
                return (
                  <motion.div
                    key={pin.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-1.5 text-[10px] font-mono"
                    style={{ borderBottom: '1px solid rgba(169,183,204,0.06)' }}
                  >
                    <span className="flex items-center gap-1.5 font-semibold tracking-wide" style={{ color }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                      SECTOR {pin.sector}
                      {i === 0 && <span className="ml-1 text-[8px] px-1 py-0.5 rounded bg-black/40 text-steel-400 tracking-wider">LATEST</span>}
                    </span>
                    <span className="text-steel-400 tracking-wide">{pin.lat} / {pin.lng}</span>
                    <span className="text-steel-600 shrink-0">{pin.time}</span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-steel-600 tracking-wide leading-relaxed">
              Each <span className="text-steel-400 font-mono">locate</span> call triangulates a new bio-signature
              fix and plots it here — SOS fixes read red, HELP amber, survivor detections orange.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(TacticalMap);
