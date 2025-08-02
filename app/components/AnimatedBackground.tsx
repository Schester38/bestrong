"use client";

import { useEffect, useRef, useState } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si l'écran est assez large pour l'animation
    const checkScreenSize = () => {
      setIsVisible(window.innerWidth >= 768); // Seulement sur tablette et desktop
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajuster la taille du canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particules - réduit de 50 à 20 pour de meilleures performances
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    // Créer les particules
    const createParticles = () => {
      const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981'];
      
      for (let i = 0; i < 20; i++) { // Réduit de 50 à 20
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3, // Vitesse réduite
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 1, // Taille réduite
          opacity: Math.random() * 0.3 + 0.1, // Opacité réduite
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    createParticles();

    let animationId: number;

    // Animation optimisée
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // Mettre à jour la position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Rebondir sur les bords
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
        }

        // Garder les particules dans le canvas
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Dessiner la particule
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        // Dessiner les connexions (optimisé)
        for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex++) {
          const otherParticle = particles[otherIndex];
          const distance = Math.sqrt(
            Math.pow(particle.x - otherParticle.x, 2) + 
            Math.pow(particle.y - otherParticle.y, 2)
          );

          if (distance < 80) { // Distance réduite
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `${particle.color}${Math.floor((1 - distance / 80) * 0.2 * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 0.5; // Ligne plus fine
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.3 }} // Opacité réduite
    />
  );
} 