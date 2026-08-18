import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useInViewport } from '../hooks/useInViewport';

// ── Shared Rotation Hook ──
const useRotate = (ref, ry = 0.05, rx = 0.02) => {
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * ry;
    ref.current.rotation.x += delta * rx;
  });
};

// ── Central Globe with Enhanced Visibility ──
const Globe = () => {
  const ref = useRef();
  useRotate(ref);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(2.4, 3), []); // Slightly larger, slightly fewer polys
  return (
    <group ref={ref}>
      {/* Wireframe outer shell */}
      <mesh geometry={geo}>
        <meshBasicMaterial 
          color="#00E5FF" 
          wireframe 
          transparent 
          opacity={0.15} // Increased visibility
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Solid inner core to block lines behind it */}
      <mesh>
        <sphereGeometry args={[2.37, 32, 32]} />
        <meshBasicMaterial color="#050810" />
      </mesh>
    </group>
  );
};

// ── Surface Nodes with Network Connections ──
const NetworkNodes = () => {
  const groupRef = useRef();
  useRotate(groupRef);
  
  const { positions, lineIndices } = useMemo(() => {
    const count = 100; // More nodes for a better network
    const pos = new Float32Array(count * 3);
    const r = 2.43; // Just outside the wireframe
    
    // Generate random points on sphere
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }

    // Connect nearby nodes to form a web
    const indices = [];
    const maxDistSq = 1.2 * 1.2; // Max connection distance squared
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const distSq = dx*dx + dy*dy + dz*dz;
        if (distSq < maxDistSq) {
          indices.push(i, j);
        }
      }
    }
    
    return { positions: pos, lineIndices: new Uint16Array(indices) };
  }, []);

  return (
    <group ref={groupRef}>
      {/* The glowing dots */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={100} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial 
          color="#00E5FF" 
          transparent 
          opacity={0.8} 
          size={0.06} 
          sizeAttenuation 
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* The connecting lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={100} array={positions} itemSize={3} />
          <bufferAttribute attach="index" array={lineIndices} itemSize={1} />
        </bufferGeometry>
        <lineBasicMaterial 
          color="#00E5FF" 
          transparent 
          opacity={0.25} 
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
};

// ── Floating Background Particles ──
const DriftingParticles = () => {
  const ref = useRef();
  const COUNT = 150;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 4;
      vel[i * 3]     = (Math.random() - 0.5) * 0.0015;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.0015;
      vel[i * 3 + 2] = 0;
    }
    return { positions: pos, velocities: vel };
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame(() => {
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     += velocities[i * 3];
      positions[i * 3 + 1] += velocities[i * 3 + 1];
      if (positions[i * 3]     >  12) positions[i * 3]     = -12;
      if (positions[i * 3]     < -12) positions[i * 3]     =  12;
      if (positions[i * 3 + 1] >   7) positions[i * 3 + 1] =  -7;
      if (positions[i * 3 + 1] <  -7) positions[i * 3 + 1] =   7;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial 
        color="#00E5FF" 
        transparent 
        opacity={0.2} 
        size={0.05} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const GlobalBackground3D = () => {
  // This is `position: fixed` covering the full viewport, so scroll-based
  // visibility never changes — but the tab-visibility half of the hook still
  // pauses the render loop (and its GPU/battery cost) whenever the tab is
  // backgrounded/minimized.
  const containerRef = useRef(null);
  const visible = useInViewport(containerRef);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        // A soft radial gradient that fades out the edges so the UI pops more
        maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)'
      }}
    >
      <Canvas
        dpr={1} // Lock to 1 for high performance
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0, 8.5], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Globe Group */}
          <Globe />
          <NetworkNodes />
          {/* Particle Group */}
          <DriftingParticles />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default React.memo(GlobalBackground3D);
