import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalBackground3D from '@/components/three/GlobalBackground3D';
import AdminLogin from '@/components/auth/AdminLogin';
import { API_ENDPOINT } from '@/config/env';
import { DEMO_CYCLE } from '@/constants/telemetry';
import { LOCATE_SECTORS, LOCATE_BASE_LAT, LOCATE_BASE_LNG, LOCATE_JITTER_DEG } from '@/constants/locate';
import { getPreciseTime } from '@/utils/time';
import { normalizeMessage } from '@/utils/signal';

// Everything behind the login gate is code-split into its own chunk — the
// login screen's initial load shouldn't have to fetch/parse the terminal,
// radar scene, pipeline diagram, and audit log before an operator even
// authenticates.
const Dashboard = lazy(() => import('@/components/layout/Dashboard'));

// Shown briefly while the code-split Dashboard chunk is fetched/parsed.
const DashboardLoading = () => (
  <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-3 text-neon-cyan/50 font-mono">
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-40" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon-cyan" style={{ boxShadow: '0 0 8px #00E5FF' }} />
    </span>
    <span className="text-[10px] tracking-[0.35em] uppercase">Loading tactical console…</span>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [operatorName, setOperatorName] = useState('');

  const handleAuthenticated = useCallback((username) => {
    setOperatorName(username.toUpperCase());
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setOperatorName('');
  }, []);

  const [data, setData] = useState({
    status: 'ACTIVE',
    message: 'OK',
    esp_status: 'CONNECTED',
    time: getPreciseTime()
  });

  // Persistent Logs State
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('ghostlinkx_audit');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Coerce/validate each entry's shape — logs restored from a previous
        // session (older format, manual edits, corruption) aren't guaranteed
        // to have a string `message`, which downstream code assumes.
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed
            .filter(entry => entry && typeof entry === 'object')
            .map(entry => ({
              id: entry.id ?? (Date.now() + Math.random()),
              time: typeof entry.time === 'string' ? entry.time : getPreciseTime(),
              message: typeof entry.message === 'string' ? entry.message : String(entry.message ?? ''),
              type: typeof entry.type === 'string' ? entry.type : 'info',
            }));
          if (sanitized.length > 0) return sanitized;
        }
      } catch (e) {
        console.error("Error loading logs from cache:", e);
      }
    }
    return [
      { id: 1, time: getPreciseTime(), message: 'SYSTEM INITIALIZATION COMPLETE', type: 'info' },
      { id: 2, time: getPreciseTime(), message: 'ENCRYPTION HANDSHAKE: AES-256-GCM', type: 'info' },
      { id: 3, time: getPreciseTime(), message: 'MESH TRANSCEIVER SYNC: ONLINE (4 CHANNELS)', type: 'info' }
    ];
  });
  
  const [isDemoMode, setIsDemoMode] = useState(true); // Default to dynamic demo state
  const [isAutoCycle, setIsAutoCycle] = useState(true); // Toggle to pause/resume auto cycle rotation
  const demoIndexRef = useRef(0);
  const lastMessageRef = useRef('OK');

  // Tactical Map — accumulated coordinate fixes from the `locate` command
  const [locatePins, setLocatePins] = useState([]);
  const locateSectorRef = useRef(0);

  // Sync logs state with localStorage
  useEffect(() => {
    localStorage.setItem('ghostlinkx_audit', JSON.stringify(logs));
  }, [logs]);

  const addLog = useCallback((message, type = 'info') => {
    setLogs(prev => {
      const newLogs = [...prev, { id: Date.now() + Math.random(), time: getPreciseTime(), message, type }];
      if (newLogs.length > 100) return newLogs.slice(newLogs.length - 100);
      return newLogs;
    });
  }, []);

  const handleClearLogs = useCallback(() => {
    setLogs([]);
    setTimeout(() => {
      addLog('LOG REPOSITORY PURGED. STANDBY FOR NEW TELEMETRY...', 'warning');
    }, 100);
  }, [addLog]);

  // Raspberry Pi 5 Server Polling (Runs in background)
  const [piConnected, setPiConnected] = useState(false);

  // Mirrors isDemoMode into a ref so the polling loop (mounted once, deps: [])
  // always reads the latest value instead of the one captured at mount.
  const isDemoModeRef = useRef(isDemoMode);
  useEffect(() => { isDemoModeRef.current = isDemoMode; }, [isDemoMode]);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const response = await fetch(API_ENDPOINT, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) throw new Error('Bad response from Pi');
        const json = await response.json();

        if (!active) return;

        const normalizedMsg = normalizeMessage(json.message);

        setData({
          ...json,
          message: normalizedMsg,
          time: getPreciseTime()
        });

        setIsDemoMode(false);
        setPiConnected(true);
        setIsAutoCycle(false); // Force demo off if Pi is live

        if (normalizedMsg !== lastMessageRef.current) {
          addLog(`PI5_LIVE_UPDATE: ${normalizedMsg}`, normalizedMsg === 'SOS' ? 'error' : 'warning');
          lastMessageRef.current = normalizedMsg;
        }
      } catch {
        if (!active) return;
        if (!isDemoModeRef.current) {
          setIsDemoMode(true);
          setPiConnected(false);
          addLog('PI5_CONNECTION_LOST — DEMO_FALLBACK_ENGAGED', 'error');
        }
      }
    };

    // Connect immediately on mount, then poll every 2 seconds
    fetchData();
    const pollInterval = setInterval(fetchData, 2000);
    return () => { active = false; clearInterval(pollInterval); };
  }, [addLog]);

  // Telemetry Auto Cycling (Only active if AutoCycle is ON)
  useEffect(() => {
    let demoInterval;
    if (isDemoMode && isAutoCycle) {
      demoInterval = setInterval(() => {
        const nextState = DEMO_CYCLE[demoIndexRef.current];
        const newData = {
          ...nextState,
          time: getPreciseTime()
        };
        
        setData(newData);
        
        if (newData.message !== lastMessageRef.current) {
          addLog(`DYNAMIC_INJECT: ${newData.message}`, newData.message === 'SOS' ? 'error' : newData.message === 'HELP' ? 'warning' : 'info');
          if (newData.message === 'SOS') {
            addLog(`DECRYPTED_PAYLOAD: ... --- ... (SOS)`, 'error');
            addLog(`AUTO_LOCKDOWN_PROTOCOL_INITIATED`, 'warning');
          } else if (newData.message === 'SURVIVOR DETECTED') {
            addLog(`BIOMETRIC_SIGNATURE_MATCH AT NODE_0x${Math.floor(Math.random() * 16777215).toString(16).toUpperCase()}`, 'warning');
          }
          lastMessageRef.current = newData.message;
        }
        
        demoIndexRef.current = (demoIndexRef.current + 1) % DEMO_CYCLE.length;
      }, 6000);
    }
    return () => clearInterval(demoInterval);
  }, [isDemoMode, isAutoCycle, addLog]);

  // Alert mode manual trigger changer
  const handleAlertChange = useCallback((newAlert) => {
    setIsAutoCycle(false); // Pause auto-cycling when manual inject occurs
    setData(prev => ({
      ...prev,
      message: newAlert,
      time: getPreciseTime()
    }));

    if (newAlert === 'SOS') {
      addLog('MANUAL_INJECT: PROTOCOL_SOS - EMERGENCY BROADCAST PULSED', 'error');
      addLog('DECRYPTED_PAYLOAD: ... --- ... (SOS)', 'error');
      addLog('RADAR SHIFTED TO HIGH-FREQUENCY DISTRESS WARNING RANGE', 'warning');
    } else if (newAlert === 'HELP') {
      addLog('MANUAL_INJECT: PROTOCOL_HELP - WARNING LEVEL ENGAGED', 'warning');
    } else if (newAlert === 'SURVIVOR DETECTED') {
      addLog('MANUAL_INJECT: SURVIVOR_LOCATED - BIOMETRIC CORRELATION OK', 'warning');
    } else {
      addLog('MANUAL_INJECT: NOMINAL - STANDBY STATE RESTORED', 'success');
    }

    lastMessageRef.current = newAlert;
  }, [addLog]);

  // Keeps a live snapshot of `data` so handleExecuteCommand can read it
  // without needing `data` in its dependency array (which changes every
  // poll tick and would otherwise recreate the callback constantly).
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  // Command prompt pipeline processor
  const handleExecuteCommand = useCallback((commandText) => {
    const rawCmd = commandText.trim();
    const cmd = rawCmd.toLowerCase();

    // Log the input
    addLog(`>> ${rawCmd}`, 'success');

    if (cmd === 'help') {
      addLog('AVAILABLE SECURE MESH OPERATIONS SCHEMA:', 'success');
      addLog('  HELP     - DISPLAY COMMAND DIRECTORY REFERENCE', 'info');
      addLog('  STATUS   - REPORT ACTIVE RF SYSTEM TELEMETRY', 'info');
      addLog('  PING     - COMPUTE ROUND-TRIP SIGNAL SPEED', 'info');
      addLog('  SCAN     - TRIGGER TRANSCEIVER RF FREQUENCY SWEEP', 'info');
      addLog('  LOCATE   - PRINT TARGET SOS SIGNAL COORDINATES', 'info');
      addLog('  NODES    - DETAIL CONNECTION STATUS OF ONLINE PEERS', 'info');
      addLog('  SOS      - REMOTE BROADCAST SOS DISTRESS PROTOCOLS', 'error');
      addLog('  OK       - RESET SYSTEM LOCKDOWN TO NOMINAL STATUS', 'success');
      addLog('  CLEAR    - PURGE HISTORY FEEDS SCREEN', 'info');
    } else if (cmd === 'clear') {
      setLogs([]);
      setTimeout(() => {
        addLog('CLI FEED LOG TERMINATED. UPLINK RETAINED.', 'success');
      }, 100);
    } else if (cmd === 'status') {
      const current = dataRef.current;
      addLog('SYSTEM: ONLINE | ENCRYPTION: SECURE | CORE_STATUS: ACTIVE', 'success');
      addLog(`ACTIVE ALARM PROTOCOL: ${current.message} // SYNC TIME: ${current.time}`, current.message === 'SOS' ? 'error' : 'info');
    } else if (cmd === 'ping') {
      addLog('BROADCASTING COMPACT HANDSHAKE PACKET...', 'info');
      const rtt = Math.floor(Math.random() * 8) + 12;
      addLog(`REPLY FROM NODE_0xFA21: BYTES=32 TIME=${rtt}ms TTL=64 LEVEL=OPTIMAL`, 'success');
    } else if (cmd === 'scan') {
      addLog('INITIATING TRANSCEIVER SWEEP ON FREQ 915.00 MHz...', 'info');
      addLog('SCANNING MESH CHANNELS IN LOCAL SECTOR ALPHA...', 'info');
      setTimeout(() => addLog('NODE_0x1A4F: RESPONDING ON CH-01 [915.2 MHz] (12ms)', 'success'), 200);
      setTimeout(() => addLog('NODE_0x2B9E: RESPONDING ON CH-06 [915.4 MHz] (18ms)', 'success'), 400);
      setTimeout(() => addLog('NODE_0x3C8D: RESPONDING ON CH-11 [915.6 MHz] (14ms)', 'success'), 600);
      setTimeout(() => addLog('MESH TRANSCEIVER CHANNELS SECURED. TOTAL SYNCED: 4/4', 'success'), 800);
    } else if (cmd === 'locate') {
      addLog('TRIANGULATING Morse SOS RF Signals...', 'info');
      addLog('RESOLVING BIO-SIGNATURE VECTOR FROM SENSOR APEX...', 'info');

      // Jitter a fresh fix off the base point each time so repeated `locate`
      // calls plot distinct points on the Tactical Map instead of stacking
      // one coordinate — reads as multiple triangulation passes drifting
      // toward the actual signal source.
      const dLat = (Math.random() - 0.5) * 2 * LOCATE_JITTER_DEG;
      const dLng = (Math.random() - 0.5) * 2 * LOCATE_JITTER_DEG;
      const lat = LOCATE_BASE_LAT + dLat;
      const lng = LOCATE_BASE_LNG + dLng;
      const latLabel = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
      const lngLabel = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
      const sector = LOCATE_SECTORS[locateSectorRef.current % LOCATE_SECTORS.length];
      locateSectorRef.current += 1;

      addLog('TARGET BIO-COORDINATE ACQUIRED!', 'success');
      addLog(`COORDINATES: LAT ${latLabel}, LNG ${lngLabel} // SECTOR: ${sector}`, 'success');

      setLocatePins(prev => {
        const pin = {
          id: Date.now() + Math.random(),
          // Map the +/-JITTER_DEG drift onto SVG space (center 100,100, ring radius ~98)
          x: 100 + (dLng / LOCATE_JITTER_DEG) * 82,
          y: 100 - (dLat / LOCATE_JITTER_DEG) * 82,
          lat: latLabel,
          lng: lngLabel,
          sector,
          severity: dataRef.current.message,
          time: getPreciseTime(),
        };
        const next = [...prev, pin];
        return next.length > 10 ? next.slice(next.length - 10) : next;
      });
    } else if (cmd === 'nodes') {
      addLog('NODE DIAGNOSTIC LOG (GRID_ALPHA_POOLS):', 'info');
      addLog('  - NODE_0x1A4F: ONLINE | LNTY: 12ms | RSSI: -54 dBm', 'success');
      addLog('  - NODE_0x2B9E: ONLINE | LNTY: 18ms | RSSI: -62 dBm', 'success');
      addLog('  - NODE_0x3C8D: ONLINE | LNTY: 14ms | RSSI: -48 dBm', 'success');
      addLog('  - NODE_0x4D7C: ONLINE | LNTY: 24ms | RSSI: -68 dBm', 'success');
    } else if (cmd === 'sos') {
      setIsAutoCycle(false);
      setData(prev => ({ ...prev, message: 'SOS', time: getPreciseTime() }));
      addLog('CRITICAL: MANUAL STATE INJECT "SOS" INITIATED', 'error');
      addLog('INITIATING WIDE-AREA EMERGENCY RESCUE PROTOCOLS', 'warning');
      lastMessageRef.current = 'SOS';
    } else if (cmd === 'ok') {
      setIsAutoCycle(false);
      setData(prev => ({ ...prev, message: 'OK', time: getPreciseTime() }));
      addLog('RESTORE CODE CONFIRMED. CANCELING BEACONS.', 'success');
      addLog('SYSTEM NOMINAL PROTOCOL RESTORED BY CLI COMMANDER', 'success');
      lastMessageRef.current = 'OK';
    } else if (cmd === 'version') {
      addLog('GHOSTLINK X PROTOCOL SUITE // CLIENT v2.4.8-STABLE', 'success');
      addLog('COMPATIBLE DEVICES: ESP8266 / ESP32 / ARDUINO UNO MESH RF', 'info');
    } else {
      addLog(`SYNTAX ERROR: COMMAND "${rawCmd.toUpperCase()}" NOT FOUND`, 'error');
      addLog('ENTER "HELP" FOR VALID SECURITY CLIENT COMMANDS', 'info');
    }
  }, [addLog]);

  return (
    <div className="min-h-screen text-steel-200 font-mono bg-[#05080F] relative pb-12 overflow-x-hidden">

      {/* Consolidated 3D background (Globe + Particles) */}
      <GlobalBackground3D />

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-50 flex items-center justify-center min-h-screen"
          >
            <AdminLogin onAuthenticated={handleAuthenticated} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="relative z-10 w-full flex flex-col"
          >
            <Suspense fallback={<DashboardLoading />}>
              <Dashboard
                data={data}
                logs={logs}
                locatePins={locatePins}
                isDemoMode={isDemoMode}
                isAutoCycle={isAutoCycle}
                setIsAutoCycle={setIsAutoCycle}
                piConnected={piConnected}
                operatorName={operatorName}
                onLogout={handleLogout}
                onAlertChange={handleAlertChange}
                onExecuteCommand={handleExecuteCommand}
                onClearLogs={handleClearLogs}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
