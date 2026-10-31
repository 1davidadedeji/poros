import { TimelineView } from '@/components/demo/timeline/timeline-view'
import { RouteFade } from '@/components/demo/route-fade'

export default function DemoOverviewPage() {
  return (
    <RouteFade className="flex max-w-3xl flex-col gap-6">
      <div>
        <p className="text-[10px] font-semibold tracking-[.2em] text-muted-foreground uppercase">
          One Patient Record
        </p>
        <h2 className="mt-1 text-3xl">Patient Timeline</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Every estimate, request, and appeal for this patient in one place — the same data model, three moments
          that matter.
        </p>
      </div>
      <TimelineView />
    </RouteFade>
  )
}
