'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function LuxuryCasinoEnvironment() {
  const chandelierRef = useRef<THREE.Group>(null)
  const crystalRefs = useRef<THREE.Mesh[]>([])

  // Chandelier rotation animation
  useFrame((state) => {
    if (chandelierRef.current) {
      chandelierRef.current.rotation.y += 0.002
    }
    
    // Crystal sparkle effect
    crystalRefs.current.forEach((crystal, index) => {
      if (crystal) {
        const time = state.clock.elapsedTime
        const sparkle = Math.sin(time * 2 + index * 0.5) * 0.5 + 0.5
        crystal.material.emissiveIntensity = sparkle * 0.3
      }
    })
  })

  return (
    <group>
      {/* Red Carpet Floor */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          color="#8B0000" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Elegant Pattern on Carpet */}
      <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial 
          color="#B22222" 
          transparent 
          opacity={0.7}
          roughness={0.8}
        />
      </mesh>

      {/* Marble Walls */}
      {/* Back Wall */}
      <mesh position={[0, 4, -12]} receiveShadow>
        <planeGeometry args={[30, 8]} />
        <meshStandardMaterial 
          color="#F5F5DC" 
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Side Walls */}
      <mesh position={[-15, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[24, 8]} />
        <meshStandardMaterial 
          color="#F5F5DC" 
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      
      <mesh position={[15, 4, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[24, 8]} />
        <meshStandardMaterial 
          color="#F5F5DC" 
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Ornate Ceiling */}
      <mesh position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 24]} />
        <meshStandardMaterial 
          color="#2F1B14" 
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Marble Columns */}
      {([
        [-10, 4, -8],
        [10, 4, -8],
        [-10, 4, 8],
        [10, 4, 8],
        [-10, 4, 0],
        [10, 4, 0]
      ] as [number, number, number][]).map((pos, i) => (
        <group key={i} position={pos}>
          {/* Column Base */}
          <mesh position={[0, -3.5, 0]} castShadow>
            <cylinderGeometry args={[0.8, 1, 1, 16]} />
            <meshStandardMaterial 
              color="#F5F5DC" 
              roughness={0.1}
              metalness={0.3}
            />
          </mesh>
          
          {/* Column Shaft */}
          <mesh position={[0, -1, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 6, 16]} />
            <meshStandardMaterial 
              color="#F8F8FF" 
              roughness={0.05}
              metalness={0.4}
            />
          </mesh>
          
          {/* Column Capital */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[1, 0.6, 1, 16]} />
            <meshStandardMaterial 
              color="#F5F5DC" 
              roughness={0.1}
              metalness={0.3}
            />
          </mesh>
          
          {/* Gold Details */}
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.65, 0.65, 0.2, 16]} />
            <meshStandardMaterial 
              color="#FFD700" 
              roughness={0.1}
              metalness={0.9}
              emissive="#B8860B"
              emissiveIntensity={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Grand Crystal Chandeliers */}
      <group ref={chandelierRef} position={[0, 6.5, 0]}>
        {/* Main Chandelier Structure */}
        <mesh castShadow>
          <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
          <meshStandardMaterial 
            color="#FFD700" 
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        {/* Chandelier Arms */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const radius = 2
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          
          return (
            <group key={i} position={[x, 0, z]} rotation={[0, angle, 0]}>
              {/* Arm */}
              <mesh position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
                <meshStandardMaterial 
                  color="#FFD700" 
                  roughness={0.1}
                  metalness={0.9}
                />
              </mesh>
              
              {/* Crystal Drops */}
              {Array.from({ length: 12 }).map((_, j) => (
                <mesh 
                  key={j}
                  ref={(el) => {
                    if (el) crystalRefs.current[i * 12 + j] = el
                  }}
                  position={[0, -0.8 - j * 0.1, Math.random() * 0.4 - 0.2]} 
                  castShadow
                >
                  <octahedronGeometry args={[0.03, 0]} />
                  <meshStandardMaterial 
                    color="#FFFFFF" 
                    roughness={0}
                    metalness={0.1}
                    transparent
                    opacity={0.9}
                    emissive="#FFD700"
                    emissiveIntensity={0.1}
                  />
                </mesh>
              ))}
            </group>
          )
        })}
      </group>

      {/* Smaller Side Chandeliers */}
      {([
        [-8, 5.5, -6],
        [8, 5.5, -6],
        [-8, 5.5, 6],
        [8, 5.5, 6]
      ] as [number, number, number][]).map((pos, i) => (
        <group key={i} position={pos}>
          <mesh castShadow>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial 
              color="#FFD700" 
              roughness={0.1}
              metalness={0.9}
              emissive="#B8860B"
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Crystal decorations */}
          {Array.from({ length: 20 }).map((_, j) => {
            const phi = Math.acos(-1 + (2 * j) / 20)
            const theta = Math.sqrt(20 * Math.PI) * phi
            const x = 1.2 * Math.cos(theta) * Math.sin(phi)
            const y = 1.2 * Math.sin(theta) * Math.sin(phi)
            const z = 1.2 * Math.cos(phi)
            
            return (
              <mesh key={j} position={[x, y, z]} castShadow>
                <octahedronGeometry args={[0.02, 0]} />
                <meshStandardMaterial 
                  color="#FFFFFF" 
                  roughness={0}
                  metalness={0.1}
                  transparent
                  opacity={0.8}
                  emissive="#FFD700"
                  emissiveIntensity={0.15}
                />
              </mesh>
            )
          })}
        </group>
      ))}

      {/* Red Velvet Curtains */}
      {([
        [-14.5, 4, -6],
        [-14.5, 4, 0],
        [-14.5, 4, 6],
        [14.5, 4, -6],
        [14.5, 4, 0],
        [14.5, 4, 6]
      ] as [number, number, number][]).map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <planeGeometry args={[1, 6]} />
          <meshStandardMaterial 
            color="#8B0000" 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Gold Trim Details */}
      {/* Ceiling Moldings */}
      <mesh position={[0, 7.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[12, 0.1, 8, 50]} />
        <meshStandardMaterial 
          color="#FFD700" 
          roughness={0.1}
          metalness={0.9}
          emissive="#B8860B"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Wall Sconces */}
      {([
        [-14, 3, -10],
        [14, 3, -10],
        [-14, 3, 10],
        [14, 3, 10]
      ] as [number, number, number][]).map((pos, i) => (
        <group key={i} position={pos}>
          <mesh castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial 
              color="#FFD700" 
              roughness={0.2}
              metalness={0.8}
              emissive="#FFA500"
              emissiveIntensity={0.3}
            />
          </mesh>
          
          {/* Warm point light */}
          <pointLight 
            intensity={1.2} 
            distance={8}
            color="#FFA500"
            castShadow
          />
        </group>
      ))}

      {/* Luxury Seating Area */}
      {([
        [-6, 0.5, -8],
        [6, 0.5, -8],
        [-6, 0.5, 8],
        [6, 0.5, 8]
      ] as [number, number, number][]).map((pos, i) => (
        <group key={i} position={pos}>
          {/* Chair Base */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.8, 0.6, 0.4, 16]} />
            <meshStandardMaterial 
              color="#8B0000" 
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          
          {/* Chair Back */}
          <mesh position={[0, 0.8, -0.4]} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
            <meshStandardMaterial 
              color="#8B0000" 
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          
          {/* Gold Trim */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <torusGeometry args={[0.7, 0.02, 8, 25]} />
            <meshStandardMaterial 
              color="#FFD700" 
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}