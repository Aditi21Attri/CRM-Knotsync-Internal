'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
  variant?: 'slide' | 'fade' | 'scale' | 'none';
  delay?: number;
}

const pageVariants = {
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
  },
};

export function AnimatedPage({ 
  children, 
  className, 
  variant = 'slide', 
  delay = 0 
}: AnimatedPageProps) {
  return (
    <motion.div
      initial={pageVariants[variant].initial}
      animate={pageVariants[variant].animate}
      exit={pageVariants[variant].exit}
      transition={{
        duration: 0.3,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn('w-full', className)}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedList({ 
  children, 
  className,
  staggerDelay = 0.1 
}: { 
  children: ReactNode[]; 
  className?: string; 
  staggerDelay?: number; 
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export function AnimatedGrid({ 
  children, 
  className,
  staggerDelay = 0.05 
}: { 
  children: ReactNode[]; 
  className?: string; 
  staggerDelay?: number; 
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={cn('grid gap-4', className)}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
