import { daysRemaining } from '@/lib/demo/prior-auth'
import { Badge } from '@/components/ui/badge'

export function DeadlineCountdown({ deadline, label }: { deadline: Date; label: string }) {
  const days = daysRemaining(deadline)
  const urgent = days <= 3

  return (
    <div className="flex items-center gap-2">
      <Badge variant={urgent ? 'danger' : 'warning'}>
        {days > 0 ? `${days} day${days === 1 ? '' : 's'} remaining` : 'Due today'}
      </Badge>
      <span className="text-xs text-muted-foreground">
        {label} by {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    </div>
  )
}
