/**
 * Radar3D.jsx
 * A fully 3D tactical radar rendered with React Three Fiber.
 * Replaces the SVG-based RadarModule for a premium holographic feel.
 */
import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useInViewport } from '@/hooks/useInViewport';

// ── Radar Base Grid (flat rings + spokes) ──────────────────────────────────
const RadarGrid = ({ color }) => {
  const rings = useMemo(() => {
    const geoms = [];
    for (let i = 1; i <= 4; i++) {
      const r = i * 0.5;
      const pts = [];
      for (let a = 0; a <= 64; a++) {
        const theta = (a / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r));
      }
      geoms.push(new THREE.BufferGeometry().setFromPoints(pts));
    }
    return geoms;
  }, []);

  const spokes = useMemo(() => {
    const geoms = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const pts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(a) * 2, 0, Math.sin(a) * 2),
      ];
      geoms.push(new THREE.BufferGeometry().setFromPoints(pts));
    }
    return geoms;
  }, []);

  return (
    <group>
      {rings.map((geo, i) => (
        <line key={`r${i}`} geometry={geo}>
          <lineBasicMaterial color={color} transparent opacity={0.18 + i * 0.04} />
        </line>
      ))}
      {spokes.map((geo, i) => (
        <line key={`s${i}`} geometry={geo}>
          <lineBasicMaterial color={color} transparent opacity={0.1} />
        </line>
      ))}
    </group>
  );
};

// ── Sweep Cone (rotates, fan-shaped) ──────────────────────────────────────
const SweepArm = ({ color, isSOS }) => {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * (isSOS ? 1.8 : 1.1);
  });

  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    const span = Math.PI / 7;
    const r = 2;
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const a = -span / 2 + (i / steps) * span;
      shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    shape.lineTo(0, 0);
    return new THREE.ShapeGeometry(shape);
  }, []);

  return (
    <group ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <mesh geometry={geo}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isSOS ? 0.22 : 0.14}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Bright leading edge */}
      <line>
        <bufferGeometry setFromPoints={[new THREE.Vector3(0,0,0), new THREE.Vector3(2,0,0)]} />
        <lineBasicMaterial color={color} transparent opacity={0.8} />
      </line>
    </group>
  );
};

// ── Blip Sphere ────────────────────────────────────────────────────────────
const BlipSphere = ({ x, z, color, age }) => {
  const ref = useRef();
  const opacity = Math.max(0, 1 - age / 3);
  useFrame(() => {
    if (ref.current) {
      ref.current.material.opacity = Math.max(0, 1 - age / 3);
    }
  });
  return (
    <mesh ref={ref} position={[x, 0.02, z]}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
};

// ── Outer torus border ─────────────────────────────────────────────────────
const Border = ({ color }) => {
  const geo = useMemo(() => new THREE.TorusGeometry(2, 0.012, 6, 80), []);
  return (
    <mesh geometry={geo} rotation={[Math.PI / 2, 0, 0]}>
      <meshBasicMaterial color={color} transparent opacity={0.5} />
    </mesh>
  );
};

// ── Subtle Y-axis rotation of entire scene for depth ─────────────────────
const Scene = ({ isSOS, blips }) => {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle tilt oscillation for holographic feel
      groupRef.current.rotation.x = 0.52 + Math.sin(state.clock.elapsedTime * 0.18) * 0.03;
    }
  });
  const color = isSOS ? '#FF2D55' : '#00E5FF';

  return (
    <group ref={groupRef} rotation={[0.52, 0, 0]}>
      <RadarGrid color={color} />
      <Border color={color} />
      <SweepArm color={color} isSOS={isSOS} />
      {blips.map(b => (
        <BlipSphere key={b.id} x={b.x} z={b.z} color={color} age={b.age} />
      ))}
      {/* Center beacon */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
    </group>
  );
};

// ── Main Export ────────────────────────────────────────────────────────────
const Radar3D = ({ isSOS }) => {
  const [blips, setBlips] = useState([]);
  const containerRef = useRef(null);
  const visible = useInViewport(containerRef);

  // Age out blips and spawn new ones
  useEffect(() => {
    const spawnId = setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 1.55;
      setBlips(prev => [
        ...prev.slice(-5),
        {
          id: Date.now(),
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius,
          age: 0,
        },
      ]);
    }, isSOS ? 700 : 2200);

    const ageId = setInterval(() => {
      setBlips(prev => prev.map(b => ({ ...b, age: b.age + 0.15 })).filter(b => b.age < 3));
    }, 100);

    return () => { clearInterval(spawnId); clearInterval(ageId); };
  }, [isSOS]);

  const G = isSOS ? '#FF2D55' : '#00E5FF';

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(0,229,255,0.02) 0%, rgba(8,11,18,0.98) 100%)',
        border: `1px solid ${isSOS ? `${G}30` : 'rgba(169,183,204,0.1)'}`,
        boxShadow: `0 4px 28px rgba(0,0,0,0.7)${isSOS ? `, 0 0 22px ${G}18` : ''}`,
      }}
    >
      {/* Header */}
      <div className="w-full flex justify-between items-center px-5 py-3 border-b text-[10px] tracking-[0.1em] font-mono font-semibold"
        style={{ borderColor: 'rgba(169,183,204,0.1)', color: G }}>
        <div className="flex items-center gap-2">
          <motion.div className="w-1.5 h-1.5 rounded-full"
            style={{ background: G, boxShadow: `0 0 5px ${G}` }}
            animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
          <span>3D Radar // Omni-Dir 915</span>
        </div>
        <span className="text-steel-600">Rng: 5.0 km</span>
      </div>

      {/* Three.js Canvas */}
      <div className="relative w-full" style={{ height: 300 }}>
        <Canvas
          dpr={1}
          frameloop={visible ? 'always' : 'never'}
          camera={{ position: [0, 3.8, 2.2], fov: 40 }}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.1} />
            <Scene isSOS={isSOS} blips={blips} />
          </Suspense>
        </Canvas>

        {/* Overlay: degree labels in HTML (cheaper than 3D text) */}
        <div className="absolute inset-0 pointer-events-none" style={{ color: G }}>
          <span className="absolute top-3  left-1/2 -translate-x-1/2 text-[9px] font-mono opacity-40">000°</span>
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-mono opacity-40">180°</span>
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-[9px] font-mono opacity-40">270°</span>
          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[9px] font-mono opacity-40">090°</span>
        </div>

        {/* Radial vignette */}
        <div className="absolute inset-0 pointer-events-none rounded-b-xl"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(4,8,16,0.75) 100%)' }} />
      </div>

      {/* Footer */}
      <div className="w-full px-5 py-3 border-t text-[10px] tracking-[0.08em] font-mono flex justify-between font-medium"
        style={{ borderColor: 'rgba(169,183,204,0.1)', color: isSOS ? G : '#647089' }}>
        <span className={isSOS ? 'animate-pulse font-semibold' : ''}>{isSOS ? '⚠ Critical sweep active' : 'Scanning zone alpha'}</span>
        <span className="text-steel-600">ESP-NOW Mesh Active</span>
      </div>
    </div>
  );
};

export default React.memo(Radar3D);
