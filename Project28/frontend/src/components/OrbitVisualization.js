import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

const R_EARTH = 6378.137;
const SCALE_FACTOR = 0.0001;

function Earth() {
  const earthRef = useRef();

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#1a365d');
    gradient.addColorStop(0.3, '#2b6cb0');
    gradient.addColorStop(0.5, '#3182ce');
    gradient.addColorStop(0.7, '#2b6cb0');
    gradient.addColorStop(1, '#1a365d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = '#2f855a';
    ctx.beginPath();
    ctx.ellipse(100, 80, 60, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(380, 100, 50, 35, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(250, 150, 40, 25, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * 512,
        Math.random() * 256,
        20 + Math.random() * 30,
        8 + Math.random() * 15,
        Math.random() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[R_EARTH * SCALE_FACTOR, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

function OrbitPath({ positions, color }) {
  const points = useMemo(() => {
    return positions.map(pos => new THREE.Vector3(
      pos.position_x * SCALE_FACTOR,
      pos.position_z * SCALE_FACTOR,
      pos.position_y * SCALE_FACTOR
    ));
  }, [positions]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [points]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} linewidth={1} />
    </line>
  );
}

function Satellite({ position, name, color }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const scaledPos = useMemo(() => {
    return new THREE.Vector3(
      position.x * SCALE_FACTOR,
      position.z * SCALE_FACTOR,
      position.y * SCALE_FACTOR
    );
  }, [position]);

  return (
    <group position={scaledPos}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>

      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[0.2, 0.01, 0.1]} />
        <meshStandardMaterial color="#1890ff" />
      </mesh>
      <mesh position={[-0.2, 0, 0]}>
        <boxGeometry args={[0.2, 0.01, 0.1]} />
        <meshStandardMaterial color="#1890ff" />
      </mesh>

      {hovered && (
        <Html center distanceFactor={10}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}>
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}

function AnimatedSatellite({ positions, name, color, speed = 1 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const startTime = useRef(Date.now());

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) * speed / 1000;
    const index = Math.floor((elapsed * 10) % positions.length);
    setCurrentIndex(index);
  });

  if (positions.length === 0) return null;

  const pos = positions[currentIndex];
  return (
    <>
      <Satellite
        position={{ x: pos.position_x, y: pos.position_y, z: pos.position_z }}
        name={name}
        color={color}
      />
      <OrbitPath positions={positions} color={color} />
    </>
  );
}

function Scene({ satellitesData, isPlaying, speed }) {
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da'];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <Earth />

      {satellitesData.map((sat, index) => (
        <AnimatedSatellite
          key={sat.name || index}
          positions={sat.positions || []}
          name={sat.name || `卫星 ${index + 1}`}
          color={colors[index % colors.length]}
          speed={isPlaying ? speed : 0}
        />
      ))}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={0.5}
        maxDistance={100}
      />
    </>
  );
}

const OrbitVisualization = ({ satellitesData = [], isPlaying = true, speed = 1 }) => {
  return (
    <div className="simulation-canvas">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ background: '#000' }}
      >
        <Scene satellitesData={satellitesData} isPlaying={isPlaying} speed={speed} />
      </Canvas>
    </div>
  );
};

export default OrbitVisualization;
