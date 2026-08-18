import React from 'react';
import { motion } from 'framer-motion';

const NODES = [
  { title: 'ARDUINO UNO',     icon: '⬡', desc: 'MORSE DECODER' },
  { title: 'ESP8266 TX',      icon: '◈', desc: 'RF TRANSMITTER' },
  { title: 'ESP8266 RX',      icon: '◈', desc: 'RF RECEIVER'   },
  { title: 'RASPBERRY PI',    icon: '⬡', desc: 'API GATEWAY'   },
  { title: 'REACT DASHBOARD', icon: '◉', desc: 'VISUALIZATION' },
];

const LINKS = [
  { label: 'UART RX/TX',  sub: '9600 BAUD'   },
  { label: '915MHz MESH', sub: 'ESP-NOW'      },
  { label: 'USB SERIAL',  sub: '115200 BAUD'  },
  { label: 'LAN API',     sub: ':5000 HTTP'   },
];

const PipelineNode = ({ title, icon, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center gap-1 z-10 group"
  >
    <div
      className="relative flex flex-col items-center justify-center w-[112px] px-3 py-3.5 rounded-lg border text-center transition-colors duration-300 cursor-default hover:border-neon-cyan/35"
      style={{
        background: 'linear-gradient(160deg, rgba(0,229,255,0.03) 0%, rgba(10,14,22,0.85) 100%)',
        borderColor: 'rgba(169,183,204,0.14)',
      }}
    >
      <span className="text-xl mb-1 text-neon-cyan" style={{ textShadow: '0 0 6px rgba(0,229,255,0.5)' }}>{icon}</span>
      <span className="text-[10px] font-bold tracking-wide text-steel-50 leading-tight">{title}</span>
      <span className="text-[8px] tracking-wide text-steel-600 mt-0.5 font-mono uppercase">{desc}</span>
    </div>
  </motion.div>
);

const PipelineLink = ({ label, sub, delay }) => (
  <motion.div
    initial={{ opacity: 0, scaleX: 0 }}
    animate={{ opacity: 1, scaleX: 1 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    className="relative flex flex-col items-center justify-center flex-1 min-w-[70px]"
  >
    {/* Label above */}
    <div className="absolute -top-8 flex flex-col items-center gap-0.5">
      <span className="text-[9px] text-steel-200 whitespace-nowrap font-semibold tracking-wide">{label}</span>
      <span className="text-[8px] text-steel-600 whitespace-nowrap font-mono">{sub}</span>
    </div>

    {/* Line */}
    <div className="relative w-full h-px" style={{ background: 'linear-gradient(90deg, rgba(0,229,255,0.4), rgba(169,183,204,0.12))' }}>
      {/* Animated dot packet */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-0 w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pipeline-dot"
        style={{ boxShadow: '0 0 6px #00E5FF, 0 0 12px rgba(0,229,255,0.4)' }}
      />
    </div>

    {/* Arrowhead */}
    <div
      className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0"
      style={{ borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: '6px solid rgba(169,183,204,0.3)' }}
    />
  </motion.div>
);

const PipelineDiagram = () => (
  <div
    className="relative overflow-hidden rounded-xl p-6 md:p-8"
    style={{
      background: 'linear-gradient(160deg, rgba(0,229,255,0.02) 0%, rgba(10,14,22,0.96) 100%)',
      border: '1px solid rgba(169,183,204,0.1)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.6)',
    }}
  >
    {/* Background grid */}
    <div
      className="absolute inset-0 opacity-30 pointer-events-none bg-animated-grid"
      style={{ backgroundSize: '30px 30px' }}
    />

    {/* Header */}
    <div className="flex items-center justify-between mb-10 relative z-10">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-neon-cyan rounded-full" style={{ boxShadow: '0 0 8px #00E5FF' }} />
        <h3 className="text-[15px] font-bold tracking-wide text-steel-50">
          Data Flow Pipeline
        </h3>
      </div>
      <div className="hidden sm:flex items-center gap-2 text-[9px] tracking-[0.1em] text-steel-600 font-mono font-semibold uppercase">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-40" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neon-cyan/70" />
        </span>
        Live Transmission
      </div>
    </div>

    {/* Pipeline */}
    <div className="flex items-center min-w-[700px] py-6 px-2 relative z-10 overflow-x-auto">
      {NODES.map((node, i) => (
        <React.Fragment key={node.title}>
          <PipelineNode {...node} delay={i * 0.1} />
          {i < LINKS.length && <PipelineLink {...LINKS[i]} delay={i * 0.1 + 0.05} />}
        </React.Fragment>
      ))}
    </div>

    {/* Bottom legend */}
    <div className="flex flex-wrap gap-4 mt-2 relative z-10 border-t border-steel-800/60 pt-4">
      {[
        { color: '#00E5FF', label: 'Mesh Transceiver Node' },
        { color: 'rgba(169,183,204,0.4)', label: 'Data Pipeline Link' },
        { color: '#00E5FF', label: 'Active Transmission' },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2 text-[9px] tracking-wide text-steel-600 font-mono">
          <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: color === '#00E5FF' ? `0 0 4px ${color}` : 'none' }} />
          {label}
        </div>
      ))}
    </div>
  </div>
);

export default React.memo(PipelineDiagram);
