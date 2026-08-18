import React from 'react';
import { motion } from 'framer-motion';

const CAPABILITIES = [
  {
    id: 1,
    glyph: '◈',
    title: 'OFFLINE COMMS',
    desc: 'Operates without internet or GSM infrastructure — pure RF mesh protocol',
    stat: '915 MHz',
    statLabel: 'Band',
    color: '#00E5FF',
  },
  {
    id: 2,
    glyph: '⬡',
    title: 'MORSE DECODER',
    desc: 'Real-time Morse code decoding from hardware UART signals via Arduino UNO',
    stat: '< 50 ms',
    statLabel: 'Latency',
    color: '#00E5FF',
  },
  {
    id: 3,
    glyph: '◉',
    title: 'ESP-NOW MESH',
    desc: 'Peer-to-peer ad-hoc mesh, no router required — up to 1km line-of-sight',
    stat: '1.0 km',
    statLabel: 'Range',
    color: '#00E5FF',
  },
  {
    id: 4,
    glyph: '▣',
    title: 'EDGE AI',
    desc: 'Raspberry Pi edge classification and signal processing at the gateway',
    stat: '4-core',
    statLabel: 'CPU',
    color: '#00E5FF',
  },
  {
    id: 5,
    glyph: '◎',
    title: 'SURVIVOR DETECT',
    desc: 'Biometric and RF signature-based human presence alerts via sensor mesh',
    stat: '99.2%',
    statLabel: 'Accuracy',
    color: '#00E5FF',
  },
  {
    id: 6,
    glyph: '⬢',
    title: 'EMERGENCY SOS',
    desc: '24/7 automated rescue command relay with AES-256-GCM encrypted payloads',
    stat: 'AES-256',
    statLabel: 'Cipher',
    color: '#00E5FF',
  },
];

const CapabilityCard = ({ glyph, title, desc, stat, statLabel, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4, transition: { duration: 0.25 } }}
    className="relative group cursor-default overflow-hidden rounded-xl"
    style={{
      background: 'linear-gradient(160deg, rgba(0,229,255,0.02) 0%, rgba(10,14,22,0.9) 100%)',
      border: '1px solid rgba(169,183,204,0.1)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}
  >
    {/* Top glow line */}
    <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />

    {/* Hover bg glow */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
      style={{ background: `radial-gradient(circle at 30% 50%, ${color}08 0%, transparent 70%)` }} />

    <div className="p-5 relative z-10">
      {/* Top row: glyph + stat badge */}
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-2xl leading-none"
          style={{ color, textShadow: `0 0 8px ${color}60` }}
        >
          {glyph}
        </span>
        <div className="flex flex-col items-end">
          <span
            className="text-[15px] font-bold tracking-wide leading-none font-mono"
            style={{ color }}
          >
            {stat}
          </span>
          <span className="text-[9px] tracking-wide font-mono text-steel-600 mt-1">
            {statLabel}
          </span>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-[12px] font-bold tracking-wide mb-2 uppercase text-steel-50">
        {title}
      </h4>

      {/* Desc */}
      <p className="text-[11px] text-steel-400 leading-relaxed tracking-wide">
        {desc}
      </p>

      {/* Bottom border accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
        style={{ background: `linear-gradient(90deg, ${color}50, transparent)` }}
      />
    </div>
  </motion.div>
);

const SystemOverview = () => (
  <div className="py-8">
    {/* Section header */}
    <div className="flex items-center gap-4 mb-8">
      <div className="w-1 h-6 rounded-full bg-neon-cyan" style={{ boxShadow: '0 0 8px #00E5FF' }} />
      <h3 className="text-[15px] font-bold tracking-wide text-steel-50">
        System Capabilities
      </h3>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(169,183,204,0.15), transparent)' }} />
      <span className="text-[9px] tracking-[0.1em] text-steel-600 font-mono font-semibold uppercase">6 Modules Active</span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {CAPABILITIES.map((cap, i) => (
        <CapabilityCard key={cap.id} {...cap} delay={i * 0.07} />
      ))}
    </div>
  </div>
);

export default React.memo(SystemOverview);
