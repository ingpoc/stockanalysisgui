'use client';

import { useRef, useEffect, useState } from 'react';
import { useSphere } from "@react-three/cannon";
import { useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import type { Mesh } from 'three';
import * as THREE from 'three';

interface RouletteBallProps {
  isSpinning: boolean;
  onBallSettled?: (number: number) => void;
  winningNumber?: number | null;
}

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

export default function RouletteBall({ isSpinning, onBallSettled, winningNumber }: RouletteBallProps) {
  const [hasSettled, setHasSettled] = useState(false);
  const [initialVelocityApplied, setInitialVelocityApplied] = useState(false);
  
  const [ref, api] = useSphere<Mesh>(() => ({
    mass: 0.02, // Light ball for realistic physics
    position: [0, 3, 1.8], // Start position on rim
    args: [0.08], // Slightly smaller ball
    material: {
      friction: 0.1,
      restitution: 0.6, // Some bounce
    },
    linearDamping: 0.1,
    angularDamping: 0.1,
  }));

  // Apply initial spinning velocity when spin starts
  useEffect(() => {
    if (isSpinning && !initialVelocityApplied && api) {
      setHasSettled(false);
      setInitialVelocityApplied(true);
      
      // Apply initial circular velocity around the wheel
      const initialSpeed = 8 + Math.random() * 4; // Random initial speed
      api.velocity.set(-initialSpeed, 0, 0);
      api.angularVelocity.set(
        Math.random() * 10 - 5, 
        Math.random() * 10 - 5, 
        Math.random() * 10 - 5
      );
      
      // Reset position to rim
      api.position.set(0, 2.5, 1.8);
    } else if (!isSpinning) {
      setInitialVelocityApplied(false);
    }
  }, [isSpinning, api, initialVelocityApplied]);

  // Monitor ball velocity to detect when it settles
  useFrame(() => {
    if (!api || !ref.current) return;

    if (isSpinning && !hasSettled) {
      // Check if ball has settled (low velocity)
      api.velocity.subscribe((velocity) => {
        const speed = Math.sqrt(velocity[0] ** 2 + velocity[1] ** 2 + velocity[2] ** 2);
        if (speed < 0.1 && ref.current && !hasSettled) {
          setHasSettled(true);
          
          // Determine winning number based on ball position
          const position = ref.current.position;
          const angle = Math.atan2(position.z - 2, position.x); // Relative to wheel center
          let normalizedAngle = angle;
          if (normalizedAngle < 0) normalizedAngle += Math.PI * 2;
          
          const sectorSize = (Math.PI * 2) / ROULETTE_NUMBERS.length;
          const sectorIndex = Math.floor(normalizedAngle / sectorSize);
          const winningNum = ROULETTE_NUMBERS[sectorIndex] || 0;
          
          onBallSettled?.(winningNum);
        }
      });
    }
  });

  // Add glow effect when ball is the winning ball
  const isWinning = winningNumber !== null && hasSettled;

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial 
          color={isWinning ? "#FFD700" : "#FFFFFF"}
          metalness={0.8}
          roughness={0.1}
          emissive={isWinning ? "#FFD700" : "#000000"}
          emissiveIntensity={isWinning ? 0.3 : 0}
        />
      </mesh>
      
      {/* Trail effect when spinning */}
      {isSpinning && !hasSettled && (
        <BallTrail ballRef={ref} />
      )}
    </group>
  );
}

function BallTrail({ ballRef }: { ballRef: React.RefObject<Mesh> }) {
  const trailRef = useRef<THREE.Points>(null);
  const positions = useRef<Float32Array>(new Float32Array(300)); // 100 trail points * 3 coordinates
  const positionIndex = useRef(0);

  useFrame(() => {
    if (!ballRef.current || !trailRef.current) return;

    const ballPosition = ballRef.current.position;
    const index = positionIndex.current * 3;
    
    positions.current[index] = ballPosition.x;
    positions.current[index + 1] = ballPosition.y;
    positions.current[index + 2] = ballPosition.z;
    
    positionIndex.current = (positionIndex.current + 1) % 100;
    
    if (trailRef.current.geometry.attributes.position) {
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={trailRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.current, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.02} 
        color="#FFFFFF" 
        transparent 
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}
