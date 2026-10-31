import { CalendarClock, ClipboardCheck, Scale, Info } from 'lucide-react'

import type { TimelineEvent } from '@/lib/data/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const flowIcon: Record<TimelineEvent['flow'], typeof CalendarClock> = {
  estimate: CalendarClock,
  'prior-auth': ClipboardCheck,
  appeal: Scale,
  system: Info,
}

const negativeStatuses = new Set(['Denied', 'Lost'])

export function TimelineEventCard({ event }: { event: TimelineEvent }) {
  const Icon = flowIcon[event.flow]

  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Icon className="size-4" strokeWidth={1.7} />
        </span>
        <span className="mt-1 w-px flex-1 bg-border" />
      </div>
      <div className="flex-1 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{event.title}</p>
          {event.status && (
            <Badge variant={negativeStatuses.has(event.status) ? 'danger' : 'outline'}>{event.status}</Badge>
          )}
        </div>
        <p className={cn('mt-1 text-sm text-muted-foreground')}>{event.description}</p>
        <p className="mt-1.5 text-[10px] tracking-[.08em] text-muted-foreground uppercase">
          {event.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>
    </li>
  )
}
