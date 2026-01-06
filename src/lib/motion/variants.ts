'use client';

import { useReducedMotion as useReducedMotionHook } from '@/hooks/useReducedMotion';
import type { Variants, Transition } from 'motion/react';

// Spring animation presets
export const springs = {
  gentle: { type: "spring", stiffness: 120, damping: 14 } as const,
  snappy: { type: "spring", stiffness: 400, damping: 30 } as const,
  bouncy: { type: "spring", stiffness: 300, damping: 10 } as const,
} satisfies Record<string, Transition>;

/**
 * Animation variants for Framer Motion
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.15, ease: "easeOut" },
  },
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.gentle,
  },
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const slideInFromLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const messageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10 },
};

// Message animations with directional slide
export const messageItemUser: Variants = {
  hidden: { opacity: 0, x: 12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

export const messageItemAssistant: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

// Form animations
export const formFieldContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

export const formField: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springs.snappy,
  },
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
