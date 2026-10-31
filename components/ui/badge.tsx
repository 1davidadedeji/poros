import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[.12em] uppercase whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-secondary text-secondary-foreground',
        success: 'border-transparent bg-[#147d73]/15 text-[#0d514b] dark:bg-[#4ac4b4]/20 dark:text-[#8fe4d6]',
        warning: 'border-transparent bg-[#b4914e]/20 text-[#8a6a2e] dark:bg-[#d4b36b]/25 dark:text-[#d4b36b]',
        danger: 'border-transparent bg-destructive/15 text-destructive',
        outline: 'border-border bg-transparent text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { Badge, badgeVariants }
