'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function useNumberAnimation(value: number, duration: number = 1) {
  const elementRef = useRef<HTMLDivElement>(null)
  const currentValue = useRef(0)

  useEffect(() => {
    if (elementRef.current && value !== currentValue.current) {
      gsap.to(currentValue, {
        current: value,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          if (elementRef.current) {
            elementRef.current.textContent = Math.round(currentValue.current).toLocaleString()
          }
        }
      })
    }
  }, [value, duration])

  return elementRef
}

export function useCountUp(value: number, prefix: string = '', suffix: string = '', duration: number = 1.2) {
  const elementRef = useRef<HTMLDivElement>(null)
  const currentValue = useRef(0)

  useEffect(() => {
    if (elementRef.current && value !== currentValue.current) {
      gsap.to(currentValue, {
        current: value,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          if (elementRef.current) {
            const displayValue = currentValue.current
            if (prefix === '$') {
              elementRef.current.textContent = `${prefix}${displayValue.toFixed(2)}${suffix}`
            } else {
              elementRef.current.textContent = `${prefix}${Math.round(displayValue).toLocaleString()}${suffix}`
            }
          }
        }
      })
    }
  }, [value, prefix, suffix, duration])

  return elementRef
}

export function useFadeIn(delay: number = 0) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (elementRef.current) {
      gsap.fromTo(elementRef.current, 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6,
          delay,
          ease: "power2.out"
        }
      )
    }
  }, [delay])

  return elementRef
}

export function useStaggeredFadeIn(selector: string, delay: number = 0) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(selector)
      gsap.fromTo(elements,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay,
          stagger: 0.1,
          ease: "power2.out"
        }
      )
    }
  }, [selector, delay])

  return containerRef
}