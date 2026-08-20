import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EventAuditLog = ({ logs, onClear }) => {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Define dynamic severity categorizations (only recomputed when the log list changes)
  // `message`/`time` are defensively coerced to strings — logs restored from
  // localStorage aren't guaranteed to match today's shape (older format, manual edits,
  // corruption), and a bare `log.message.includes(...)` would throw on a malformed entry.
  const categorizedLogs = useMemo(() => logs.map(log => {
    const message = String(log?.message ?? '');
    let severity = 'INFO';
    let category = 'SYSTEM_CORE';

    if (log?.type === 'error' || message.includes('SOS') || message.includes('LOCKDOWN') || message.includes('LOST')) {
      severity = 'CRITICAL';
      category = 'SECURITY';
    } else if (log?.type === 'warning' || message.includes('HELP') || message.includes('BIOMETRIC') || message.includes('FALLBACK')) {
      severity = 'WARNING';
      category = 'TELEMETRY';
    } else if (message.includes('COMMAND') || message.includes('>>') || message.includes('CLI')) {
      severity = 'SUCCESS';
      category = 'USER_CLI';
    } else if (message.includes('INITIALIZATION') || message.includes('HANDSHAKE')) {
      severity = 'SUCCESS';
      category = 'INIT';
    }

    return { ...log, message, time: String(log?.time ?? '--:--:--'), severity, category };
  }), [logs]);

  // Handle local text export of logs
  const handleExportLogs = () => {
    const header = `=====================================================================\n` +
                   `          GHOSTLINK X TACTICAL RESCUE LOG AUDIT REPORT\n` +
                   `          GENERATED: ${new Date().toISOString()}\n` +
                   `=====================================================================\n\n`;
    
    const body = categorizedLogs.map(log => 
      `[${log.time}] [${log.severity.padEnd(8)}] [${log.category.padEnd(12)}] ${log.message}`
    ).join('\n');

    const fullText = header + body + `\n\n========================= END OF AUDIT RECORD =========================`;
    const element = document.createElement("a");
    const file = new Blob([fullText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ghostlinkx_tactical_audit_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Counting severities for badges (single pass instead of four separate filters)
  const { criticalCount, warningCount, successCount, infoCount } = useMemo(() => {
    const counts = { CRITICAL: 0, WARNING: 0, SUCCESS: 0, INFO: 0 };
    for (const log of categorizedLogs) counts[log.severity]++;
    return {
      criticalCount: counts.CRITICAL,
      warningCount: counts.WARNING,
      successCount: counts.SUCCESS,
      infoCount: counts.INFO,
    };
  }, [categorizedLogs]);

  // Filtering based on active criteria
  const filteredLogs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return categorizedLogs.filter(log => {
      const matchesFilter = filter === 'ALL' || log.severity === filter;
      const matchesSearch = log.message.toLowerCase().includes(query) ||
                            log.category.toLowerCase().includes(query) ||
                            log.time.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [categorizedLogs, filter, searchQuery]);

  return (
    <div className="glass-panel p-6 w-full">
      {/* Component Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-steel-800/60 pb-4">
        <div>
          <h3 className="text-steel-50 text-[15px] font-bold tracking-wide flex items-center">
            <span className="relative flex h-2 w-2 mr-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-cyan" style={{ boxShadow: '0 0 6px #00E5FF' }} />
            </span>
            Event Audit Log
          </h3>
          <p className="text-[10px] text-steel-600 tracking-wide mt-1 font-medium uppercase">Real-time operational metrics & system inject timeline</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportLogs}
            className="px-3 py-1.5 border border-steel-800 bg-black/30 text-steel-200 hover:border-neon-cyan/40 hover:text-neon-cyan rounded-md font-mono text-[10px] tracking-wide transition-colors uppercase font-bold"
          >
            Export
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1.5 border border-danger-red/30 bg-danger-red/5 text-danger-red hover:bg-danger-red/15 rounded-md font-mono text-[10px] tracking-wide transition-colors uppercase font-bold"
          >
            Purge
          </button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        {/* Severity Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto font-mono">
          {[
            { id: 'ALL', label: 'All', count: logs.length, color: 'border-steel-800 text-steel-400' },
            { id: 'CRITICAL', label: 'Critical', count: criticalCount, color: 'border-danger-red/30 text-danger-red' },
            { id: 'WARNING', label: 'Warning', count: warningCount, color: 'border-amber-500/30 text-amber-500' },
            { id: 'SUCCESS', label: 'Success', count: successCount, color: 'border-success-green/30 text-success-green' },
            { id: 'INFO', label: 'Info', count: infoCount, color: 'border-sky-500/30 text-sky-400' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-3 py-1 text-[10px] tracking-wide font-bold border rounded-md transition-all flex items-center gap-1.5 uppercase ${
                filter === btn.id
                  ? 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/50'
                  : `bg-black/30 hover:bg-black/50 ${btn.color}`
              }`}
            >
              <span>{btn.label}</span>
              <span className="px-1 rounded text-[8px] bg-black/50 font-semibold">
                {btn.count}
              </span>
            </button>
          ))}
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-64 font-mono">
          <input
            type="text"
            placeholder="Filter by keyword…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/30 text-steel-50 placeholder-steel-600 border border-steel-800 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-neon-cyan/40 tracking-wide"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-steel-600 pointer-events-none">⌕</span>
        </div>
      </div>

      {/* Timeline List Grid */}
      <div className="overflow-x-auto w-full rounded-lg border border-steel-800/60 bg-black/20">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-white/[0.02] text-steel-600 tracking-[0.08em] text-[10px] border-b border-steel-800/60 uppercase font-semibold">
              <th className="py-2.5 px-4 font-semibold">Timestamp</th>
              <th className="py-2.5 px-4 font-semibold">Severity</th>
              <th className="py-2.5 px-4 font-semibold">Source</th>
              <th className="py-2.5 px-4 font-semibold">Event Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-800/40">
            <AnimatePresence initial={false}>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-steel-600 tracking-wide">
                    No diagnostic records match this filter
                  </td>
                </tr>
              ) : (
                filteredLogs.slice().reverse().map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="hover:bg-white/[0.015] transition-colors"
                  >
                    <td className="py-3 px-4 text-steel-600 text-[11px] shrink-0 font-normal">
                      {log.time}
                    </td>
                    <td className="py-3 px-4 shrink-0 font-bold">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] tracking-wide uppercase font-semibold ${
                        log.severity === 'CRITICAL' ? 'bg-danger-red/10 text-danger-red border border-danger-red/30' :
                        log.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' :
                        log.severity === 'SUCCESS' ? 'bg-success-green/10 text-success-green border border-success-green/30' :
                        'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-steel-400 text-[10px] tracking-wide uppercase">
                      {log.category}
                    </td>
                    <td className={`py-3 px-4 font-medium tracking-wide ${
                      log.severity === 'CRITICAL' ? 'text-danger-red font-semibold' :
                      log.severity === 'WARNING' ? 'text-amber-400' : 'text-steel-200'
                    }`}>
                      {log.message}
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Scanlines layer */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.6)_50%)] bg-[length:100%_4px] rounded-xl z-20"></div>
    </div>
  );
};

export default React.memo(EventAuditLog);
