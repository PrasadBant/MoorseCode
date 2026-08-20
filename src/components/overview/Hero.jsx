import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.4 } }
};
const itemVariants = {
  hidden:   { y: 30, opacity: 0 },
  visible:  { y:  0, opacity: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }
};

const TAGLINE = 'Tactical Offline Disaster Communication Protocol';

const TypewriterText = ({ text }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setDisplayed(t => t + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(id);
    }, 38);
    return () => clearInterval(id);
  }, [text]);
  return <span>{displayed}<span className="animate-pulse">_</span></span>;
};

const StatBadge = ({ label, value, accent = '#00E5FF' }) => (
  <div className="flex flex-col items-center px-5 py-2.5 border border-steel-600/40 rounded-md bg-black/30 backdrop-blur-sm transition-colors hover:border-neon-cyan/30">
    <span className="text-[9px] tracking-[0.2em] text-steel-400 uppercase mb-1 font-semibold">{label}</span>
    <span className="text-sm font-bold tracking-wide" style={{ color: accent }}>{value}</span>
  </div>
);

const Hero = () => {
  const [uptime, setUptime] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setUptime(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(uptime / 3600)).padStart(2,'0');
  const m = String(Math.floor((uptime % 3600) / 60)).padStart(2,'0');
  const s = String(uptime % 60).padStart(2,'0');

  return (
    <div className="relative min-h-[88vh] flex flex-col items-center justify-center overflow-hidden bg-[#05080F]">

      {/* ---- Animated horizontal scan bar (GPU-only translateY) ---- */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.35), transparent)',
          top: '10%',
          willChange: 'transform',
        }}
        animate={{ y: ['0vh', '80vh', '0vh'] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
      />

      {/* ---- Content ---- */}
      <motion.div
        className="z-10 flex flex-col items-center text-center w-full max-w-5xl px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top badge */}
        <motion.div variants={itemVariants} className="mb-7">
          <div className="inline-flex items-center gap-2 border border-neon-cyan/20 rounded-full px-4 py-1.5 bg-neon-cyan/[0.04] backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-40" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neon-cyan" style={{ boxShadow: '0 0 6px #00E5FF' }} />
            </span>
            <span className="text-[10px] tracking-[0.25em] text-neon-cyan/85 uppercase font-semibold">Live Mesh Uplink Active</span>
          </div>
        </motion.div>

        {/* Title group */}
        <motion.div variants={itemVariants} className="relative mb-5 select-none w-full">
          {/* Tagline above title */}
          <p className="text-[10px] tracking-[0.45em] text-steel-400 uppercase mb-3 font-medium">
            Protocol // v2.4 // Classified
          </p>

          {/* Main title – Orbitron font */}
          <h1
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-widest leading-none pb-2"
            style={{
              fontFamily: '"Orbitron", "JetBrains Mono", monospace',
              color: '#00E5FF',
              textShadow: '0 0 6px rgba(0,229,255,1), 0 0 20px rgba(0,229,255,0.6), 0 0 60px rgba(0,229,255,0.25)',
            }}
          >
            GHOSTLINK
            <span className="text-neon-cyan/40"> X</span>
          </h1>

          {/* Glitch layer */}
          <h1
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-widest leading-none pb-2 animate-glitch absolute top-[28px] left-0 right-0 pointer-events-none"
            aria-hidden
            style={{
              fontFamily: '"Orbitron", monospace',
              color: '#FF2D55',
              opacity: 0.22,
              mixBlendMode: 'screen',
              animationDuration: '3.8s',
            }}
          >
            GHOSTLINK X
          </h1>
        </motion.div>

        {/* Typewriter subtitle */}
        <motion.div variants={itemVariants} className="mb-9 h-8">
          <p className="text-xs sm:text-sm text-steel-200 tracking-[0.15em] uppercase font-medium">
            <TypewriterText key={TAGLINE} text={TAGLINE} />
          </p>
        </motion.div>

        {/* System integrity bar */}
        <motion.div variants={itemVariants} className="w-full max-w-sm mb-9">
          <div className="flex justify-between text-[10px] text-steel-400 mb-2 tracking-[0.15em] font-semibold uppercase">
            <span>System Integrity</span><span className="text-neon-cyan/70">100% Optimal</span>
          </div>
          <div className="w-full h-[2px] bg-steel-600/25 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #0ea5e9, #00E5FF, #0ea5e9)', boxShadow: '0 0 8px #00E5FF' }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ delay: 1.1, duration: 2, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

        {/* Live stat badges */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mb-9">
          <StatBadge label="UPTIME"     value={`${h}:${m}:${s}`} />
          <StatBadge label="NODES"      value="4 ONLINE" />
          <StatBadge label="ENCRYPTION" value="AES-256-GCM" />
          <StatBadge label="FREQUENCY"  value="915 MHz" />
        </motion.div>

        {/* CTA uplink badge */}
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-3 border border-neon-cyan/25 px-7 py-2.5 rounded-md bg-neon-cyan/[0.05] backdrop-blur-md cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan" style={{ boxShadow: '0 0 6px #00E5FF' }} />
            </span>
            <span className="text-neon-cyan font-semibold tracking-[0.2em] text-[11px] uppercase">
              Uplink Established
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-steel-400 flex flex-col items-center gap-1.5 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 5, 0] }}
        transition={{ delay: 2.4, duration: 2.2, repeat: Infinity }}
      >
        <span className="text-[9px] tracking-[0.3em] uppercase font-medium">Access Dashboard</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </motion.div>
    </div>
  );
};

export default React.memo(Hero);
