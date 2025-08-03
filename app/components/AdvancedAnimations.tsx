'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'

interface ParallaxSectionProps {
  children: React.ReactNode
  speed?: number
  className?: string
}

export const ParallaxSection = ({ children, speed = 0.5, className = '' }: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`])
  const springY = useSpring(y, { stiffness: 100, damping: 30 })

  return (
    <motion.div
      ref={ref}
      style={{ y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface FadeInOnScrollProps {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  className?: string
}

export const FadeInOnScroll = ({ 
  children, 
  direction = 'up', 
  delay = 0, 
  duration = 0.6,
  className = '' 
}: FadeInOnScrollProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 60, opacity: 0 }
      case 'down': return { y: -60, opacity: 0 }
      case 'left': return { x: 60, opacity: 0 }
      case 'right': return { x: -60, opacity: 0 }
      default: return { y: 60, opacity: 0 }
    }
  }

  const getAnimatePosition = () => {
    switch (direction) {
      case 'up': return { y: 0, opacity: 1 }
      case 'down': return { y: 0, opacity: 1 }
      case 'left': return { x: 0, opacity: 1 }
      case 'right': return { x: 0, opacity: 1 }
      default: return { y: 0, opacity: 1 }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={getInitialPosition()}
      animate={isInView ? getAnimatePosition() : getInitialPosition()}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface FloatingElementProps {
  children: React.ReactNode
  duration?: number
  delay?: number
  className?: string
}

export const FloatingElement = ({ 
  children, 
  duration = 3, 
  delay = 0,
  className = '' 
}: FloatingElementProps) => {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface InteractiveParticlesProps {
  count?: number
  className?: string
}

export const InteractiveParticles = ({ count = 20, className = '' }: InteractiveParticlesProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2
      }))
      setParticles(newParticles)
    }

    generateParticles()
  }, [count])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setParticles(prev => prev.map(particle => {
      const distance = Math.sqrt(
        Math.pow(x - particle.x, 2) + Math.pow(y - particle.y, 2)
      )
      
      if (distance < 30) {
        return {
          ...particle,
          x: particle.x + (x - particle.x) * 0.1,
          y: particle.y + (y - particle.y) * 0.1
        }
      }
      return particle
    }))
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  )
}

interface GlowingCardProps {
  children: React.ReactNode
  intensity?: number
  className?: string
}

export const GlowingCard = ({ children, intensity = 1, className = '' }: GlowingCardProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMousePosition({ x, y })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
      className={`relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 ${className}`}
      style={{
        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(236, 72, 153, ${0.1 * intensity}), transparent 40%)`
      }}
    >
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  )
}

interface AnimatedGradientTextProps {
  children: React.ReactNode
  className?: string
}

export const AnimatedGradientText = ({ children, className = '' }: AnimatedGradientTextProps) => {
  return (
    <motion.div
      className={`bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent ${className}`}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        backgroundSize: '200% 200%'
      }}
    >
      {children}
    </motion.div>
  )
}

interface ScrollProgressBarProps {
  className?: string
}

export const ScrollProgressBar = ({ className = '' }: ScrollProgressBarProps) => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 origin-left z-50 ${className}`}
      style={{ scaleX }}
    />
  )
}

interface MagneticButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export const MagneticButton = ({ children, onClick, className = '' }: MagneticButtonProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    setPosition({ x: x * 0.3, y: y * 0.3 })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{
        x: position.x,
        y: position.y
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15
      }}
      className={`relative overflow-hidden rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      <motion.div
        className="absolute inset-0 bg-white/20"
        initial={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{ borderRadius: 'inherit' }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export const AnimatedCounter = ({ value, duration = 2, className = '' }: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = displayValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(startValue + (value - startValue) * easeOutQuart)
      
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [value, duration, displayValue])

  return (
    <span className={className}>
      {displayValue.toLocaleString()}
    </span>
  )
}

export default {
  ParallaxSection,
  FadeInOnScroll,
  FloatingElement,
  InteractiveParticles,
  GlowingCard,
  AnimatedGradientText,
  ScrollProgressBar,
  MagneticButton,
  AnimatedCounter
} 