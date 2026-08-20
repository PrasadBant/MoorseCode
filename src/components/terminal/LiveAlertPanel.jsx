import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Alert level definitions ──
const LEVELS = {
  SOS: {
    key: 'sos',
    title: 'EMERGENCY PROTOCOL',
    text: 'SOS_DETECTED',
    desc: 'Emergency distress signal received via Morse decoder',
    color: '#FF2D55',
    icon: '⚠',
    glitch: true,
    level: 'L-04',
    severity: 'CRITICAL',
  },
  HELP: {
    key: 'help',
    title: 'WARNING SIGNAL',
    text: 'HELP_REQUESTED',
    desc: 'Assistance request captured on active frequency',
    color: '#F59E0B',
    icon: '◈',
    glitch: false,
    level: 'L-02',
    severity: 'WARNING',
  },
  'SURVIVOR DETECTED': {
    key: 'survivor',
    title: 'TARGET ACQUIRED',
    text: 'SURVIVOR_LOCATED',
    desc: 'Biometric or RF signature match confirmed',
    color: '#F97316',
    icon: '◉',
    glitch: false,
    level: 'L-03',
    severity: 'HIGH',
  },
  OK: {
    key: 'ok',
    title: 'SYSTEM NOMINAL',
    text: 'ALL_CLEAR',
    desc: 'All channels clear — no active alerts',
    color: '#00E5FF',
    icon: '✓',
    glitch: false,
    level: 'L-00',
    severity: 'NOMINAL',
  },
};

const INJECT_BTNS = [
  { id: 'OK',                color: '#00E5FF', bg: 'rgba(0,229,255,0.12)',   label: 'OK'       },
  { id: 'HELP',              color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'HELP'     },
  { id: 'SURVIVOR DETECTED', color: '#F97316', bg: 'rgba(249,115,22,0.12)', label: 'SURVIVOR' },
  { id: 'SOS',               color: '#FF2D55', bg: 'rgba(255,45,85,0.12)',   label: '⚠ SOS'   },
];

const LiveAlertPanel = ({ message, onAlertChange }) => {
  // If the message isn't recognized (not in LEVELS), default specifically this panel to SOS.
  // This satisfies the requirement to "give sos message only in alert protocol" for unknown strings.
  const alert = LEVELS[message] || LEVELS['SOS'];

  return (
    <>
      <div
        className="h-full min-h-[280px] relative flex flex-col glass-panel overflow-hidden"
        style={{
          borderColor: `${alert.color}30`,
          boxShadow: `0 0 0 1px ${alert.color}18, 0 4px 30px rgba(0,0,0,0.7), 0 0 40px ${alert.color}08, inset 0 1px 0 ${alert.color}18`,
        }}
      >
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${alert.color}60, transparent)` }}
        />

        {/* Corner brackets */}
        {[['top-0 left-0','border-t-2 border-l-2'],['top-0 right-0','border-t-2 border-r-2'],
          ['bottom-0 left-0','border-b-2 border-l-2'],['bottom-0 right-0','border-b-2 border-r-2']].map(([pos, brd], i) => (
          <div key={i} className={`absolute ${pos} w-5 h-5 ${brd} m-3 opacity-50`} style={{ borderColor: `${alert.color}80` }} />
        ))}

        {/* Header row */}
        <div
          className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 px-5 py-3 border-b"
          style={{ borderColor: `${alert.color}20`, background: `${alert.color}06` }}
        >
          <div className="flex items-center gap-2 text-[11px] tracking-[0.12em] font-bold uppercase" style={{ color: alert.color }}>
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: alert.color, boxShadow: `0 0 6px ${alert.color}` }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            Alert Protocol
            <span className="text-steel-600 font-mono normal-case ml-1">{alert.level}</span>
            <span
              className="ml-2 text-[8px] px-1.5 py-0.5 rounded font-black tracking-wider"
              style={{
                background: `${alert.color}18`,
                color: alert.color,
                border: `1px solid ${alert.color}30`,
              }}
            >
              {alert.severity}
            </span>
          </div>

          {/* Inject state buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] text-steel-600 tracking-[0.1em] mr-1 uppercase font-semibold">Inject</span>
            {INJECT_BTNS.map(btn => {
              const isActive = message === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => onAlertChange?.(btn.id)}
                  className="text-[9px] px-2.5 py-1 rounded tracking-[0.1em] font-bold uppercase transition-all duration-200 border cursor-pointer"
                  style={{
                    color: isActive ? btn.color : '#647089',
                    background: isActive ? btn.bg : 'transparent',
                    borderColor: isActive ? `${btn.color}50` : 'rgba(169,183,204,0.14)',
                    boxShadow: isActive ? `0 0 10px ${btn.color}30` : 'none',
                  }}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main alert display */}
        <div className="flex-1 flex items-center justify-center relative p-8">
          {/* Background glow */}
          <div
            className="absolute inset-0 opacity-10"
            style={{ background: `radial-gradient(circle at center, ${alert.color} 0%, transparent 70%)` }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={alert.key}
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              animate={{
                opacity: message === 'SOS' ? [0.7, 1, 0.7] : 1,
                scale: 1,
                filter: 'blur(0px)',
              }}
              exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
              transition={message === 'SOS'
                ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center justify-center text-center w-full z-10"
              style={{ willChange: 'opacity, transform' }}
            >
              {/* Icon */}
              <span className="text-3xl mb-2" style={{ color: alert.color, textShadow: `0 0 12px ${alert.color}80` }}>
                {alert.icon}
              </span>

              <p
                className="text-[11px] tracking-[0.4em] mb-3 uppercase font-semibold opacity-70"
                style={{ color: alert.color }}
              >
                [{alert.title}]
              </p>
              <div className="relative">
                <h2
                  className="text-4xl md:text-5xl lg:text-6xl font-black tracking-widest"
                  style={{
                    color: alert.color,
                    textShadow: `0 0 8px ${alert.color}, 0 0 24px ${alert.color}80, 0 0 60px ${alert.color}30`,
                    fontFamily: '"Orbitron", monospace',
                  }}
                >
                  {alert.text}
                </h2>
                {alert.glitch && (
                  <h2
                    className="text-4xl md:text-5xl lg:text-6xl font-black tracking-widest absolute inset-0 animate-glitch pointer-events-none"
                    aria-hidden
                    style={{
                      color: '#FF2D55',
                      fontFamily: '"Orbitron", monospace',
                      opacity: 0.45,
                      mixBlendMode: 'screen',
                    }}
                  >
                    {alert.text}
                  </h2>
                )}
              </div>

              {/* Description */}
              <p className="text-[11px] tracking-wide mt-3 text-steel-400 max-w-xs">
                {alert.desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer data strip */}
        <div
          className="text-[10px] px-5 py-2.5 border-t font-mono tracking-wide flex justify-between items-center"
          style={{ borderColor: `${alert.color}20`, background: 'rgba(0,0,0,0.35)', color: '#647089' }}
        >
          <span>Freq: 915.00 MHz</span>
          <span className="text-center hidden sm:block">
            Src: {message === 'OK' ? 'System' : 'PI5 Decoder'}
          </span>
          <span className="hidden sm:block">Mod: ESP-NOW Mesh</span>
          <span style={{ color: alert.color, opacity: 0.7 }} className="font-semibold">● {alert.severity}</span>
        </div>
      </div>
    </>
  );
};

export default React.memo(LiveAlertPanel);
