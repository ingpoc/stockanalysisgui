'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

export function HyperRealisticCasino() {
  const groupRef = useRef<THREE.Group>(null)
  
  // Create procedural textures for realistic materials
  const createCarpetTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    // Deep red base
    ctx.fillStyle = '#8B0000'
    ctx.fillRect(0, 0, 512, 512)
    
    // Add carpet fiber texture
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const alpha = Math.random() * 0.3
      ctx.fillStyle = `rgba(139, 69, 19, ${alpha})`
      ctx.fillRect(x, y, 1, 1)
    }
    
    // Add golden pattern
    ctx.strokeStyle = '#DAA520'
    ctx.lineWidth = 2
    for (let x = 0; x < 512; x += 64) {
      for (let y = 0; y < 512; y += 64) {
        ctx.beginPath()
        ctx.arc(x + 32, y + 32, 20, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    
    return new THREE.CanvasTexture(canvas)
  }
  
  const createWoodTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    // Wood grain base
    const gradient = ctx.createLinearGradient(0, 0, 512, 0)
    gradient.addColorStop(0, '#8B4513')
    gradient.addColorStop(0.3, '#A0522D')
    gradient.addColorStop(0.7, '#8B4513')
    gradient.addColorStop(1, '#654321')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
    
    // Add wood grain lines
    for (let i = 0; i < 50; i++) {
      const y = (i / 50) * 512
      ctx.strokeStyle = `rgba(101, 67, 33, ${Math.random() * 0.5 + 0.3})`
      ctx.lineWidth = Math.random() * 3 + 1
      ctx.beginPath()
      ctx.moveTo(0, y + Math.sin(y * 0.02) * 10)
      ctx.lineTo(512, y + Math.sin((y + 100) * 0.02) * 10)
      ctx.stroke()
    }
    
    return new THREE.CanvasTexture(canvas)
  }
  
  const createMarbleTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    // Marble base
    ctx.fillStyle = '#F5F5DC'
    ctx.fillRect(0, 0, 512, 512)
    
    // Add marble veins
    for (let i = 0; i < 20; i++) {
      ctx.strokeStyle = `rgba(169, 169, 169, ${Math.random() * 0.4 + 0.1})`
      ctx.lineWidth = Math.random() * 4 + 1
      ctx.beginPath()
      ctx.moveTo(Math.random() * 512, Math.random() * 512)
      
      for (let j = 0; j < 10; j++) {
        ctx.lineTo(
          Math.random() * 512,
          Math.random() * 512
        )
      }
      ctx.stroke()
    }
    
    return new THREE.CanvasTexture(canvas)
  }
  
  const createFeltTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    
    // Green felt base
    ctx.fillStyle = '#0F4C3A'
    ctx.fillRect(0, 0, 256, 256)
    
    // Add felt fiber texture
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const brightness = Math.random() * 0.2 + 0.8
      ctx.fillStyle = `rgba(${15 * brightness}, ${76 * brightness}, ${58 * brightness}, 0.8)`
      ctx.fillRect(x, y, 1, 1)
    }
    
    return new THREE.CanvasTexture(canvas)
  }
  
  const carpetTexture = useMemo(() => createCarpetTexture(), [])
  const woodTexture = useMemo(() => createWoodTexture(), [])
  const marbleTexture = useMemo(() => createMarbleTexture(), [])
  const feltTexture = useMemo(() => createFeltTexture(), [])
  
  // Set texture properties
  carpetTexture.wrapS = carpetTexture.wrapT = THREE.RepeatWrapping
  carpetTexture.repeat.set(4, 4)
  
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping
  woodTexture.repeat.set(2, 2)
  
  marbleTexture.wrapS = marbleTexture.wrapT = THREE.RepeatWrapping
  marbleTexture.repeat.set(1, 1)
  
  feltTexture.wrapS = feltTexture.wrapT = THREE.RepeatWrapping
  feltTexture.repeat.set(1, 1)

  return (
    <group ref={groupRef}>
      {/* Realistic Carpet Floor */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30, 64, 64]} />
        <meshStandardMaterial 
          map={carpetTexture}
          roughness={0.9}
          metalness={0.0}
          normalScale={[0.5, 0.5]}
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
        
        {/* Crown molding */}
        <mesh position={[0, 7.8, 0.2]}>
          <boxGeometry args={[30, 0.3, 0.2]} />
          <meshStandardMaterial 
            color="#FFD700"
            roughness={0.2}
            metalness={0.8}
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
                    color="#E6E6FA"
                    roughness={0.3}
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
          
          {/* Gold detailing */}
          <mesh position={[0, 1, 0]}>
            <torusGeometry args={[0.9, 0.08, 8, 32]} />
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

      {/* Ornate Ceiling */}
      <mesh position={[0, 8.5, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 24]} />
        <meshStandardMaterial 
          color="#2F1B14"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Ceiling Coffers */}
      {Array.from({ length: 5 }).map((_, i) =>
        Array.from({ length: 4 }).map((_, j) => (
          <mesh 
            key={`${i}-${j}`}
            position={[-12 + i * 6, 8.3, -9 + j * 6]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[4, 4]} />
            <meshStandardMaterial 
              color="#1A0E08"
              roughness={0.8}
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

      {/* Brass Separator */}
      <mesh position={[0, 0.7, 0]}>
        <torusGeometry args={[2.8, 0.03, 8, 32]} />
        <meshStandardMaterial 
          color="#B8860B"
          roughness={0.1}
          metalness={0.9}
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
      {/* Central Hub */}
      <mesh castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color="#FFD700"
          roughness={0.1}
          metalness={0.9}
          emissive="#B8860B"
          emissiveIntensity={0.2}
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
                color="#FFD700"
                roughness={0.1}
                metalness={0.9}
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
      {/* Chair Base with Tufted Leather */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.7, 0.3, 32]} />
        <meshStandardMaterial 
          color="#8B0000"
          roughness={0.4}
          metalness={0.0}
        />
      </mesh>
      
      {/* Backrest */}
      <mesh position={[0, 1.2, -0.5]} castShadow>
        <boxGeometry args={[1.4, 1.2, 0.2]} />
        <meshStandardMaterial 
          color="#8B0000"
          roughness={0.4}
          metalness={0.0}
        />
      </mesh>
      
      {/* Gold Studs */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 0.6
        const z = Math.sin(angle) * 0.6
        return (
          <mesh key={i} position={[x, 0.4, z]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial 
              color="#FFD700"
              roughness={0.1}
              metalness={0.9}
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
            color="#654321"
            roughness={0.6}
            metalness={0.0}
          />
        </mesh>
      ))}
    </group>
  )
}