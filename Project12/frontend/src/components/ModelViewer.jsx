import React, { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'

function Model({ url, format }) {
  const meshRef = useRef()
  
  try {
    let geometry
    
    if (format === 'gltf' || format === 'glb') {
      const gltf = useLoader(GLTFLoader, url)
      return (
        <group ref={meshRef}>
          <primitive object={gltf.scene} />
        </group>
      )
    } else if (format === 'obj') {
      const obj = useLoader(OBJLoader, url)
      return (
        <group ref={meshRef}>
          <primitive object={obj} />
        </group>
      )
    } else if (format === 'fbx') {
      const fbx = useLoader(FBXLoader, url)
      return (
        <group ref={meshRef}>
          <primitive object={fbx} />
        </group>
      )
    } else if (format === 'stl') {
      geometry = useLoader(STLLoader, url)
    } else if (format === 'ply') {
      geometry = useLoader(PLYLoader, url)
    } else {
      return null
    }

    if (geometry) {
      geometry.computeVertexNormals()
      const material = new THREE.MeshStandardMaterial({
        color: '#b8860b',
        metalness: 0.8,
        roughness: 0.3
      })
      return (
        <mesh ref={meshRef} geometry={geometry} material={material} />
      )
    }
  } catch (error) {
    console.error('Model loading error:', error)
    return null
  }
}

function DefaultModel() {
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#d97706" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 0.4, 32]} />
        <meshStandardMaterial color="#b45309" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#92400e" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

export default function ModelViewer({ modelUrl, format, textureUrl }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const supportedFormats = ['glb', 'gltf', 'obj', 'fbx', 'stl', 'ply']
  const isSupported = format && supportedFormats.includes(format.toLowerCase())

  return (
    <div className="model-viewer-container">
      {modelUrl && isSupported ? (
        <Canvas
          camera={{ position: [5, 3, 5], fov: 50 }}
          shadows
          onCreated={() => setLoading(false)}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <Suspense fallback={
            <Html center>
              <div style={{ color: 'white' }}>加载中...</div>
            </Html>
          }>
            <Model url={modelUrl} format={format.toLowerCase()} />
          </Suspense>
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.5}
            scale={10}
            blur={2}
            far={4}
          />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={20}
          />
          <Environment preset="studio" />
        </Canvas>
      ) : (
        <div className="model-viewer-placeholder">
          <div className="icon">🏺</div>
          <p>{modelUrl ? '暂不支持的模型格式' : '暂无3D模型数据'}</p>
          <p style={{ fontSize: 12, marginTop: 8 }}>
            支持格式: GLB, GLTF, OBJ, FBX, STL, PLY
          </p>
        </div>
      )}
    </div>
  )
}
