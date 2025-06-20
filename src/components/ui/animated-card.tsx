'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'gradient' | 'hover-lift' | 'glow';
  children: React.ReactNode;
  delay?: number;
}

const cardVariants = {
  default: 'modern-card',
  glass: 'glass-card rounded-2xl p-6',
  gradient: 'gradient-card',
  'hover-lift': 'modern-card hover-lift',
  glow: 'modern-card hover-glow',
};

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, variant = 'default', children, delay = 0, ...props }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay, 
          ease: [0.4, 0, 0.2, 1] 
        }}
        whileHover={{ y: -4 }}
        className={cn(
          'transition-all duration-300',
          cardVariants[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

const AnimatedCardHeader = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
);

AnimatedCardHeader.displayName = 'AnimatedCardHeader';

const AnimatedCardTitle = forwardRef<HTMLParagraphElement, HTMLMotionProps<'h3'>>(
  ({ className, children, ...props }, ref) => (
    <motion.h3
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </motion.h3>
  )
);

AnimatedCardTitle.displayName = 'AnimatedCardTitle';

const AnimatedCardDescription = forwardRef<HTMLParagraphElement, HTMLMotionProps<'p'>>(
  ({ className, children, ...props }, ref) => (
    <motion.p
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </motion.p>
  )
);

AnimatedCardDescription.displayName = 'AnimatedCardDescription';

const AnimatedCardContent = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
);

AnimatedCardContent.displayName = 'AnimatedCardContent';

const AnimatedCardFooter = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
);

AnimatedCardFooter.displayName = 'AnimatedCardFooter';

export {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardTitle,
  AnimatedCardDescription,
  AnimatedCardContent,
  AnimatedCardFooter,
};
