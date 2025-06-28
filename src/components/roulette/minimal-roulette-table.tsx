'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Cylinder, Box, Ring } from '@react-three/drei'
import * as THREE from 'three'

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

interface MinimalRouletteTableProps {
  isSpinning: boolean
  winningNumber: number | null
  selectedNumber: number | null
}

export function MinimalRouletteTable({ 
  isSpinning, 
  winningNumber, 
  selectedNumber 
}: MinimalRouletteTableProps) {
  const wheelRef = useRef<THREE.Group>(null)
  const ballRef = useRef<THREE.Mesh>(null)
  const ballAngleRef = useRef(0)
  const ballRadiusRef = useRef(1.8)
  const ballHeightRef = useRef(0.5)

  useFrame((state, delta) => {
    if (wheelRef.current) {
      if (isSpinning) {
        wheelRef.current.rotation.y += 0.08
      } else if (winningNumber !== null) {
        // Smoothly stop at winning number
        const targetIndex = ROULETTE_NUMBERS.indexOf(winningNumber)
        const targetAngle = -(targetIndex / ROULETTE_NUMBERS.length) * Math.PI * 2
        wheelRef.current.rotation.y += (targetAngle - wheelRef.current.rotation.y) * 0.1
      }
    }
    
    if (ballRef.current) {
      if (isSpinning) {
        // Ball spinning animation
        ballAngleRef.current += delta * 5
        ballRadiusRef.current = 1.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2
        ballHeightRef.current = 0.5 + Math.sin(state.clock.elapsedTime * 8) * 0.05
        
        ballRef.current.position.x = Math.cos(ballAngleRef.current) * ballRadiusRef.current
        ballRef.current.position.z = Math.sin(ballAngleRef.current) * ballRadiusRef.current
        ballRef.current.position.y = ballHeightRef.current
      } else if (winningNumber !== null) {
        // Ball settling animation
        const targetIndex = ROULETTE_NUMBERS.indexOf(winningNumber)
        const targetAngle = (targetIndex / ROULETTE_NUMBERS.length) * Math.PI * 2
        const targetRadius = 1.5
        
        ballRef.current.position.x = Math.cos(targetAngle) * targetRadius
        ballRef.current.position.z = Math.sin(targetAngle) * targetRadius
        ballRef.current.position.y = 0.3
      }
    }
  })

  const getNumberColor = (num: number) => {
    if (num === 0) return '#10B981' // green
    return RED_NUMBERS.includes(num) ? '#EF4444' : '#111827' // red or black
  }

  return (
    <group position={[0, 0, 0]}>
      {/* Table Base - Minimal design */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[3.5, 3.5, 0.2, 64]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} metalness={0} />
      </mesh>

      {/* Table Edge */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[3.6, 3.6, 0.05, 64]} />
        <meshStandardMaterial color="#E5E7EB" roughness={0.5} metalness={0} />
      </mesh>

      {/* Wheel Base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[2.3, 2.3, 0.15, 64]} />
        <meshStandardMaterial color="#F3F4F6" roughness={0.4} metalness={0} />
      </mesh>

      {/* Spinning Wheel Group */}
      <group ref={wheelRef} position={[0, 0.2, 0]}>
        {/* Wheel Surface */}
        <mesh castShadow>
          <cylinderGeometry args={[2, 2, 0.1, 64]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0} />
        </mesh>
        
        {/* Center Hub */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
          <meshStandardMaterial color="#9CA3AF" roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Number Pockets - Minimal Design */}
        {ROULETTE_NUMBERS.map((number, index) => {
          const angle = (index / ROULETTE_NUMBERS.length) * Math.PI * 2
          const radius = 1.6
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          const color = getNumberColor(number)
          
          return (
            <group key={number} position={[x, 0.05, z]} rotation={[0, angle + Math.PI/2, 0]}>
              {/* Number pocket - simplified */}
              <mesh castShadow>
                <boxGeometry args={[0.3, 0.06, 0.35]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0} />
              </mesh>
              
              {/* Number text */}
              <Text
                position={[0, 0.04, 0]}
                fontSize={0.11}
                color="white"
                anchorX="center"
                anchorY="middle"
                rotation={[-Math.PI / 2, 0, 0]}
              >
                {number.toString()}
              </Text>

              {/* Highlight selected/winning number */}
              {(selectedNumber === number || winningNumber === number) && (
                <mesh position={[0, 0.08, 0]}>
                  <ringGeometry args={[0.15, 0.2, 16]} />
                  <meshStandardMaterial 
                    color={winningNumber === number ? "#10B981" : "#3B82F6"}
                    transparent 
                    opacity={0.8}
                    emissive={winningNumber === number ? "#10B981" : "#3B82F6"}
                    emissiveIntensity={0.3}
                  />
                </mesh>
              )}
            </group>
          )
        })}

        {/* Dividers between numbers */}
        {ROULETTE_NUMBERS.map((_, index) => {
          const angle = (index / ROULETTE_NUMBERS.length) * Math.PI * 2 + Math.PI / ROULETTE_NUMBERS.length
          const innerRadius = 0.8
          const outerRadius = 1.9
          
          return (
            <mesh key={`divider-${index}`} position={[0, 0.051, 0]} rotation={[0, angle, 0]}>
              <boxGeometry args={[0.01, 0.06, outerRadius - innerRadius]} />
              <meshStandardMaterial color="#E5E7EB" roughness={0.5} />
            </mesh>
          )
        })}
      </group>

      {/* Roulette Ball */}
      <mesh ref={ballRef} position={[1.8, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.06, 32, 32]} />
        <meshStandardMaterial 
          color="#FFFFFF"
          metalness={0.8}
          roughness={0.1}
          emissive={winningNumber !== null ? "#10B981" : "#000000"}
          emissiveIntensity={winningNumber !== null ? 0.2 : 0}
        />
      </mesh>

      {/* Outer Track for Ball */}
      <mesh position={[0, 0.25, 0]}>
        <torusGeometry args={[2.1, 0.05, 8, 64]} />
        <meshStandardMaterial color="#E5E7EB" roughness={0.5} metalness={0} />
      </mesh>

      {/* Table Surface Ring */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <ringGeometry args={[2.5, 3.5, 64]} />
        <meshStandardMaterial color="#F9FAFB" roughness={0.8} metalness={0} />
      </mesh>
    </group>
  )
}
