import { ClinicalNoteEditor } from '@/components/demo/clinical-note-editor'
import { DenialSummary } from '@/components/demo/appeal/denial-summary'
import { GuidelineMatch } from '@/components/demo/appeal/guideline-match'
import { AppealLetter } from '@/components/demo/appeal/appeal-letter'
import { RouteFade } from '@/components/demo/route-fade'

export default function AppealPage() {
  return (
    <RouteFade className="flex max-w-5xl flex-col gap-6">
      <div>
        <p className="text-[10px] font-semibold tracking-[.2em] text-muted-foreground uppercase">
          Flow C · When A Claim Is Denied
        </p>
        <h2 className="mt-1 text-3xl">Appeal Assist</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Poros drafts an appeal from the clinical note and the matched guideline, shows what each claim rests
          on, and waits for staff approval before anything is submitted.
        </p>
      </div>
      <DenialSummary />
      <GuidelineMatch />
      <ClinicalNoteEditor description="The appeal draft may use only facts written here." />
      <AppealLetter />
    </RouteFade>
  )
}
