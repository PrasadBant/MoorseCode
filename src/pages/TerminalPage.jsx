import LiveAlertPanel from '../components/LiveAlertPanel';
import RescueTerminal from '../components/RescueTerminal';

/**
 * TerminalPage.jsx — "/terminal"
 * Alert Protocol + Rescue Terminal, kept together on purpose: the
 * terminal's `sos`/`ok`/`help` commands directly drive the alert state
 * shown above it, so seeing both while you type a command is the point —
 * not an arbitrary pairing.
 */
const TerminalPage = ({ message, onAlertChange, logs, onExecuteCommand }) => (
  <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
    <LiveAlertPanel message={message} onAlertChange={onAlertChange} />
    <RescueTerminal logs={logs} onExecuteCommand={onExecuteCommand} />
  </div>
);

export default TerminalPage;
