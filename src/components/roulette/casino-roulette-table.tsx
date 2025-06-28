'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Cylinder, Box } from '@react-three/drei'
import { DealerModel } from './dealer-model'
import * as THREE from 'three'

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

interface CasinoRouletteTableProps {
  isSpinning: boolean
  winningNumber: number | null
  selectedNumber: number | null
  onDealerAction: (action: 'spin' | 'throw') => void
}

export function CasinoRouletteTable({ 
  isSpinning, 
  winningNumber, 
  selectedNumber,
  onDealerAction 
}: CasinoRouletteTableProps) {
  const wheelRef = useRef<THREE.Group>(null)
  const ballRef = useRef<THREE.Mesh>(null)
  const dealerRef = useRef<THREE.Group>(null)
  
  const [dealerAnimation, setDealerAnimation] = useState<'idle' | 'spinning' | 'throwing'>('idle')

  useFrame((state) => {
    if (wheelRef.current && isSpinning) {
      wheelRef.current.rotation.y += 0.15
    }
    
    if (ballRef.current && isSpinning) {
      const time = state.clock.elapsedTime
      const radius = 2.2 + Math.sin(time * 4) * 0.3
      ballRef.current.position.x = Math.cos(time * 6) * radius
      ballRef.current.position.z = Math.sin(time * 6) * radius
      ballRef.current.position.y = 1.2 + Math.sin(time * 10) * 0.1
    }

    // Dealer animations
    if (dealerRef.current) {
      const time = state.clock.elapsedTime
      if (dealerAnimation === 'spinning') {
        // Arm movement for spinning
        dealerRef.current.rotation.z = Math.sin(time * 3) * 0.2
      } else if (dealerAnimation === 'throwing') {
        // Throwing motion
        dealerRef.current.rotation.x = Math.sin(time * 5) * 0.1
      }
    }
  })

  const getNumberColor = (num: number) => {
    if (num === 0) return '#059669'
    return RED_NUMBERS.includes(num) ? '#dc2626' : '#1f1f1f'
  }

  return (
    <group position={[0, 0, 0]}>
      {/* Main Table Base - Oval shaped like real casino tables */}
      <mesh position={[0, 0.5, 0]} receiveShadow>
        <cylinderGeometry args={[4, 4, 0.3, 32]} />
        <meshStandardMaterial color="#0f4c3a" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Outer Rim */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[4.1, 4.1, 0.1, 32]} />
        <meshStandardMaterial color="#8B4513" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Wheel Housing */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.2, 32]} />
        <meshStandardMaterial color="#654321" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Spinning Wheel */}
      <group ref={wheelRef} position={[0, 0.9, 0]}>
        {/* Inner wheel */}
        <mesh castShadow>
          <cylinderGeometry args={[2.2, 2.2, 0.1, 32]} />
          <meshStandardMaterial color="#8B4513" roughness={0.1} metalness={0.6} />
        </mesh>
        
        {/* Center hub */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
          <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={0.8} />
        </mesh>

        {/* Number Pockets */}
        {ROULETTE_NUMBERS.map((number, index) => {
          const angle = (index / ROULETTE_NUMBERS.length) * Math.PI * 2
          const radius = 1.8
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          const color = getNumberColor(number)
          
          return (
            <group key={number} position={[x, 0.06, z]} rotation={[0, angle + Math.PI/2, 0]}>
              {/* Number pocket */}
              <mesh castShadow>
                <boxGeometry args={[0.3, 0.08, 0.4]} />
                <meshStandardMaterial color={color} roughness={0.1} metalness={0.1} />
              </mesh>
              
              {/* Number text */}
              <Text
                position={[0, 0.05, 0]}
                fontSize={0.12}
                color="white"
                anchorX="center"
                anchorY="middle"
                rotation={[-Math.PI / 2, 0, 0]}
              >
                {number.toString()}
              </Text>

              {/* Winning number highlight */}
              {winningNumber === number && (
                <mesh position={[0, 0.1, 0]}>
                  <cylinderGeometry args={[0.2, 0.2, 0.02, 16]} />
                  <meshStandardMaterial 
                    color="#FFD700" 
                    transparent 
                    opacity={0.8}
                    emissive="#FFD700"
                    emissiveIntensity={0.5}
                  />
                </mesh>
              )}
            </group>
          )
        })}
      </group>

      {/* Roulette Ball */}
      <mesh ref={ballRef} position={[2.2, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial 
          color={winningNumber !== null ? "#FFD700" : "#FFFFFF"}
          metalness={0.9}
          roughness={0.05}
          emissive={winningNumber !== null ? "#FFD700" : "#000000"}
          emissiveIntensity={winningNumber !== null ? 0.3 : 0}
        />
      </mesh>

      {/* Betting Layout Area */}
      <mesh position={[0, 0.66, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 2]} />
        <meshStandardMaterial color="#0f4c3a" roughness={0.8} />
      </mesh>

      {/* Table Legs */}
      {([
        [-3, -0.25, -3],
        [3, -0.25, -3],
        [-3, -0.25, 3],
        [3, -0.25, 3]
      ] as [number, number, number][]).map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.6} />
        </mesh>
      ))}

      {/* 3D GLB Dealer Model */}
      <DealerModel 
        position={[0, 0.8, -3]}
        rotation={[0, 0, 0]}
        scale={1.2}
        isSpinning={isSpinning}
        onAction={onDealerAction}
      />
    </group>
  )
}

