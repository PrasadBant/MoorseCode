import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard' },
  { to: '/terminal',  label: 'Terminal'  },
  { to: '/pipeline',  label: 'Pipeline'  },
  { to: '/audit',     label: 'Audit Log' },
];

/**
 * DashboardLayout.jsx
 * The shared shell (header, nav, footer) around every routed page. Nav
 * links are real routes now — each section is its own URL under the
 * dashboard, not an anchor scrolled into view on one long page.
 */
const DashboardLayout = ({
  message,
  isDemoMode,
  isAutoCycle,
  setIsAutoCycle,
  piConnected,
  operatorName,
  onLogout,
}) => (
  <>
    {/* SOS Flash Override — a cross-page concern, so it lives in the layout, not any one page */}
    {message === 'SOS' && (
      <div className="fixed inset-0 z-[200] pointer-events-none animate-flash-red" style={{ border: '3px solid rgba(255,0,51,0.55)' }} />
    )}

    {/* High-Tech Tactical Header */}
    <header className="sticky top-0 w-full z-[100] border-b border-steel-800 bg-[#05080F]/90 backdrop-blur-xl" style={{ boxShadow: '0 1px 0 rgba(0,229,255,0.06), 0 4px 24px rgba(0,0,0,0.6)' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex justify-between items-center gap-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 select-none shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan" style={{ boxShadow: '0 0 8px #00E5FF' }} />
          </span>
          <span className="font-black tracking-[0.16em] text-xs text-shadow-neon" style={{ fontFamily: '"Orbitron", monospace' }}>
            GHOSTLINK<span className="text-neon-cyan/40"> X</span>
          </span>
        </NavLink>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-[10px] tracking-[0.1em] font-semibold">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md uppercase transition-colors ${
                  isActive
                    ? 'text-neon-cyan bg-neon-cyan/[0.08]'
                    : 'text-steel-400 hover:text-neon-cyan hover:bg-neon-cyan/[0.06]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Status Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden lg:flex items-center gap-2 border border-steel-800 rounded-md px-2.5 py-1.5 bg-black/30">
            <span className="text-steel-400 text-[9px] tracking-[0.1em] uppercase font-semibold">OPR</span>
            <span className="text-neon-cyan text-[10px] font-bold tracking-wide uppercase">{operatorName}</span>
            <span className="mx-0.5 text-steel-600">|</span>
            <button onClick={onLogout} className="text-[9px] tracking-[0.1em] font-semibold text-danger-red hover:text-white transition-colors uppercase">Logout</button>
          </div>

          {/* Pi 5 Connection Badge */}
          <div className="hidden sm:flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 text-[9px] tracking-[0.08em] font-semibold"
            style={{
              borderColor: piConnected ? 'rgba(0,229,255,0.22)' : 'rgba(255,59,92,0.22)',
              background: piConnected ? 'rgba(0,229,255,0.05)' : 'rgba(255,59,92,0.05)',
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              {piConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: '#00E5FF' }} />}
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ background: piConnected ? '#00E5FF' : '#FF3B5C' }} />
            </span>
            <span style={{ color: piConnected ? '#00E5FF' : '#FF3B5C' }}>
              {piConnected ? 'PI5 LIVE' : 'PI5 OFFLINE'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 border border-steel-800 rounded-md px-2.5 py-1.5 bg-black/30 text-[9px] tracking-[0.08em] font-semibold">
            <span className="text-steel-400 uppercase">Sim</span>
            <button
              onClick={() => setIsAutoCycle(!isAutoCycle)}
              className={`cursor-pointer transition-colors uppercase ${isAutoCycle ? 'text-neon-cyan' : 'text-danger-red'}`}
            >
              {isAutoCycle ? 'Auto' : 'Manual'}
            </button>
          </div>
          {isDemoMode && (
            <span className="bg-danger-red/15 text-danger-red border border-danger-red/30 text-[9px] font-bold px-2 py-1 rounded-md tracking-[0.08em] uppercase select-none">
              Sim Active
            </span>
          )}
        </div>
      </div>

      {/* Mobile nav (below the md breakpoint the header nav is hidden) */}
      <nav className="md:hidden flex items-center gap-1 px-4 pb-2 text-[10px] tracking-[0.08em] font-semibold overflow-x-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md uppercase whitespace-nowrap transition-colors ${
                isActive ? 'text-neon-cyan bg-neon-cyan/[0.08]' : 'text-steel-400'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>

    <main className="relative z-[10] min-h-[70vh]">
      <Outlet />
    </main>

    <footer
      className="relative text-center py-10 mt-16"
      style={{
        background: 'linear-gradient(to top, rgba(0,229,255,0.02) 0%, transparent 100%)',
        borderTop: '1px solid rgba(169,183,204,0.08)',
      }}
    >
      {/* Top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.35), transparent)' }} />

      <div className="text-[11px] font-bold tracking-[0.15em] mb-2 text-steel-200">
        GHOSTLINK X <span className="text-steel-600">·</span> Protocol Suite v2.4 <span className="text-steel-600">·</span> {new Date().getFullYear()}
      </div>
      <div className="text-[9px] tracking-[0.15em] text-steel-600 uppercase font-medium">
        Confidential · Unauthorized Replication Prohibited · Restricted Access Area
      </div>
      <div className="mt-4 flex justify-center gap-4 text-[9px] tracking-wide text-steel-600 font-mono">
        <span>AES-256-GCM Encrypted</span>
        <span className="text-steel-800">·</span>
        <span>ESP-NOW Mesh Protocol</span>
        <span className="text-steel-800">·</span>
        <span>915 MHz RF Band</span>
      </div>
    </footer>
  </>
);

export default DashboardLayout;
