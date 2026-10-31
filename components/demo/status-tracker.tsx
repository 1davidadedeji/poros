import { cn } from '@/lib/utils'

interface StatusTrackerProps {
  steps: string[]
  activeIndex: number
  variant?: 'default' | 'success' | 'danger'
}

export function StatusTracker({ steps, activeIndex, variant = 'default' }: StatusTrackerProps) {
  return (
    <ol className="flex items-center gap-0" aria-label="Status">
      {steps.map((step, index) => {
        const reached = index <= activeIndex
        const isCurrent = index === activeIndex
        const dotColor = !reached
          ? 'bg-muted text-muted-foreground'
          : isCurrent && variant === 'danger'
            ? 'bg-destructive text-destructive-foreground'
            : isCurrent && variant === 'success'
              ? 'bg-primary text-primary-foreground'
              : 'bg-primary text-primary-foreground'

        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-[10px] font-semibold',
                  dotColor,
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  'text-center text-[9px] font-semibold tracking-[.1em] uppercase',
                  reached ? 'text-foreground' : 'text-muted-foreground',
                  isCurrent && variant === 'danger' && 'text-destructive',
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span className={cn('mx-2 h-px flex-1', index < activeIndex ? 'bg-primary' : 'bg-border')} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
