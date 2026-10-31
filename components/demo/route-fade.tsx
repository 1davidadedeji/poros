'use client'

import { motion } from 'framer-motion'
import { usePrefersReducedMotion as useReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion'

export function RouteFade({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
