'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface PlayerAvatarsProps {
  players: string[]
}

export function PlayerAvatars({ players }: PlayerAvatarsProps) {
  const avatarsRef = useRef<THREE.Group>(null)

  // Position players around the roulette table
  const playerPositions = useMemo(() => {
    const positions: Array<{
      position: [number, number, number]
      rotation: [number, number, number]
      wallet: string
      displayName: string
    }> = []

    const tableRadius = 5
    const maxPlayers = 8 // Maximum players around table

    players.slice(0, maxPlayers).forEach((wallet, index) => {
      const angle = (index / maxPlayers) * Math.PI * 2
      const x = Math.cos(angle) * tableRadius
      const z = Math.sin(angle) * tableRadius
      
      // Face towards center of table
      const rotationY = angle + Math.PI

      positions.push({
        position: [x, 1.5, z],
        rotation: [0, rotationY, 0],
        wallet,
        displayName: `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
      })
    })

    return positions
  }, [players])

  // Gentle floating animation for avatars
  useFrame((state) => {
    if (avatarsRef.current) {
      avatarsRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Group) {
          const floatOffset = Math.sin(state.clock.elapsedTime + index) * 0.05
          child.position.y = 1.5 + floatOffset
        }
      })
    }
  })

  return (
    <group ref={avatarsRef}>
      {playerPositions.map((player, index) => (
        <PlayerAvatar
          key={player.wallet}
          position={player.position}
          rotation={player.rotation}
          displayName={player.displayName}
          playerIndex={index}
        />
      ))}
    </group>
  )
}

interface PlayerAvatarProps {
  position: [number, number, number]
  rotation: [number, number, number]
  displayName: string
  playerIndex: number
}

function PlayerAvatar({ position, rotation, displayName, playerIndex }: PlayerAvatarProps) {
  const avatarRef = useRef<THREE.Group>(null)

  // Generate consistent avatar colors based on player index
  const avatarColor = useMemo(() => {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
      '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
    ]
    return colors[playerIndex % colors.length]
  }, [playerIndex])

  const hairColor = useMemo(() => {
    const colors = ['#8B4513', '#000000', '#FFD700', '#8B0000', '#2F4F4F']
    return colors[playerIndex % colors.length]
  }, [playerIndex])

  return (
    <group ref={avatarRef} position={position} rotation={rotation}>
      {/* Body */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 1, 8]} />
        <meshStandardMaterial color={avatarColor} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.08, 0.35, 0.2]} castShadow>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.08, 0.35, 0.2]} castShadow>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.4, -0.2, 0]} rotation={[0, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      <mesh position={[0.4, -0.2, 0]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>

      {/* Player name label */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI, 0]}
        castShadow
      >
        {displayName}
      </Text>

      {/* Subtle glow effect */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 16]} />
        <meshBasicMaterial 
          color={avatarColor} 
          transparent 
          opacity={0.1}
        />
      </mesh>

      {/* Thinking bubble when betting */}
      <ThinkingBubble playerIndex={playerIndex} />
    </group>
  )
}

function ThinkingBubble({ playerIndex }: { playerIndex: number }) {
  const bubbleRef = useRef<THREE.Group>(null)

  // Random thinking animation
  useFrame((state) => {
    if (bubbleRef.current) {
      const showBubble = Math.sin(state.clock.elapsedTime * 0.5 + playerIndex) > 0.7
      bubbleRef.current.visible = showBubble
      
      if (showBubble) {
        bubbleRef.current.scale.setScalar(0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
      }
    }
  })

  return (
    <group ref={bubbleRef} position={[0.5, 0.8, 0]}>
      {/* Main bubble */}
      <mesh>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial 
          color="white" 
          transparent 
          opacity={0.9}
        />
      </mesh>

      {/* Smaller bubbles */}
      <mesh position={[-0.1, -0.15, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial 
          color="white" 
          transparent 
          opacity={0.7}
        />
      </mesh>

      {/* Question mark */}
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.08}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        ?
      </Text>
    </group>
  )
}