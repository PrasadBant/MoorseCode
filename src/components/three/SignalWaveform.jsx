/**
 * SignalWaveform.jsx
 * A 3D animated sine-wave visualizer showing live signal strength.
 * Used inside the LiveStatusPanel header.
 */
/* eslint-disable react-hooks/immutability --
   `useFrame` runs r3f's own WebGL animation loop, outside React's render
   phase, and mutating the typed-array buffer in place each frame (instead
   of allocating a new one) is the standard react-three-fiber pattern for
   keeping this at 60fps. The React-Compiler-oriented purity/immutability
   rules can't tell that apart from a real render-phase mutation. */
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useInViewport } from '@/hooks/useInViewport';

const Wave = ({ color, amplitude, speed, phaseOffset = 0 }) => {
  const POINTS = 80;

  // Create a static positions buffer, update it in useFrame
  const positions = useMemo(() => new Float32Array(POINTS * 3), []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phaseOffset;
    for (let i = 0; i < POINTS; i++) {
      const x = (i / (POINTS - 1)) * 4 - 2; // -2 to 2
      const y = Math.sin(x * 3 + t) * amplitude * Math.exp(-Math.abs(x) * 0.4);
      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = 0;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <line geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={0.7} />
    </line>
  );
};

const SignalWaveform = ({ isConnected, isSOS }) => {
  const color = isSOS ? '#FF2D55' : isConnected ? '#00E5FF' : '#374151';
  const amplitude = isSOS ? 0.55 : isConnected ? 0.35 : 0.08;
  const containerRef = useRef(null);
  const visible = useInViewport(containerRef);

  return (
    <div ref={containerRef} style={{ width: '100%', height: 56, willChange: 'transform', transform: 'translateZ(0)' }}>
      <Canvas
        dpr={1}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        {/* Primary wave */}
        <Wave color={color} amplitude={amplitude} speed={2.2} phaseOffset={0} />
        {/* Ghost wave slightly behind */}
        <Wave color={color} amplitude={amplitude * 0.5} speed={1.8} phaseOffset={1.2} />
      </Canvas>
    </div>
  );
};

export default SignalWaveform;
