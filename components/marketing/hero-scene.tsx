'use client'

import { Canvas } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'

export default function HeroScene() {
  return (
    <Canvas
      className="hero-scene-layer"
      style={{ position: 'absolute', inset: 0 }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ alpha: true }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={1.1} />
      <pointLight color="#b4914e" intensity={2.4} position={[3, 2, 4]} />
      <pointLight color="#edf4f1" intensity={1} position={[-2, -1, 3]} />
      <Float speed={1} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh position={[1.1, 0, -1]}>
          <icosahedronGeometry args={[0.95, 1]} />
          <MeshDistortMaterial color="#147d73" distort={0.3} speed={1.5} roughness={0.25} metalness={0.15} />
        </mesh>
      </Float>
    </Canvas>
  )
}
