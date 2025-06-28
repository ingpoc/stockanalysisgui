'use client'

import { useState, useRef, useMemo } from 'react'
import { useFrame, useLoader, ThreeEvent } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { GLTFLoader } from 'three-stdlib'
import * as THREE from 'three'
import { gsap } from 'gsap'

// Roulette numbers in correct order on wheel
const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

interface Bet {
  id: string
  player: string
  amount: number
  number: number
  position: [number, number, number]
}

interface RouletteTableProps {
  bets: Bet[]
  onPlaceBet: (number: number, position: [number, number, number]) => void
  isSpinning: boolean
  winningNumber: number | null
}

export function RouletteTable({ bets, onPlaceBet, isSpinning, winningNumber }: RouletteTableProps) {
  const tableRef = useRef<THREE.Group>(null)
  const wheelRef = useRef<THREE.Group>(null)
  
  // Load roulette table model if available
  let tableModel
  try {
    tableModel = useLoader(GLTFLoader, "/roulette_table.glb")
  } catch (e) {
    tableModel = null
  }

  // Spin wheel animation
  useFrame(() => {
    if (wheelRef.current && isSpinning) {
      wheelRef.current.rotation.y += 0.1
    }
  })

  // Generate betting grid positions
  const bettingPositions = useMemo(() => {
    const positions: { number: number, position: [number, number, number], color: string }[] = []
    
    // Main numbers grid (1-36)
    for (let i = 1; i <= 36; i++) {
      const row = Math.floor((i - 1) / 3)
      const col = (i - 1) % 3
      const x = -1.5 + col * 1
      const z = -5.5 + row * 1
      const color = RED_NUMBERS.includes(i) ? '#dc2626' : BLACK_NUMBERS.includes(i) ? '#1f2937' : '#059669'
      
      positions.push({
        number: i,
        position: [x, 0.02, z],
        color
      })
    }
    
    // Zero
    positions.push({
      number: 0,
      position: [0, 0.02, -6.5],
      color: '#059669'
    })
    
    return positions
  }, [])

  const handleBettingAreaClick = (event: ThreeEvent<MouseEvent>, number: number, position: [number, number, number]) => {
    event.stopPropagation()
    if (!isSpinning) {
      onPlaceBet(number, position)
    }
  }

  return (
    <group ref={tableRef} position={[0, 0, 0]}>
      {/* Table base */}
      {tableModel ? (
        <primitive object={tableModel.scene} />
      ) : (
        <group>
          {/* Table surface */}
          <mesh position={[0, 0, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[4, 4, 0.2, 32]} />
            <meshStandardMaterial color="#1a5f1a" roughness={0.2} metalness={0.1} />
          </mesh>
          
          {/* Table rim */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[4.2, 4.2, 0.1, 32]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
        </group>
      )}

      {/* Roulette wheel */}
      <group ref={wheelRef} position={[0, 0.15, 2]}>
        {/* Wheel base */}
        <mesh castShadow>
          <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        
        {/* Wheel numbers */}
        {ROULETTE_NUMBERS.map((number, index) => {
          const angle = (index / ROULETTE_NUMBERS.length) * Math.PI * 2
          const radius = 1
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          const color = number === 0 ? '#059669' : 
                      RED_NUMBERS.includes(number) ? '#dc2626' : '#1f2937'
          
          return (
            <group key={number} position={[x, 0.1, z]} rotation={[0, angle, 0]}>
              {/* Number pocket */}
              <mesh castShadow>
                <boxGeometry args={[0.15, 0.05, 0.2]} />
                <meshStandardMaterial color={color} />
              </mesh>
              
              {/* Number text */}
              <Text
                position={[0, 0.03, 0]}
                fontSize={0.08}
                color="white"
                anchorX="center"
                anchorY="middle"
                rotation={[-Math.PI / 2, 0, 0]}
              >
                {number.toString()}
              </Text>
            </group>
          )
        })}
        
        {/* Wheel separator lines */}
        {ROULETTE_NUMBERS.map((_, index) => {
          const angle = (index / ROULETTE_NUMBERS.length) * Math.PI * 2
          const x = Math.cos(angle) * 1.1
          const z = Math.sin(angle) * 1.1
          
          return (
            <mesh key={`separator-${index}`} position={[x, 0.1, z]} rotation={[0, angle, 0]}>
              <boxGeometry args={[0.02, 0.02, 0.1]} />
              <meshStandardMaterial color="#FFD700" />
            </mesh>
          )
        })}
      </group>

      {/* Betting grid */}
      <group position={[0, 0.01, -2]}>
        {/* Green felt background */}
        <mesh receiveShadow>
          <boxGeometry args={[6, 0.01, 8]} />
          <meshStandardMaterial color="#1a5f1a" />
        </mesh>
        
        {/* Betting areas */}
        {bettingPositions.map(({ number, position, color }) => (
          <group key={number} position={position}>
            {/* Betting area */}
            <mesh
              onClick={(e) => handleBettingAreaClick(e, number, position)}
              onPointerOver={(e) => { document.body.style.cursor = 'pointer' }}
              onPointerOut={(e) => { document.body.style.cursor = 'default' }}
              castShadow
            >
              <boxGeometry args={[0.8, 0.02, 0.8]} />
              <meshStandardMaterial 
                color={color}
                transparent
                opacity={0.8}
              />
            </mesh>
            
            {/* Number text */}
            <Text
              position={[0, 0.02, 0]}
              fontSize={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
              rotation={[-Math.PI / 2, 0, 0]}
            >
              {number.toString()}
            </Text>
            
            {/* Border */}
            <mesh>
              <boxGeometry args={[0.82, 0.01, 0.82]} />
              <meshStandardMaterial color="#FFD700" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Betting chips */}
      {bets.map((bet) => (
        <BettingChip
          key={bet.id}
          position={bet.position}
          amount={bet.amount}
          playerColor={getPlayerColor(bet.player)}
        />
      ))}

      {/* Winning number highlight */}
      {winningNumber !== null && (
        <WinningHighlight number={winningNumber} />
      )}
    </group>
  )
}

function BettingChip({ position, amount, playerColor }: { 
  position: [number, number, number], 
  amount: number, 
  playerColor: string 
}) {
  const chipRef = useRef<THREE.Mesh>(null)
  
  return (
    <group position={[position[0], position[1] + 0.05, position[2]]}>
      <mesh ref={chipRef} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
        <meshStandardMaterial color={playerColor} metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Chip value */}
      <Text
        position={[0, 0.03, 0]}
        fontSize={0.08}
        color="white"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        ${amount}
      </Text>
    </group>
  )
}

function WinningHighlight({ number }: { number: number }) {
  const highlightRef = useRef<THREE.Mesh>(null)
  
  // Find position of winning number
  const position = useMemo((): [number, number, number] => {
    if (number === 0) return [0, 0.05, -6.5]
    
    const row = Math.floor((number - 1) / 3)
    const col = (number - 1) % 3
    const x = -1.5 + col * 1
    const z = -5.5 + row * 1
    return [x, 0.05, z - 2]
  }, [number])
  
  useFrame((state) => {
    if (highlightRef.current && highlightRef.current.material && 'opacity' in highlightRef.current.material) {
      (highlightRef.current.material as THREE.MeshStandardMaterial).opacity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.3
    }
  })
  
  return (
    <mesh ref={highlightRef} position={position}>
      <cylinderGeometry args={[0.5, 0.5, 0.01, 16]} />
      <meshStandardMaterial 
        color="#FFD700" 
        transparent 
        opacity={0.8}
        emissive="#FFD700"
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

function getPlayerColor(playerWallet: string): string {
  // Generate consistent color for each player based on wallet address
  const hash = playerWallet.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  const colors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', 
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
  ]
  
  return colors[Math.abs(hash) % colors.length]
}