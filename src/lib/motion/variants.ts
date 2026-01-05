'use client';

import { useReducedMotion as useReducedMotionHook } from '@/hooks/useReducedMotion';

/**
 * Animation variants for Framer Motion
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideInFromRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const slideInFromLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const messageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10 },
};

/**
 * Spring animation configs
 */
export const springConfig = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

export const gentleSpring = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 25,
};

/**
 * Get animation props based on reduced motion preference
 */
export function useAnimationProps() {
  const prefersReducedMotion = useReducedMotionHook();

  return {
    initial: prefersReducedMotion ? false : undefined,
    transition: prefersReducedMotion ? { duration: 0 } : undefined,
  };
}
