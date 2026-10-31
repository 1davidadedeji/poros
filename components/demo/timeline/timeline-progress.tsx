'use client'

import { motion } from 'framer-motion'
import { usePrefersReducedMotion as useReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion'

import { useDemoState } from '@/lib/demo/context'

const STEPS = ['Estimate', 'Prior Auth', 'Decision', 'Appeal', 'Outcome']

export function TimelineProgress() {
  const { estimate, priorAuth, appeal } = useDemoState()
  const reduceMotion = useReducedMotion()

  let activeIndex = -1
  if (estimate) activeIndex = 0
  if (priorAuth.status !== 'none') activeIndex = 1
  if (priorAuth.status === 'approved' || priorAuth.status === 'denied') activeIndex = 2
  if (appeal.status !== 'none') activeIndex = 3
  if (appeal.status === 'won' || appeal.status === 'lost') activeIndex = 4

  const progress = activeIndex < 0 ? 0 : activeIndex / (STEPS.length - 1)

  return (
    <div className="mb-2">
      <div className="relative h-px bg-border">
        <motion.div
          className="absolute left-0 top-0 h-px bg-primary"
          style={{ width: '100%', transformOrigin: 'left' }}
          initial={reduceMotion ? undefined : { scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="mt-2 flex justify-between">
        {STEPS.map((step, index) => (
          <span
            key={step}
            className={
              index <= activeIndex
                ? 'text-[9px] font-semibold tracking-[.1em] text-primary uppercase'
                : 'text-[9px] font-semibold tracking-[.1em] text-muted-foreground uppercase'
            }
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  )
}
