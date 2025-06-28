'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BeautifulDealerProps {
  position: [number, number, number]
  animation?: 'idle' | 'spinning' | 'throwing'
}

export function BeautifulDealer({ position, animation = 'idle' }: BeautifulDealerProps) {
  const dealerRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const eyesRef = useRef<THREE.Group>(null)
  const hairRef = useRef<THREE.Group>(null)
  
  // Realistic human proportions (head = 1 unit, body = 7-8 heads tall)
  const HEAD_SIZE = 0.22
  const BODY_HEIGHT = 1.6  // Total height
  const TORSO_HEIGHT = 0.6
  const LEG_LENGTH = 0.8
  
  // Create realistic skin texture
  const createSkinTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    
    // Base skin tone
    ctx.fillStyle = '#FDBCB4'
    ctx.fillRect(0, 0, 256, 256)
    
    // Add skin texture variation
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const alpha = Math.random() * 0.1
      ctx.fillStyle = `rgba(253, 188, 180, ${alpha})`
      ctx.fillRect(x, y, 1, 1)
    }
    
    // Add subtle rosy cheeks
    ctx.fillStyle = 'rgba(255, 182, 193, 0.3)'
    ctx.beginPath()
    ctx.arc(60, 120, 20, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(196, 120, 20, 0, Math.PI * 2)
    ctx.fill()
    
    return new THREE.CanvasTexture(canvas)
  }

  const createHairTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    
    // Dark brown hair base
    ctx.fillStyle = '#654321'
    ctx.fillRect(0, 0, 256, 256)
    
    // Add hair strands
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const length = Math.random() * 30 + 10
      const angle = Math.random() * Math.PI * 2
      
      ctx.strokeStyle = `rgba(${101 + Math.random() * 30}, ${67 + Math.random() * 20}, ${33 + Math.random() * 15}, 0.8)`
      ctx.lineWidth = Math.random() * 2 + 0.5
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
      ctx.stroke()
    }
    
    return new THREE.CanvasTexture(canvas)
  }

  const skinTexture = useMemo(() => createSkinTexture(), [])
  const hairTexture = useMemo(() => createHairTexture(), [])
  
  useFrame((state) => {
    if (!dealerRef.current) return
    
    const time = state.clock.elapsedTime
    
    // Idle breathing animation
    if (animation === 'idle') {
      dealerRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.02
      
      // Subtle head movement
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(time * 0.8) * 0.1
        headRef.current.rotation.x = Math.sin(time * 1.2) * 0.05
      }
      
      // Eye blinking
      if (eyesRef.current && Math.sin(time * 3) > 0.95) {
        eyesRef.current.scale.y = 0.1
      } else if (eyesRef.current) {
        eyesRef.current.scale.y = 1
      }
    }
  })

  return (
    <group ref={dealerRef} position={position}>
      {/* Legs - Properly connected to ground */}
      <mesh position={[0, -BODY_HEIGHT/2 + LEG_LENGTH/2, 0]} castShadow>
        <capsuleGeometry args={[0.08, LEG_LENGTH]} />
        <meshStandardMaterial 
          color="#000000" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Torso - Realistic proportions */}
      <mesh position={[0, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT/2, 0]} castShadow>
        <capsuleGeometry args={[0.18, TORSO_HEIGHT]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* White shirt overlay */}
      <mesh position={[0, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT/2, 0.02]} castShadow>
        <capsuleGeometry args={[0.19, TORSO_HEIGHT * 0.8]} />
        <meshStandardMaterial 
          color="#FFFFFF" 
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>

      {/* Collar */}
      <mesh position={[0, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT - 0.05, 0.05]} castShadow>
        <boxGeometry args={[0.25, 0.08, 0.03]} />
        <meshStandardMaterial 
          color="#FFFFFF" 
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>

      {/* Neck - Properly connecting head to body */}
      <mesh position={[0, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT + 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
        <meshStandardMaterial 
          map={skinTexture}
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>

      {/* Head and Facial Features */}
      <group ref={headRef} position={[0, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT + 0.15 + HEAD_SIZE, 0]}>
        {/* Head shape - more feminine oval */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[HEAD_SIZE, 32, 32]} />
          <meshStandardMaterial 
            map={skinTexture}
            roughness={0.8}
            metalness={0.0}
          />
        </mesh>

        {/* Cheekbones */}
        <mesh position={[-0.15, -0.05, 0.15]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial 
            map={skinTexture}
            roughness={0.8}
            metalness={0.0}
          />
        </mesh>
        <mesh position={[0.15, -0.05, 0.15]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial 
            map={skinTexture}
            roughness={0.8}
            metalness={0.0}
          />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.02, 0.22]} castShadow>
          <coneGeometry args={[0.03, 0.08, 8]} />
          <meshStandardMaterial 
            map={skinTexture}
            roughness={0.8}
            metalness={0.0}
          />
        </mesh>

        {/* Eyes */}
        <group ref={eyesRef}>
          {/* Eye sockets */}
          <mesh position={[-0.08, 0.05, 0.18]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial 
              color="#FFFFFF" 
              roughness={0.1}
              metalness={0.0}
            />
          </mesh>
          <mesh position={[0.08, 0.05, 0.18]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial 
              color="#FFFFFF" 
              roughness={0.1}
              metalness={0.0}
            />
          </mesh>
          
          {/* Iris */}
          <mesh position={[-0.08, 0.05, 0.21]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial 
              color="#4A4A4A" 
              roughness={0.2}
              metalness={0.0}
            />
          </mesh>
          <mesh position={[0.08, 0.05, 0.21]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial 
              color="#4A4A4A" 
              roughness={0.2}
              metalness={0.0}
            />
          </mesh>
          
          {/* Pupils */}
          <mesh position={[-0.08, 0.05, 0.22]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0.08, 0.05, 0.22]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>

        {/* Eyebrows */}
        <mesh position={[-0.08, 0.12, 0.19]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.08, 0.02, 0.01]} />
          <meshStandardMaterial color="#4A4A4A" roughness={0.9} />
        </mesh>
        <mesh position={[0.08, 0.12, 0.19]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.08, 0.02, 0.01]} />
          <meshStandardMaterial color="#4A4A4A" roughness={0.9} />
        </mesh>

        {/* Lips */}
        <mesh position={[0, -0.12, 0.2]} castShadow>
          <sphereGeometry args={[0.05, 16, 8]} />
          <meshStandardMaterial 
            color="#CD5C5C" 
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {/* Chin definition */}
        <mesh position={[0, -0.2, 0.1]} castShadow>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial 
            map={skinTexture}
            roughness={0.8}
            metalness={0.0}
          />
        </mesh>
      </group>

      {/* Beautiful Hair */}
      <group ref={hairRef} position={[0, 1.1, 0]}>
        {/* Main hair volume */}
        <mesh position={[0, 0.1, -0.1]} castShadow>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial 
            map={hairTexture}
            roughness={0.6}
            metalness={0.0}
          />
        </mesh>
        
        {/* Hair layers for volume */}
        <mesh position={[-0.15, 0, -0.15]} castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial 
            map={hairTexture}
            roughness={0.6}
            metalness={0.0}
          />
        </mesh>
        <mesh position={[0.15, 0, -0.15]} castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial 
            map={hairTexture}
            roughness={0.6}
            metalness={0.0}
          />
        </mesh>
        
        {/* Side swept bangs */}
        <mesh position={[-0.1, 0.05, 0.15]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.15, 0.08, 0.12]} />
          <meshStandardMaterial 
            map={hairTexture}
            roughness={0.6}
            metalness={0.0}
          />
        </mesh>
      </group>

      {/* Arms with realistic proportions and proper connection */}
      {/* Left shoulder */}
      <mesh position={[-0.22, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT - 0.1, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color="#FFFFFF"
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>
      
      {/* Left upper arm */}
      <mesh position={[-0.3, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT/2, 0]} rotation={[0, 0, Math.PI/6]} castShadow>
        <capsuleGeometry args={[0.05, 0.35]} />
        <meshStandardMaterial 
          color="#FFFFFF"
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>
      
      {/* Left forearm */}
      <mesh position={[-0.45, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT/2 - 0.2, 0]} rotation={[0, 0, Math.PI/8]} castShadow>
        <capsuleGeometry args={[0.04, 0.3]} />
        <meshStandardMaterial 
          map={skinTexture}
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>
      
      {/* Left hand */}
      <mesh position={[-0.55, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT/2 - 0.35, 0]} castShadow>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial 
          map={skinTexture}
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>

      {/* Right shoulder */}
      <mesh position={[0.22, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT - 0.1, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color="#FFFFFF"
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>
      
      {/* Right upper arm */}
      <mesh position={[0.3, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT/2, 0]} rotation={[0, 0, -Math.PI/6]} castShadow>
        <capsuleGeometry args={[0.05, 0.35]} />
        <meshStandardMaterial 
          color="#FFFFFF"
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>
      
      {/* Right forearm */}
      <mesh position={[0.45, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT/2 - 0.2, 0]} rotation={[0, 0, -Math.PI/8]} castShadow>
        <capsuleGeometry args={[0.04, 0.3]} />
        <meshStandardMaterial 
          map={skinTexture}
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>
      
      {/* Right hand */}
      <mesh position={[0.55, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT/2 - 0.35, 0]} castShadow>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial 
          map={skinTexture}
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>

      {/* Elegant earrings - positioned relative to head */}
      <mesh position={[-HEAD_SIZE * 1.1, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT + 0.15 + HEAD_SIZE, 0]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial 
          color="#FFD700"
          roughness={0.1}
          metalness={0.9}
          emissive="#B8860B"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[HEAD_SIZE * 1.1, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT + 0.15 + HEAD_SIZE, 0]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial 
          color="#FFD700"
          roughness={0.1}
          metalness={0.9}
          emissive="#B8860B"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Casino name tag - positioned on chest */}
      <mesh position={[0, -BODY_HEIGHT/2 + LEG_LENGTH + TORSO_HEIGHT/2 + 0.15, 0.2]} castShadow>
        <boxGeometry args={[0.15, 0.05, 0.01]} />
        <meshStandardMaterial 
          color="#FFD700"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Feet/Shoes - grounding the figure */}
      <mesh position={[-0.08, -BODY_HEIGHT/2, 0.08]} castShadow>
        <boxGeometry args={[0.12, 0.06, 0.2]} />
        <meshStandardMaterial 
          color="#000000"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      <mesh position={[0.08, -BODY_HEIGHT/2, 0.08]} castShadow>
        <boxGeometry args={[0.12, 0.06, 0.2]} />
        <meshStandardMaterial 
          color="#000000"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
    </group>
  )
}