
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from './ThemeToggle';
import { UserNav } from './UserNav';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function Header() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="glass-nav sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl"
    >
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden"
          >
            <SidebarTrigger className="h-9 w-9 rounded-lg hover:bg-muted/50 transition-all duration-200" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="28" 
                height="28" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="hsl(var(--primary))" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="lucide lucide-shield-check transition-all duration-300 group-hover:scale-110"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                <path d="m9 12 2 2 4-4"/>
              </motion.svg>
              <span className="font-headline text-xl font-bold gradient-text">
                KnotSync CRM
              </span>
            </Link>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center gap-x-2 sm:gap-x-4"
        >
          <ThemeToggle />
          <UserNav />
        </motion.div>
      </div>
    </motion.header>
  );
}
