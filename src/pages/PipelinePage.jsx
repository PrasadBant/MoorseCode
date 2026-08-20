import PipelineDiagram from '@/components/pipeline/PipelineDiagram';
import SystemOverview from '@/components/overview/SystemOverview';

/**
 * PipelinePage.jsx — "/pipeline"
 * Both sections here are static reference material about how the system
 * is built — the data flow diagram and the capability cards — rather
 * than live telemetry, so they share a page.
 */
const PipelinePage = () => (
  <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
    <PipelineDiagram />
    <div className="pt-4" style={{ borderTop: '1px solid rgba(169,183,204,0.08)' }}>
      <SystemOverview />
    </div>
  </div>
);

export default PipelinePage;
