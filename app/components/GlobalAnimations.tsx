'use client'

import { motion } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

interface GlobalAnimationsProps {
  children: ReactNode
}

// Composant global simplifié pour appliquer les animations à toutes les pages
export const GlobalAnimations = ({ children }: GlobalAnimationsProps) => {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      try {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const scrollPercent = scrollTop / docHeight
        setScrollProgress(Math.min(scrollPercent, 1))
      } catch (error) {
        console.log('Erreur scroll:', error)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      {/* Barre de progression de scroll globale */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 origin-left z-50 transition-transform duration-100"
        style={{ transform: `scaleX(${scrollProgress})` }} 
      />
      
      {/* Animations pour tous les éléments avec des classes spécifiques */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.div>
    </>
  )
}

// Hook pour les animations de scroll
export const useScrollAnimation = () => {
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('.scroll-reveal')
    elements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return isInView
}

// Composant pour animer les cartes automatiquement
export const AutoAnimatedCard = ({ children, className = '', delay = 0 }: { children: ReactNode, className?: string, delay?: number }) => {
  return (
    <motion.div
      className={`depth-card hover-lift ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      {children}
    </motion.div>
  )
}

// Composant pour animer les boutons automatiquement
export const AutoAnimatedButton = ({ children, className = '', onClick, disabled = false }: { children: ReactNode, className?: string, onClick?: () => void, disabled?: boolean }) => {
  return (
    <motion.button
      className={`morph-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  )
} 