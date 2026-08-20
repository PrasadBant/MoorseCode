import React from 'react';

/**
 * ErrorBoundary.jsx
 * Catches render-time exceptions anywhere below it in the tree and shows a
 * themed fallback instead of letting the whole app unmount to a blank page.
 * React error boundaries must be class components — there's no hook equivalent.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Surface it in the console for diagnostics — no backend to report to.
    console.error('GHOSTLINK X — caught render error:', error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="min-h-screen w-full flex items-center justify-center bg-[#05080F] font-mono px-4"
        style={{ backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(255,59,92,0.07) 0%, transparent 60%)' }}
      >
        <div
          className="relative w-full max-w-md rounded-2xl overflow-hidden text-center px-8 py-10"
          style={{
            background: 'linear-gradient(160deg, rgba(255,59,92,0.04) 0%, rgba(10,14,22,0.96) 100%)',
            border: '1px solid rgba(255,59,92,0.28)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,59,92,0.55), transparent)' }} />

          <span className="text-3xl block mb-3" style={{ color: '#FF3B5C', textShadow: '0 0 10px rgba(255,59,92,0.5)' }}>⚠</span>

          <h1 className="text-[14px] font-bold tracking-wide mb-2" style={{ color: '#FF3B5C' }}>
            System Fault
          </h1>
          <p className="text-[11px] tracking-wide text-steel-400 mb-6 font-sans">
            A component crashed and was contained. This has been logged to the console.
          </p>

          {this.state.error && (
            <pre className="text-left text-[10px] leading-relaxed text-danger-red/70 bg-black/30 border border-danger-red/20 rounded-lg p-3 mb-6 overflow-x-auto max-h-32">
              {String(this.state.error.message || this.state.error)}
            </pre>
          )}

          <button
            onClick={this.handleReset}
            className="text-[11px] font-bold tracking-[0.1em] uppercase px-6 py-3 rounded-lg border transition-colors hover:bg-[rgba(255,59,92,0.14)]"
            style={{ color: '#FF3B5C', borderColor: 'rgba(255,59,92,0.35)', background: 'rgba(255,59,92,0.07)' }}
          >
            Attempt Recovery
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
