'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const dots = containerRef.current.querySelectorAll('.dot')
      
      gsap.set(dots, { scale: 1 })
      
      const tl = gsap.timeline({ repeat: -1 })
      tl.to(dots, {
        scale: 1.5,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.inOut"
      })
      .to(dots, {
        scale: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.inOut"
      })

      return () => {
        tl.kill()
      }
    }
  }, [])

  return (
    <div ref={containerRef} className={`flex items-center gap-1 ${className}`}>
      <div className="dot w-2 h-2 bg-gray-400 rounded-full"></div>
      <div className="dot w-2 h-2 bg-gray-400 rounded-full"></div>
      <div className="dot w-2 h-2 bg-gray-400 rounded-full"></div>
    </div>
  )
}