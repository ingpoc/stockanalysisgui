'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

export function HyperRealisticCasino() {
  const groupRef = useRef<THREE.Group>(null)
  
  // Create procedural textures for realistic materials
  const createModernFloorTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    // Light gray base with subtle texture
    ctx.fillStyle = '#F8F9FA'
    ctx.fillRect(0, 0, 512, 512)
    
    // Add subtle marble-like veining
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const alpha = Math.random() * 0.1 + 0.05
      ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`
      ctx.fillRect(x, y, 2, 2)
    }
    
    // Add geometric pattern in light gray
    ctx.strokeStyle = '#E9ECEF'
    ctx.lineWidth = 1
    for (let x = 0; x < 512; x += 64) {
      for (let y = 0; y < 512; y += 64) {
        ctx.beginPath()
        ctx.rect(x + 8, y + 8, 48, 48)
        ctx.stroke()
      }
    }
    
    return new THREE.CanvasTexture(canvas)
  }
  
  const createModernWoodTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    // Light wood base with contemporary feel
    const gradient = ctx.createLinearGradient(0, 0, 512, 0)
    gradient.addColorStop(0, '#F5F5F5')
    gradient.addColorStop(0.3, '#E8E8E8')
    gradient.addColorStop(0.7, '#F0F0F0')
    gradient.addColorStop(1, '#DCDCDC')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
    
    // Add subtle wood grain lines
    for (let i = 0; i < 30; i++) {
      const y = (i / 30) * 512
      ctx.strokeStyle = `rgba(180, 180, 180, ${Math.random() * 0.3 + 0.1})`
      ctx.lineWidth = Math.random() * 2 + 0.5
      ctx.beginPath()
      ctx.moveTo(0, y + Math.sin(y * 0.02) * 5)
      ctx.lineTo(512, y + Math.sin((y + 100) * 0.02) * 5)
      ctx.stroke()
    }
    
    return new THREE.CanvasTexture(canvas)
  }
  
  const createModernMarbleTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    // Pure white marble base
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, 512, 512)
    
    // Add subtle gray veins
    for (let i = 0; i < 15; i++) {
      ctx.strokeStyle = `rgba(200, 200, 200, ${Math.random() * 0.2 + 0.1})`
      ctx.lineWidth = Math.random() * 2 + 1
      ctx.beginPath()
      ctx.moveTo(Math.random() * 512, Math.random() * 512)
      
      for (let j = 0; j < 8; j++) {
        ctx.lineTo(
          Math.random() * 512,
          Math.random() * 512
        )
      }
      ctx.stroke()
    }
    
    return new THREE.CanvasTexture(canvas)
  }
  
  const createModernFeltTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    
    // Sophisticated dark green felt
    ctx.fillStyle = '#1F2937'
    ctx.fillRect(0, 0, 256, 256)
    
    // Add subtle felt fiber texture
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const brightness = Math.random() * 0.2 + 0.8
      ctx.fillStyle = `rgba(${31 * brightness}, ${41 * brightness}, ${55 * brightness}, 0.6)`
      ctx.fillRect(x, y, 1, 1)
    }
    
    return new THREE.CanvasTexture(canvas)
  }
  
  const floorTexture = useMemo(() => createModernFloorTexture(), [])
  const woodTexture = useMemo(() => createModernWoodTexture(), [])
  const marbleTexture = useMemo(() => createModernMarbleTexture(), [])
  const feltTexture = useMemo(() => createModernFeltTexture(), [])
  
  // Set texture properties
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
  floorTexture.repeat.set(4, 4)
  
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping
  woodTexture.repeat.set(2, 2)
  
  marbleTexture.wrapS = marbleTexture.wrapT = THREE.RepeatWrapping
  marbleTexture.repeat.set(1, 1)
  
  feltTexture.wrapS = feltTexture.wrapT = THREE.RepeatWrapping
  feltTexture.repeat.set(1, 1)

  return (
    <group ref={groupRef}>
      {/* Modern Floor */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30, 64, 64]} />
        <meshStandardMaterial 
          map={floorTexture}
          roughness={0.1}
          metalness={0.0}
          normalScale={[0.2, 0.2]}
        />
      </mesh>

      {/* Ornate Walls with Realistic Materials */}
      {/* Back Wall with Wainscoting */}
      <group position={[0, 0, -12]}>
        {/* Lower wood paneling */}
        <mesh position={[0, 1.5, 0.1]} receiveShadow>
          <planeGeometry args={[30, 3]} />
          <meshStandardMaterial 
            map={woodTexture}
            roughness={0.3}
            metalness={0.0}
          />
        </mesh>
        
        {/* Upper marble wall */}
        <mesh position={[0, 5, 0]} receiveShadow>
          <planeGeometry args={[30, 6]} />
          <meshStandardMaterial 
            map={marbleTexture}
            roughness={0.1}
            metalness={0.0}
          />
        </mesh>
        
        {/* Modern trim */}
        <mesh position={[0, 7.8, 0.2]}>
          <boxGeometry args={[30, 0.3, 0.2]} />
          <meshStandardMaterial 
            color="#E5E7EB"
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* Side Walls */}
      {[-15, 15].map((x, index) => (
        <group key={index} position={[x, 0, 0]} rotation={[0, x > 0 ? -Math.PI/2 : Math.PI/2, 0]}>
          <mesh position={[0, 1.5, 0.1]} receiveShadow>
            <planeGeometry args={[24, 3]} />
            <meshStandardMaterial 
              map={woodTexture}
              roughness={0.3}
              metalness={0.0}
            />
          </mesh>
          
          <mesh position={[0, 5, 0]} receiveShadow>
            <planeGeometry args={[24, 6]} />
            <meshStandardMaterial 
              map={marbleTexture}
              roughness={0.1}
              metalness={0.0}
            />
          </mesh>
        </group>
      ))}

      {/* Realistic Marble Columns with Detailed Architecture */}
      {([
        [-10, 4, -8], [10, 4, -8],
        [-10, 4, 0], [10, 4, 0],
        [-10, 4, 8], [10, 4, 8]
      ] as [number, number, number][]).map((pos, i) => (
        <group key={i} position={pos}>
          {/* Detailed Column Base */}
          <mesh position={[0, -3.5, 0]} castShadow>
            <cylinderGeometry args={[1.2, 1.4, 0.8, 16]} />
            <meshStandardMaterial 
              map={marbleTexture}
              roughness={0.1}
              metalness={0.0}
            />
          </mesh>
          
          {/* Column Shaft with Fluting */}
          <group position={[0, -1, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.8, 0.8, 6, 24]} />
              <meshStandardMaterial 
                map={marbleTexture}
                roughness={0.05}
                metalness={0.0}
              />
            </mesh>
            
            {/* Fluting details */}
            {Array.from({ length: 12 }).map((_, j) => {
              const angle = (j / 12) * Math.PI * 2
              const x = Math.cos(angle) * 0.85
              const z = Math.sin(angle) * 0.85
              return (
                <mesh key={j} position={[x, 0, z]} rotation={[0, angle, 0]}>
                  <boxGeometry args={[0.1, 6, 0.05]} />
                  <meshStandardMaterial 
                    color="#F8FAFC"
                    roughness={0.1}
                    metalness={0.0}
                  />
                </mesh>
              )
            })}
          </group>
          
          {/* Ornate Capital */}
          <mesh position={[0, 2.8, 0]} castShadow>
            <cylinderGeometry args={[1.3, 0.8, 0.8, 16]} />
            <meshStandardMaterial 
              map={marbleTexture}
              roughness={0.1}
              metalness={0.0}
            />
          </mesh>
          
          {/* Modern accent ring */}
          <mesh position={[0, 1, 0]}>
            <torusGeometry args={[0.9, 0.08, 8, 32]} />
            <meshStandardMaterial 
              color="#9CA3AF"
              roughness={0.1}
              metalness={0.8}
              emissive="#6B7280"
              emissiveIntensity={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Hyper-Realistic Roulette Table */}
      <RealisticRouletteTable 
        feltTexture={feltTexture}
        woodTexture={woodTexture}
      />

      {/* Grand Crystal Chandelier with Realistic Details */}
      <RealisticChandelier />

      {/* Luxurious Seating Areas */}
      {([
        [-8, 0, -8], [8, 0, -8],
        [-8, 0, 8], [8, 0, 8]
      ] as [number, number, number][]).map((pos, i) => (
        <RealisticChair key={i} position={pos} />
      ))}

      {/* Modern Ceiling */}
      <mesh position={[0, 8.5, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 24]} />
        <meshStandardMaterial 
          color="#F9FAFB"
          roughness={0.1}
          metalness={0.0}
        />
      </mesh>

      {/* Modern Ceiling Recesses */}
      {Array.from({ length: 5 }).map((_, i) =>
        Array.from({ length: 4 }).map((_, j) => (
          <mesh 
            key={`${i}-${j}`}
            position={[-12 + i * 6, 8.3, -9 + j * 6]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[4, 4]} />
            <meshStandardMaterial 
              color="#F3F4F6"
              roughness={0.1}
              metalness={0.0}
            />
          </mesh>
        ))
      )}
    </group>
  )
}

function RealisticRouletteTable({ feltTexture, woodTexture }: { 
  feltTexture: THREE.Texture, 
  woodTexture: THREE.Texture 
}) {
  return (
    <group position={[0, 0, 0]}>
      {/* Table Legs with Realistic Wood */}
      {([
        [-2.5, -0.5, -2.5], [2.5, -0.5, -2.5],
        [-2.5, -0.5, 2.5], [2.5, -0.5, 2.5]
      ] as [number, number, number][]).map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 1, 16]} />
          <meshStandardMaterial 
            map={woodTexture}
            roughness={0.4}
            metalness={0.0}
          />
        </mesh>
      ))}

      {/* Main Table Surface */}
      <mesh position={[0, 0.5, 0]} receiveShadow>
        <cylinderGeometry args={[4.2, 4.2, 0.15, 64]} />
        <meshStandardMaterial 
          map={woodTexture}
          roughness={0.3}
          metalness={0.0}
        />
      </mesh>

      {/* Felt Playing Surface */}
      <mesh position={[0, 0.58, 0]} receiveShadow>
        <cylinderGeometry args={[4, 4, 0.02, 64]} />
        <meshStandardMaterial 
          map={feltTexture}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Wooden Rim with Details */}
      <mesh position={[0, 0.65, 0]}>
        <torusGeometry args={[4.1, 0.1, 16, 64]} />
        <meshStandardMaterial 
          map={woodTexture}
          roughness={0.2}
          metalness={0.0}
        />
      </mesh>

      {/* Modern Metal Separator */}
      <mesh position={[0, 0.7, 0]}>
        <torusGeometry args={[2.8, 0.03, 8, 32]} />
        <meshStandardMaterial 
          color="#9CA3AF"
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </group>
  )
}

function RealisticChandelier() {
  const chandelierRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (chandelierRef.current) {
      chandelierRef.current.rotation.y += 0.001
    }
  })

  return (
    <group ref={chandelierRef} position={[0, 6.5, 0]}>
      {/* Modern Central Hub */}
      <mesh castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color="#E5E7EB"
          roughness={0.1}
          metalness={0.8}
          emissive="#9CA3AF"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Ornate Arms */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 2.5
        const z = Math.sin(angle) * 2.5
        
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, angle, Math.PI / 12]}>
            {/* Curved Arm */}
            <mesh castShadow>
              <torusGeometry args={[0.8, 0.05, 8, 16]} />
              <meshStandardMaterial 
                color="#D1D5DB"
                roughness={0.1}
                metalness={0.8}
              />
            </mesh>
            
            {/* Crystal Clusters */}
            {Array.from({ length: 15 }).map((_, j) => (
              <mesh 
                key={j}
                position={[
                  Math.random() * 0.6 - 0.3,
                  -1 - Math.random() * 0.8,
                  Math.random() * 0.6 - 0.3
                ]}
                castShadow
              >
                <octahedronGeometry args={[0.04 + Math.random() * 0.02]} />
                <meshStandardMaterial 
                  color="#FFFFFF"
                  roughness={0.0}
                  metalness={0.0}
                  transparent
                  opacity={0.95}
                  envMapIntensity={1.5}
                />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}

function RealisticChair({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Modern Chair Base */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.7, 0.3, 32]} />
        <meshStandardMaterial 
          color="#374151"
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      
      {/* Modern Backrest */}
      <mesh position={[0, 1.2, -0.5]} castShadow>
        <boxGeometry args={[1.4, 1.2, 0.2]} />
        <meshStandardMaterial 
          color="#374151"
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      
      {/* Modern Accent Details */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 0.6
        const z = Math.sin(angle) * 0.6
        return (
          <mesh key={i} position={[x, 0.4, z]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial 
              color="#9CA3AF"
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>
        )
      })}
      
      {/* Wooden Legs */}
      {([
        [-0.5, -0.3, -0.5], [0.5, -0.3, -0.5],
        [-0.5, -0.3, 0.5], [0.5, -0.3, 0.5]
      ] as [number, number, number][]).map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 16]} />
          <meshStandardMaterial 
            color="#D1D5DB"
            roughness={0.2}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}