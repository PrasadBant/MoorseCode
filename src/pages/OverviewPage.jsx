import Hero from '@/components/overview/Hero';
import LiveStatusPanel from '@/components/overview/LiveStatusPanel';
import Radar3D from '@/components/three/Radar3D';

/**
 * OverviewPage.jsx — "/"
 * The landing page: the hero splash, then the two live sensor readouts
 * that belong together (system diagnostics + the radar sweep that
 * visualizes the same signal). This pairing mirrors the original
 * single-page layout's left column, which is the app's own precedent
 * for what counts as "related."
 */
const OverviewPage = ({ data }) => (
  <>
    <Hero />
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LiveStatusPanel data={data} />
        <Radar3D isSOS={data.message === 'SOS'} />
      </div>
    </div>
  </>
);

export default OverviewPage;
