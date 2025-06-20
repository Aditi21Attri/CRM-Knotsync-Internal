'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from './button';

export interface AnimatedButtonProps extends ButtonProps {
  loading?: boolean;
  children: React.ReactNode;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = 'default', size = 'default', loading = false, children, ...props }, ref) => {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Button
          className={cn(
            'relative overflow-hidden',
            variant === 'default' && 'interactive-button',
            variant === 'outline' && 'ghost-button',
            loading && 'opacity-50 cursor-not-allowed',
            className
          )}
          ref={ref}
          variant={variant}
          size={size}
          disabled={loading}
          {...props}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <motion.div
                className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>Loading...</span>
            </div>
          ) : (
            children
          )}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export { AnimatedButton };
