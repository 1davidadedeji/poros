import { DenialSummary } from '@/components/demo/appeal/denial-summary'
import { GuidelineMatch } from '@/components/demo/appeal/guideline-match'
import { AppealLetter } from '@/components/demo/appeal/appeal-letter'
import { RouteFade } from '@/components/demo/route-fade'

export default function AppealPage() {
  return (
    <RouteFade className="flex max-w-3xl flex-col gap-6">
      <div>
        <p className="text-[10px] font-semibold tracking-[.2em] text-muted-foreground uppercase">
          Flow C · When A Claim Is Denied
        </p>
        <h2 className="mt-1 text-3xl">Appeal Assist</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Poros creates a payer-specific, citation-backed appeal and tracks the deadline.
        </p>
      </div>
      <DenialSummary />
      <GuidelineMatch />
      <AppealLetter />
    </RouteFade>
  )
}
