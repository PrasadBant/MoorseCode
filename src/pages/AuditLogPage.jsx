import EventAuditLog from '@/components/audit/EventAuditLog';

/**
 * AuditLogPage.jsx — "/audit"
 * The full event history, on its own page with room to breathe instead
 * of competing for scroll real estate at the bottom of one long page.
 */
const AuditLogPage = ({ logs, onClear }) => (
  <div className="container mx-auto px-4 py-8 max-w-7xl">
    <EventAuditLog logs={logs} onClear={onClear} />
  </div>
);

export default AuditLogPage;
