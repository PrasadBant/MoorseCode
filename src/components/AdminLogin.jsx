/**
 * AdminLogin.jsx
 * Operator authentication screen gating the GHOSTLINK X dashboard.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// ── Demo credentials (replace with real auth in production) ──
const VALID_CREDENTIALS = [
  { user: 'admin',    pass: 'ghost2024' },
  { user: 'operator', pass: 'rescue915' },
  { user: 'vishu',    pass: 'moorscode' },
];

// ── Typewriter for the boot sequence ──────────────────────────
const BootLine = ({ text, delay = 0, dim = false, onDone }) => {
  const [shown, setShown] = useState('');
  useEffect(() => {
    let i = 0;
    const t = setTimeout(() => {
      const id = setInterval(() => {
        setShown(text.slice(0, ++i));
        if (i >= text.length) { clearInterval(id); onDone?.(); }
      }, 20);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);
  return (
    <div className={`font-mono text-[11px] tracking-wide leading-relaxed ${dim ? 'text-steel-400' : 'text-neon-cyan/75'}`}>
      <span className="opacity-40 mr-2">{'>'}</span>{shown}
      {shown.length < text.length && <span className="animate-pulse">_</span>}
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
  const [showForm, setShowForm] = useState(false);
  const userRef = useRef(null);

  // Focus username once form appears
  useEffect(() => { if (showForm) setTimeout(() => userRef.current?.focus(), 300); }, [showForm]);

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

  const BOOT_LINES = [
    { text: 'GHOSTLINK X SECURE BOOT SEQUENCE v2.4.8 ...', delay: 80 },
    { text: 'LOADING ENCRYPTION MODULE: AES-256-GCM ... OK', delay: 620 },
    { text: 'MESH INTERFACE 915MHz ONLINE ... OK',            delay: 1080 },
    { text: 'INTEGRITY CHECK: PASSED [SHA-512]',              delay: 1480 },
    { text: 'AWAITING OPERATOR AUTHENTICATION ...',           delay: 1880 },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#05080F] px-4 py-12">

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-animated-grid opacity-30 pointer-events-none z-0" />
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 60% 45% at 50% 38%, rgba(0,229,255,0.05) 0%, transparent 70%)' }} />

      {/* Content layer */}
      <div className="relative z-10 w-full max-w-[380px] flex flex-col items-center">

        {/* Logo mark */}
        <motion.div
          className="mb-7 flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Hex badge */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.35))' }}>
              <polygon points="32,4 58,18 58,46 32,60 6,46 6,18"
                fill="none" stroke="#00E5FF" strokeWidth="1.25" strokeOpacity="0.55" />
              <polygon points="32,10 52,21 52,43 32,54 12,43 12,21"
                fill="rgba(0,229,255,0.04)" stroke="#00E5FF" strokeWidth="0.5" strokeOpacity="0.28" />
            </svg>
            <span className="text-xl font-black text-neon-cyan" style={{ fontFamily: '"Orbitron", monospace', textShadow: '0 0 10px #00E5FF' }}>GX</span>
          </div>

          <div className="text-center">
            <h1 className="text-base font-black tracking-[0.28em] text-neon-cyan text-shadow-neon"
              style={{ fontFamily: '"Orbitron", monospace' }}>
              GHOSTLINK X
            </h1>
            <p className="text-[10px] tracking-[0.3em] text-steel-400 uppercase mt-1 font-medium">
              Tactical Command Console
            </p>
          </div>
        </motion.div>

        {/* Boot terminal */}
        <motion.div
          className="w-full mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div
            className="rounded-lg px-4 py-3 font-mono space-y-1"
            style={{
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(169,183,204,0.08)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
            }}
          >
            {BOOT_LINES.map((line, i) => (
              <BootLine
                key={i}
                text={line.text}
                delay={line.delay}
                dim={i !== BOOT_LINES.length - 1}
                onDone={i === BOOT_LINES.length - 1 ? () => setShowForm(true) : undefined}
              />
            ))}
          </div>
        </motion.div>

        {/* Login Card */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              key="logincard"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom classification bar */}
        <motion.div
          className="mt-7 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-[8px] tracking-[0.3em] text-steel-600 uppercase font-medium">
            Classified · Restricted Access · Unauthorized Use Prohibited
          </p>
        </motion.div>
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
