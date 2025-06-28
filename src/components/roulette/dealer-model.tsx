'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

interface DealerModelProps {
  onAction?: (action: 'spin' | 'throw') => void
  isSpinning?: boolean
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

export function DealerModel({ 
  onAction, 
  isSpinning = false, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = 1 
}: DealerModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentAction, setCurrentAction] = useState<'idle' | 'spin' | 'throw'>('idle')
  
  // Load the GLB model
  const { scene, animations } = useGLTF('/model/Generate_a_3D_model_o_0628122943_texture.glb')
  const { actions, mixer } = useAnimations(animations, groupRef)

  useEffect(() => {
    if (scene) {
      setIsLoaded(true)
      
      // Setup materials and lighting
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          // Enhance material properties for better rendering
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.metalness = 0.1
                  mat.roughness = 0.8
                  mat.envMapIntensity = 0.5
                }
              })
            } else if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.metalness = 0.1
              child.material.roughness = 0.8
              child.material.envMapIntensity = 0.5
            }
          }
        }
      })
    }
  }, [scene])

  // Handle animation based on spinning state
  useEffect(() => {
    if (isSpinning && currentAction !== 'spin') {
      setCurrentAction('spin')
      onAction?.('spin')
      
      // Play spin animation if available
      if (actions && Object.keys(actions).length > 0) {
        const spinAction = actions[Object.keys(actions)[0]]
        if (spinAction) {
          spinAction.reset().play()
          spinAction.setLoop(THREE.LoopOnce, 1)
        }
      }
    } else if (!isSpinning && currentAction === 'spin') {
      setCurrentAction('idle')
    }
  }, [isSpinning, actions, currentAction, onAction])

  // Subtle idle animation
  useFrame((state) => {
    if (groupRef.current && isLoaded) {
      // Gentle breathing/idle motion
      const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
      groupRef.current.position.y = position[1] + breathe
      
      // Slight random movements for realism
      if (!isSpinning) {
        const sway = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
        groupRef.current.rotation.y = rotation[1] + sway
      }
    }
  })

  if (!isLoaded) {
    return null
  }

  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <primitive object={scene.clone()} />
      
      {/* Add a subtle spotlight on the dealer */}
      <spotLight
        position={[0, 2, 1]}
        intensity={2}
        angle={Math.PI / 6}
        penumbra={0.5}
        color="#FFE4B5"
        castShadow
        target-position={[0, 0, 0]}
      />
    </group>
  )
}

// Preload the model
useGLTF.preload('/model/Generate_a_3D_model_o_0628122943_texture.glb')