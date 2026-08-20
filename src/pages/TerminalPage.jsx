import LiveAlertPanel from '@/components/terminal/LiveAlertPanel';
import RescueTerminal from '@/components/terminal/RescueTerminal';
import TacticalMap from '@/components/terminal/TacticalMap';

/**
 * TerminalPage.jsx — "/terminal"
 * Alert Protocol + Rescue Terminal, kept together on purpose: the
 * terminal's `sos`/`ok`/`help` commands directly drive the alert state
 * shown above it, so seeing both while you type a command is the point —
 * not an arbitrary pairing. The Tactical Map lives here too, for the same
 * reason: it's the visual payoff for the terminal's `locate` command.
 */
const TerminalPage = ({ message, onAlertChange, logs, onExecuteCommand, locatePins }) => (
  <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
    <LiveAlertPanel message={message} onAlertChange={onAlertChange} />
    <RescueTerminal logs={logs} onExecuteCommand={onExecuteCommand} />
    <TacticalMap pins={locatePins} />
  </div>
);

export default TerminalPage;
