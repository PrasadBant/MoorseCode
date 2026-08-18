import { HashRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import OverviewPage from '../pages/OverviewPage';
import TerminalPage from '../pages/TerminalPage';
import PipelinePage from '../pages/PipelinePage';
import AuditLogPage from '../pages/AuditLogPage';

/**
 * Dashboard.jsx
 * Everything behind the login gate, loaded via React.lazy so the login
 * screen's initial bundle doesn't include it. Internally it's now a real
 * router — Dashboard/Terminal/Pipeline/Audit Log are separate URLs under
 * a shared layout, not anchors scrolled into view on one long page.
 *
 * HashRouter (not BrowserRouter) is deliberate: it needs zero server
 * config to work, which matters since this is a static Vite build with
 * an unknown hosting target — a bare BrowserRouter would 404 on refresh
 * for any path but "/" unless the host is configured with an SPA
 * rewrite rule.
 */
const Dashboard = ({
  data,
  logs,
  isDemoMode,
  isAutoCycle,
  setIsAutoCycle,
  piConnected,
  operatorName,
  onLogout,
  onAlertChange,
  onExecuteCommand,
  onClearLogs,
}) => (
  <HashRouter>
    <Routes>
      <Route
        element={
          <DashboardLayout
            message={data.message}
            isDemoMode={isDemoMode}
            isAutoCycle={isAutoCycle}
            setIsAutoCycle={setIsAutoCycle}
            piConnected={piConnected}
            operatorName={operatorName}
            onLogout={onLogout}
          />
        }
      >
        <Route index element={<OverviewPage data={data} />} />
        <Route
          path="terminal"
          element={
            <TerminalPage
              message={data.message}
              onAlertChange={onAlertChange}
              logs={logs}
              onExecuteCommand={onExecuteCommand}
            />
          }
        />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="audit" element={<AuditLogPage logs={logs} onClear={onClearLogs} />} />
      </Route>
    </Routes>
  </HashRouter>
);

export default Dashboard;
