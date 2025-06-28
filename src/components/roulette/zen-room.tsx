'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function ZenRoom() {
  const roomRef = useRef<THREE.Group>(null)

  // Gentle ambient animation
  useFrame((state) => {
    if (roomRef.current) {
      // Subtle breathing effect for the room
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.3) * 0.002
      roomRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group ref={roomRef}>
      {/* Floor - Traditional wooden floor */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Back wall with moon window */}
      <mesh position={[0, 3, -8]} receiveShadow>
        <planeGeometry args={[20, 6]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>

      {/* Moon window (circular opening) */}
      <mesh position={[0, 4, -7.9]}>
        <circleGeometry args={[1.5, 32]} />
        <meshBasicMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>

      {/* Side walls */}
      <mesh position={[-10, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16, 6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      <mesh position={[10, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16, 6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 16]} />
        <meshStandardMaterial color="#2F2F2F" />
      </mesh>

      {/* Traditional Japanese pillars */}
      {([
        [-8, 3, -6],
        [8, 3, -6],
        [-8, 3, 6],
        [8, 3, 6]
      ] as [number, number, number][]).map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 6, 8]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      ))}

      {/* Bonsai trees in corners */}
      {([
        [-7, 0.5, -6],
        [7, 0.5, -6],
        [-7, 0.5, 6],
        [7, 0.5, 6]
      ] as [number, number, number][]).map((pos, i) => (
        <group key={i} position={pos}>
          {/* Pot */}
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 0.4, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Tree trunk */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.08, 0.8, 6]} />
            <meshStandardMaterial color="#4A4A4A" />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <sphereGeometry args={[0.4, 8, 6]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        </group>
      ))}

      {/* Paper lanterns */}
      {([
        [-4, 5, -4],
        [4, 5, -4],
        [-4, 5, 4],
        [4, 5, 4]
      ] as [number, number, number][]).map((pos, i) => (
        <group key={i} position={pos}>
          {/* Lantern body */}
          <mesh castShadow>
            <sphereGeometry args={[0.3, 8, 6]} />
            <meshStandardMaterial 
              color="#F5F5DC" 
              transparent 
              opacity={0.9}
              emissive="#FFE4B5"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Warm light */}
          <pointLight 
            intensity={0.4} 
            distance={8}
            color="#FFE4B5"
            castShadow
          />
        </group>
      ))}

      {/* Traditional tatami mats around roulette area */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 6
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh 
            key={i}
            position={[x, 0.01, z]} 
            rotation={[-Math.PI / 2, angle, 0]}
          >
            <planeGeometry args={[1.5, 1]} />
            <meshStandardMaterial 
              color="#D2B48C" 
              roughness={0.9}
            />
          </mesh>
        )
      })}

      {/* Zen sand patterns around the room */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2
        const radius = 9 + Math.random() * 2
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh 
            key={i}
            position={[x, 0.005, z]} 
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.3, 16]} />
            <meshStandardMaterial 
              color="#F5F5DC" 
              transparent
              opacity={0.6}
            />
          </mesh>
        )
      })}

      {/* Incense smoke effect (using planes with gradients) */}
      {([
        [-6, 1, -5],
        [6, 1, -5]
      ] as [number, number, number][]).map((pos, i) => (
        <group key={i} position={pos}>
          {Array.from({ length: 5 }).map((_, j) => (
            <mesh 
              key={j}
              position={[0, j * 0.3, 0]}
              rotation={[-Math.PI / 2, 0, j * 0.2]}
            >
              <planeGeometry args={[0.1, 1]} />
              <meshBasicMaterial 
                color="#FFFFFF" 
                transparent 
                opacity={0.1 - j * 0.02}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}