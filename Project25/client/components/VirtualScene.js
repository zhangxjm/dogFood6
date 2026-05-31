import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

function ComponentModel({ component, position, isSelected, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const color = useMemo(() => {
    const colors = {
      resistor: '#f97316',
      battery: '#22c55e',
      switch: '#eab308',
      voltmeter: '#06b6d4',
      ammeter: '#8b5cf6',
      gear: '#64748b',
      shaft: '#94a3b8',
      bearing: '#475569',
      bolt: '#6b7280',
      wrench: '#a855f7',
      beaker: '#38bdf8',
      test_tube: '#0ea5e9',
      bunsen_burner: '#f97316',
      pipette: '#a78bfa',
      flask: '#6366f1',
      plc: '#3b82f6',
      sensor: '#10b981',
      motor: '#6366f1',
      conveyor: '#78716c',
      hmi: '#8b5cf6',
      robot_arm: '#3b82f6',
      gripper: '#ec4899',
      vision_system: '#06b6d4',
      router: '#0ea5e9',
      switch_network: '#6366f1',
      server: '#3b82f6',
      cable: '#78716c',
      pc: '#64748b'
    };
    return colors[component.type] || '#8b5cf6';
  }, [component.type]);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = hovered ? 1.1 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(scale, scale, scale),
        0.1
      );
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.(component);
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        position={[0, 0.5, 0]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.4}
          emissive={isSelected ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
      
      {isSelected && (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
        </mesh>
      )}

      <Html
        position={[0, 1.2, 0]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div className="px-2 py-1 bg-slate-900/90 text-white text-xs rounded whitespace-nowrap">
          {component.name || component.type}
        </div>
      </Html>
    </group>
  );
}

function ConnectionLine({ start, end, isActive }) {
  const points = useMemo(() => {
    return [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  }, [start, end]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [points]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial 
        color={isActive ? '#22c55e' : '#64748b'} 
        linewidth={2}
        transparent
        opacity={isActive ? 1 : 0.5}
      />
    </line>
  );
}

function SceneBackground({ sceneType }) {
  const { scene } = useThree();

  useEffect(() => {
    const backgrounds = {
      lab: '#1e293b',
      workshop: '#3f3f46',
      chem_lab: '#164e63',
      control_room: '#1e1b4b',
      factory: '#27272a',
      robotics_lab: '#0c4a6e',
      server_room: '#18181b'
    };

    scene.background = new THREE.Color(backgrounds[sceneType] || '#0f172a');
  }, [scene, sceneType]);

  return null;
}

function GridFloor() {
  const gridRef = useRef();

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.material.opacity = 0.3;
    }
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.8} />
      </mesh>
      <gridHelper
        ref={gridRef}
        args={[50, 50, '#3b82f6', '#1e293b']}
      />
    </group>
  );
}

function InteractiveScene({ components, connections, selectedComponent, onComponentClick, onSceneClick }) {
  const groupRef = useRef();

  const componentPositions = useMemo(() => {
    const positions = {};
    const spacing = 2.5;
    const cols = Math.ceil(Math.sqrt(components.length));

    components.forEach((component, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      positions[component.id] = [
        (col - cols / 2) * spacing,
        0,
        (row - Math.ceil(components.length / cols) / 2) * spacing
      ];
    });

    return positions;
  }, [components]);

  return (
    <group ref={groupRef} onClick={onSceneClick}>
      {components.map((component) => (
        <ComponentModel
          key={component.id}
          component={component}
          position={componentPositions[component.id]}
          isSelected={selectedComponent?.id === component.id}
          onClick={onComponentClick}
        />
      ))}

      {connections.map((connection, index) => {
        const startPos = componentPositions[connection.from];
        const endPos = componentPositions[connection.to];
        
        if (!startPos || !endPos) return null;

        return (
          <ConnectionLine
            key={index}
            start={[startPos[0], 0.5, startPos[2]]}
            end={[endPos[0], 0.5, endPos[2]]}
            isActive={connection.isActive}
          />
        );
      })}
    </group>
  );
}

export default function VirtualScene({ 
  sceneConfig = {}, 
  components = [], 
  connections = [],
  selectedComponent,
  onComponentClick,
  onSceneClick,
  interactive = true
}) {
  const sceneType = sceneConfig.sceneType || 'lab';
  const sceneComponents = components.length > 0 ? components : [
    { id: '1', type: 'resistor', name: '电阻器' },
    { id: '2', type: 'battery', name: '电池' },
    { id: '3', type: 'switch', name: '开关' },
    { id: '4', type: 'voltmeter', name: '电压表' },
    { id: '5', type: 'ammeter', name: '电流表' }
  ];

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-slate-700/50">
      <Canvas
        shadows
        camera={{ position: [10, 10, 10], fov: 50 }}
      >
        <SceneBackground sceneType={sceneType} />
        
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#8b5cf6" />
        
        <GridFloor />
        
        <InteractiveScene
          components={sceneComponents}
          connections={connections}
          selectedComponent={selectedComponent}
          onComponentClick={onComponentClick}
          onSceneClick={onSceneClick}
        />
        
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.4}
          scale={30}
          blur={2}
          far={4}
        />

        {interactive && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={30}
            maxPolarAngle={Math.PI / 2.1}
          />
        )}
      </Canvas>
    </div>
  );
}
