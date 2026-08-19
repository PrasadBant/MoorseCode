/**
 * AdminLogin.jsx
 * Operator authentication screen gating the GHOSTLINK X dashboard.
 *
 * Split-panel HUD layout: left is a live tactical readout (radar sweep,
 * telemetry, ambient boot log) that never blocks anything; right is the
 * actual auth form, visible immediately so operators aren't stalled by
 * decoration.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Demo credentials (replace with real auth in production) ──
const VALID_CREDENTIALS = [
  { user: 'admin',    pass: 'ghost2024' },
  { user: 'operator', pass: 'rescue915' },
  { user: 'vishu',    pass: 'moorscode' },
];

const BOOT_LINES = [
  'GHOSTLINK X SECURE BOOT SEQUENCE v2.4.8 ...',
  'LOADING ENCRYPTION MODULE: AES-256-GCM ... OK',
  'MESH INTERFACE 915MHz ONLINE ... OK',
  'INTEGRITY CHECK: PASSED [SHA-512]',
  'AWAITING OPERATOR AUTHENTICATION ...',
];

// ── Radar sweep — ambient tactical visual, left panel only ─────
const RadarSweep = () => {
  const blips = [
    { x: 62,  y: 42,  delay: 0    },
    { x: 142, y: 70,  delay: 1.3  },
    { x: 96,  y: 152, delay: 2.4  },
    { x: 154, y: 128, delay: 3.5  },
  ];
  return (
    <div className="relative w-full aspect-square max-w-[240px] mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
        {[38, 68, 98].map(r => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="rgba(0,229,255,0.14)" strokeWidth="1" />
        ))}
        <line x1="100" y1="2" x2="100" y2="198" stroke="rgba(0,229,255,0.09)" strokeWidth="1" />
        <line x1="2" y1="100" x2="198" y2="100" stroke="rgba(0,229,255,0.09)" strokeWidth="1" />

        <motion.g
          style={{ transformOrigin: '100px 100px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <defs>
            <linearGradient id="radarSweepGrad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%"  stopColor="#00E5FF" stopOpacity="0" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path d="M100,100 L100,2 A98,98 0 0,1 169,31 Z" fill="url(#radarSweepGrad)" />
        </motion.g>

        {blips.map((b, i) => (
          <motion.circle
            key={i}
            cx={b.x} cy={b.y} r="3"
            fill="#00E5FF"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
            style={{ filter: 'drop-shadow(0 0 3px #00E5FF)' }}
          />
        ))}
        <circle cx="100" cy="100" r="2.5" fill="#00E5FF" style={{ filter: 'drop-shadow(0 0 4px #00E5FF)' }} />
      </svg>
    </div>
  );
};

// ── Telemetry readout row ───────────────────────────────────────
const TelemetryLine = ({ label, value, color = '#00E5FF' }) => (
  <div className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid rgba(169,183,204,0.06)' }}>
    <span className="text-[9px] tracking-[0.15em] text-steel-400 uppercase font-mono">{label}</span>
    <span className="text-[10px] font-mono font-semibold" style={{ color }}>{value}</span>
  </div>
);

const useUptime = () => {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// ── Ambient boot log feed (typewriter, non-blocking) ────────────
const BootLog = () => {
  const [visible, setVisible] = useState([]);
  useEffect(() => {
    const timers = BOOT_LINES.map((line, i) =>
      setTimeout(() => setVisible(v => [...v, line]), 350 + i * 420)
    );
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div
      className="rounded-lg px-3.5 py-3 font-mono space-y-1 h-[104px] overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(169,183,204,0.08)' }}
    >
      {visible.map((line, i) => (
        <motion.div
          key={line}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-[10px] tracking-wide leading-relaxed ${i === visible.length - 1 ? 'text-neon-cyan/75' : 'text-steel-400'}`}
        >
          <span className="opacity-40 mr-2">{'>'}</span>{line}
          {i === visible.length - 1 && <span className="animate-pulse">_</span>}
        </motion.div>
      ))}
    </div>
  );
};

// ── Status indicator dot ───────────────────────────────────────
const StatusDot = ({ status }) => {
  const cfg = {
    idle:          { color: '#647089', label: 'STANDBY'      },
    authenticating:{ color: '#F59E0B', label: 'VERIFYING'    },
    error:         { color: '#FF3B5C', label: 'DENIED'       },
    success:       { color: '#00E5FF', label: 'GRANTED'      },
  }[status] || { color: '#374151', label: 'UNKNOWN' };

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-1.5 w-1.5">
        {status !== 'idle' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
            style={{ background: cfg.color }} />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full"
          style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
      </span>
      <span className="text-[9px] font-mono font-semibold tracking-[0.15em]" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
};

// ── Main Login Component ───────────────────────────────────────
const AdminLogin = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status,   setStatus]   = useState('idle'); // idle | authenticating | error | success
  const [attempt,  setAttempt]  = useState(0);
  const [shake,    setShake]    = useState(false);
  const userRef = useRef(null);
  const uptime = useUptime();

  useEffect(() => { setTimeout(() => userRef.current?.focus(), 300); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'authenticating' || status === 'success') return;

    setStatus('authenticating');

    // Simulate auth delay (like a real API call)
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));

    const valid = VALID_CREDENTIALS.some(
      c => c.user === username.trim().toLowerCase() && c.pass === password.trim()
    );

    if (valid) {
      setStatus('success');
      setTimeout(() => onAuthenticated(username.trim()), 900);
    } else {
      setStatus('error');
      setAttempt(a => a + 1);
      setShake(true);
      setPassword('');
      setTimeout(() => { setShake(false); setStatus('idle'); }, 1600);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex overflow-hidden bg-[#05080F]">

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-animated-grid opacity-30 pointer-events-none z-0" />
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 60% 45% at 50% 38%, rgba(0,229,255,0.05) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full flex flex-col lg:flex-row min-h-screen">

        {/* ── LEFT PANEL — tactical readout ───────────────────── */}
        <motion.div
          className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-10 lg:px-16 relative"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ borderRight: '1px solid rgba(169,183,204,0.08)' }}
        >
          <div className="mx-auto w-full max-w-[340px]">
            {/* Logo mark */}
            <div className="flex items-center gap-3 mb-8">
              <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.35))' }}>
                  <polygon points="32,4 58,18 58,46 32,60 6,46 6,18"
                    fill="none" stroke="#00E5FF" strokeWidth="1.25" strokeOpacity="0.55" />
                  <polygon points="32,10 52,21 52,43 32,54 12,43 12,21"
                    fill="rgba(0,229,255,0.04)" stroke="#00E5FF" strokeWidth="0.5" strokeOpacity="0.28" />
                </svg>
                <span className="text-sm font-black text-neon-cyan" style={{ fontFamily: '"Orbitron", monospace', textShadow: '0 0 10px #00E5FF' }}>GX</span>
              </div>
              <div>
                <h1 className="text-sm font-black tracking-[0.28em] text-neon-cyan text-shadow-neon-sm"
                  style={{ fontFamily: '"Orbitron", monospace' }}>
                  GHOSTLINK X
                </h1>
                <p className="text-[9px] tracking-[0.25em] text-steel-400 uppercase font-medium">
                  Tactical Command Console
                </p>
              </div>
            </div>

            {/* Radar */}
            <RadarSweep />

            {/* Telemetry readout */}
            <div className="mt-6 mb-4">
              <TelemetryLine label="Link Status"   value="ONLINE" />
              <TelemetryLine label="Encryption"    value="AES-256-GCM" />
              <TelemetryLine label="Mesh Channels" value="4 / 4 SYNCED" />
              <TelemetryLine label="Session Clock" value={uptime} color="#A9B7CC" />
            </div>

            {/* Boot log */}
            <BootLog />
          </div>
        </motion.div>

        {/* ── RIGHT PANEL — auth form ─────────────────────────── */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-10 lg:px-16">
          <motion.div
            className="w-full max-w-[380px]"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={shake ? { x: [-7, 7, -5, 5, -3, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(0,229,255,0.035) 0%, rgba(10,14,22,0.94) 100%)',
                border: status === 'error'   ? '1px solid rgba(255,59,92,0.4)'   :
                        status === 'success' ? '1px solid rgba(0,229,255,0.45)'   :
                                               '1px solid rgba(169,183,204,0.12)',
                boxShadow: status === 'error'   ? '0 0 24px rgba(255,59,92,0.14), 0 8px 40px rgba(0,0,0,0.8)'   :
                            status === 'success' ? '0 0 24px rgba(0,229,255,0.16), 0 8px 40px rgba(0,0,0,0.8)'   :
                                                   '0 8px 40px rgba(0,0,0,0.8)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }}
            >
              {/* Top shimmer */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.45), transparent)' }} />

              <div className="px-7 py-7">
                {/* Card header */}
                <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid rgba(169,183,204,0.08)' }}>
                  <div>
                    <h2 className="text-[13px] font-bold tracking-wide text-steel-50">
                      Operator Authentication
                    </h2>
                    <p className="text-[9px] tracking-[0.2em] text-steel-400 font-mono mt-0.5 uppercase">
                      Clearance Level · Alpha-1
                    </p>
                  </div>
                  <StatusDot status={status} />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Username field */}
                  <div className="space-y-1.5">
                    <label htmlFor="operator-id" className="text-[10px] tracking-[0.15em] font-semibold text-steel-400 uppercase">
                      Operator ID
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400 pointer-events-none select-none text-xs">
                        ◈
                      </div>
                      <input
                        id="operator-id"
                        ref={userRef}
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        disabled={status === 'authenticating' || status === 'success'}
                        placeholder="Enter operator ID"
                        autoComplete="username"
                        className="w-full pl-9 pr-4 py-2.5 text-[13px] focus:outline-none transition-all duration-200"
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(169,183,204,0.16)',
                          borderRadius: 8,
                          color: '#E8EDF4',
                          caretColor: '#00E5FF',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.5)'}
                        onBlur={e => e.target.style.borderColor  = 'rgba(169,183,204,0.16)'}
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-1.5">
                    <label htmlFor="access-code" className="text-[10px] tracking-[0.15em] font-semibold text-steel-400 uppercase">
                      Access Code
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400 pointer-events-none select-none text-xs">
                        ◉
                      </div>
                      <input
                        id="access-code"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={status === 'authenticating' || status === 'success'}
                        placeholder="••••••••••"
                        autoComplete="current-password"
                        className="w-full pl-9 pr-4 py-2.5 text-[13px] tracking-widest focus:outline-none transition-all duration-200"
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          border: `1px solid ${status === 'error' ? 'rgba(255,59,92,0.4)' : 'rgba(169,183,204,0.16)'}`,
                          borderRadius: 8,
                          color: status === 'error' ? '#FF3B5C' : '#E8EDF4',
                          caretColor: '#00E5FF',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.5)'}
                        onBlur={e => e.target.style.borderColor  = status === 'error' ? 'rgba(255,59,92,0.4)' : 'rgba(169,183,204,0.16)'}
                      />
                    </div>
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {status === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-lg px-3 py-2 text-[11px] font-medium tracking-wide text-danger-red flex items-center gap-2"
                        style={{ background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.22)' }}
                      >
                        <span>✗</span>
                        <span>Invalid credentials — attempt {attempt}/3 logged</span>
                      </motion.div>
                    )}
                    {status === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="rounded-lg px-3 py-2 text-[11px] font-medium tracking-wide text-neon-cyan flex items-center gap-2"
                        style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.25)' }}
                      >
                        <span>✓</span>
                        <span>Access granted — loading tactical console…</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={!username || !password || status === 'authenticating' || status === 'success'}
                    whileHover={status === 'idle' ? { scale: 1.005 } : {}}
                    whileTap={status  === 'idle' ? { scale: 0.99 } : {}}
                    className="w-full py-3 text-[12px] font-bold tracking-[0.2em] uppercase transition-all duration-300 relative overflow-hidden"
                    style={{
                      borderRadius: 8,
                      border: '1px solid rgba(0,229,255,0.3)',
                      background: status === 'authenticating'
                        ? 'rgba(0,229,255,0.06)'
                        : status === 'success'
                        ? 'rgba(0,229,255,0.16)'
                        : (username && password) ? 'rgba(0,229,255,0.1)' : 'rgba(169,183,204,0.04)',
                      color: !username || !password ? 'rgba(169,183,204,0.35)' : '#00E5FF',
                      boxShadow: status === 'success' ? '0 0 18px rgba(0,229,255,0.2)' : 'none',
                      cursor: !username || !password ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {status === 'authenticating' ? (
                      <span className="flex items-center justify-center gap-3">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          className="inline-block w-3 h-3 border border-neon-cyan/30 border-t-neon-cyan rounded-full"
                        />
                        Verifying
                      </span>
                    ) : status === 'success' ? (
                      '✓ Access Granted'
                    ) : (
                      'Authenticate'
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Bottom classification bar */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-[8px] tracking-[0.3em] text-steel-600 uppercase font-medium">
                Classified · Restricted Access · Unauthorized Use Prohibited
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Success transition overlay */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ background: 'radial-gradient(circle at center, rgba(0,229,255,0.08) 0%, rgba(1,8,1,0) 70%)' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLogin;
