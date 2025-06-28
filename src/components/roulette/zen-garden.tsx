'use client'

import { useTexture } from "@react-three/drei"
import { useRef } from "react"
import * as THREE from "three"

export function ZenGarden() {
  const textures = useTexture({
    map: "/sand.jpg",
    normalMap: "/sand_normal.jpg",
    roughnessMap: "/sand_roughness.jpg",
    aoMap: "/sand_ao.jpg",
  })

  return (
    <group>
      {/* Sand floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          {...textures} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Zen rocks scattered around */}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 40
        const z = (Math.random() - 0.5) * 40
        const scale = 0.3 + Math.random() * 0.7
        
        return (
          <mesh 
            key={i}
            position={[x, 0, z]} 
            scale={[scale, scale * 0.6, scale]}
            castShadow
          >
            <sphereGeometry args={[0.5, 8, 6]} />
            <meshStandardMaterial 
              color="#4a4a4a" 
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
        )
      })}

      {/* Bamboo fence perimeter */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const radius = 22
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh 
            key={i}
            position={[x, 1.5, z]} 
            rotation={[0, angle, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
            <meshStandardMaterial 
              color="#8B4513" 
              roughness={0.8}
            />
          </mesh>
        )
      })}

      {/* Shoji screens at corners */}
      {[-1, 1].map(x => 
        [-1, 1].map(z => (
          <ShojiScreen 
            key={`${x}-${z}`}
            position={[x * 15, 2.5, z * 15]} 
            rotation={[0, Math.atan2(z, x) + Math.PI, 0]}
          />
        ))
      ).flat()}

      {/* Lanterns for ambient lighting */}
      {([
        [-10, 2, -10],
        [10, 2, -10],
        [-10, 2, 10],
        [10, 2, 10]
      ] as [number, number, number][]).map((pos, i) => (
        <group key={i} position={pos}>
          {/* Lantern post */}
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
            <meshStandardMaterial color="#2F1B14" />
          </mesh>
          {/* Lantern */}
          <mesh position={[0, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.6, 6]} />
            <meshStandardMaterial 
              color="#F5F5DC" 
              transparent 
              opacity={0.8}
              emissive="#FFE4B5"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Soft light */}
          <pointLight 
            position={[0, 1.8, 0]} 
            intensity={0.3} 
            distance={8}
            color="#FFE4B5"
          />
        </group>
      ))}
    </group>
  )
}

function ShojiScreen({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[3, 4, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Paper panels */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.8, 3.8]} />
        <meshStandardMaterial 
          color="#F5F5DC" 
          transparent 
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Grid pattern */}
      {[-0.7, 0, 0.7].map(x => 
        [-1.5, -0.5, 0.5, 1.5].map(y => (
          <mesh key={`${x}-${y}`} position={[x, y, 0.07]}>
            <boxGeometry args={[0.05, 0.05, 0.02]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
        ))
      ).flat()}
    </group>
  )
}