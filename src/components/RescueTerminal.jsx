import React, { useState, useEffect, useRef } from 'react';

const LOG_COLORS = {
  error:   { text: '#FF2D55', prefix: '✗' },
  warning: { text: '#F59E0B', prefix: '⚠' },
  success: { text: '#34D399', prefix: '✓' },
  info:    { text: 'rgba(0,229,255,0.75)', prefix: '·' },
};

const SHORTCUTS = [
  { cmd: 'help',   label: 'HELP',         danger: false },
  { cmd: 'status', label: 'STATUS',        danger: false },
  { cmd: 'ping',   label: 'PING',          danger: false },
  { cmd: 'scan',   label: 'SCAN RF',       danger: false },
  { cmd: 'locate', label: 'LOCATE',        danger: false },
  { cmd: 'nodes',  label: 'NODES',         danger: false },
  { cmd: 'sos',    label: '⚠ SOS',         danger: true  },
  { cmd: 'clear',  label: 'CLEAR',         danger: false },
];

const RescueTerminal = ({ logs, onExecuteCommand }) => {
  const [inputVal, setInputVal] = useState('');
  const [focused, setFocused] = useState(false);
  const logContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll only this panel's own log container — never scrollIntoView() on
  // the end marker, since that bubbles up to the *page* scroll too and yanks
  // the whole window back here every time a background log line arrives
  // (Pi polling, demo cycle) even if the operator scrolled away to read
  // something else.
  useEffect(() => {
    const el = logContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;
    onExecuteCommand(cmd);
    setInputVal('');
  };

  return (
    <div
      className="flex flex-col h-[400px] relative overflow-hidden rounded-xl cursor-text"
      style={{
        background: 'linear-gradient(160deg, rgba(8,12,20,0.98) 0%, rgba(4,6,11,0.99) 100%)',
        border: '1px solid rgba(169,183,204,0.12)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.8)',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)' }} />

      {/* CRT scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.06]"
        style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 1px, rgba(0,0,0,1) 1px, rgba(0,0,0,1) 2px)', backgroundSize: '100% 2px' }} />

      {/* Header */}
      <div
        className="flex justify-between items-center px-4 py-3 border-b shrink-0 z-10"
        style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(169,183,204,0.1)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-danger-red/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan/60" style={{ boxShadow: '0 0 4px rgba(0,229,255,0.4)' }} />
          </div>
          <span className="text-[11px] font-bold tracking-wide text-steel-50 font-mono">
            ghostlink@shell
          </span>
        </div>
        <div className="flex gap-4 text-[9px] tracking-wide text-steel-600 font-mono">
          <span>HOST: local_ghost</span>
          <span>BAUD: 115200</span>
        </div>
      </div>

      {/* Shortcut pills */}
      <div
        className="flex flex-wrap gap-1.5 px-4 py-2 border-b shrink-0 z-10"
        style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(169,183,204,0.08)' }}
      >
        <span className="text-[8px] text-steel-600 uppercase tracking-[0.1em] self-center mr-1 font-semibold">Cmd</span>
        {SHORTCUTS.map(({ cmd, label, danger }) => (
          <button
            key={cmd}
            type="button"
            onClick={(e) => { e.stopPropagation(); onExecuteCommand(cmd); }}
            className="text-[9px] px-2 py-0.5 rounded tracking-[0.06em] font-bold uppercase transition-all duration-150 border cursor-pointer"
            style={{
              color: danger ? '#FF3B5C' : '#647089',
              borderColor: danger ? 'rgba(255,59,92,0.22)' : 'rgba(169,183,204,0.14)',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = danger ? 'rgba(255,59,92,0.1)' : 'rgba(0,229,255,0.08)';
              e.currentTarget.style.borderColor = danger ? 'rgba(255,59,92,0.5)' : 'rgba(0,229,255,0.4)';
              e.currentTarget.style.color = danger ? '#FF3B5C' : '#00E5FF';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = danger ? 'rgba(255,59,92,0.22)' : 'rgba(169,183,204,0.14)';
              e.currentTarget.style.color = danger ? '#FF3B5C' : '#647089';
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Log area */}
      <div ref={logContainerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1 z-10 custom-scrollbar">
        {logs.map(log => {
            const style = LOG_COLORS[log.type] || LOG_COLORS.info;
            return (
              <div
                key={log.id}
                className="flex items-start gap-2 text-[11px] font-mono tracking-wide leading-relaxed"
                style={{ opacity: 1 }}
              >
                <span className="shrink-0 w-[88px] text-[10px] opacity-35" style={{ color: style.text }}>
                  [{log.time}]
                </span>
                <span className="shrink-0 text-[10px]" style={{ color: style.text, opacity: 0.7 }}>
                  {style.prefix}
                </span>
                <span
                  className="flex-1 break-all"
                  style={{
                    color: style.text,
                    textShadow: log.type === 'error' ? `0 0 6px ${style.text}60` : 'none',
                    fontWeight: log.type === 'error' ? '700' : '400',
                  }}
                >
                  {log.message}
                </span>
              </div>
            );
          })}
      </div>

      {/* Input prompt */}
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className="flex items-center gap-2 px-4 py-3 border-t shrink-0 z-10"
        style={{
          background: 'rgba(0,0,0,0.5)',
          borderColor: focused ? 'rgba(0,229,255,0.3)' : 'rgba(169,183,204,0.12)',
          transition: 'border-color 0.2s',
        }}
      >
        <span
          className="text-[11px] font-bold shrink-0 select-none font-mono"
          style={{ color: '#00E5FF', textShadow: '0 0 6px rgba(0,229,255,0.5)' }}
        >
          ghostlink-x:~$
        </span>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="type command…"
            className="w-full bg-transparent text-[11px] font-mono focus:outline-none uppercase tracking-wide placeholder-steel-600/60"
            style={{ color: '#00E5FF' }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {inputVal === '' && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[7px] h-[14px] pointer-events-none"
              style={{ background: '#00E5FF', animation: 'pulse 1.1s steps(1) infinite', boxShadow: '0 0 5px rgba(0,229,255,0.8)' }}
            />
          )}
        </div>
        <button
          type="submit"
          className="shrink-0 text-[9px] px-3 py-1.5 font-bold tracking-[0.1em] uppercase transition-all rounded border"
          style={{
            color: '#00E5FF',
            borderColor: 'rgba(0,229,255,0.3)',
            background: 'rgba(0,229,255,0.06)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)'; }}
        >
          EXEC ↵
        </button>
      </form>
    </div>
  );
};

export default React.memo(RescueTerminal);
