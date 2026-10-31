'use client'

import Link from 'next/link'

import { useDemoState } from '@/lib/demo/context'
import { TimelineEventCard } from './timeline-event-card'
import { TimelineProgress } from './timeline-progress'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function TimelineView() {
  const { timeline } = useDemoState()

  if (timeline.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-3 pt-5">
          <p className="text-sm text-muted-foreground">
            No activity yet for this patient. Start with a cost estimate to begin the story.
          </p>
          <Link href="/demo/estimate" className={buttonVariants({ variant: 'default' })}>
            Start with Cost Estimate
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <TimelineProgress />
      <ol className="flex flex-col">
        {timeline.map((event) => (
          <TimelineEventCard key={event.id} event={event} />
        ))}
      </ol>
    </div>
  )
}
