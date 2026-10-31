'use client'

import { useDemoState } from '@/lib/demo/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { StatusTracker } from '@/components/demo/status-tracker'

const STEPS = ['Draft', 'Submitted', 'Outcome']

export function AppealLetter() {
  const { denial, appeal, draftAppeal, submitAppeal, markAppealWon } = useDemoState()

  if (!denial.received) return null

  const activeIndex = appeal.status === 'none' ? -1 : appeal.status === 'draft' ? 0 : appeal.status === 'submitted' ? 1 : 2
  const variant = appeal.status === 'lost' ? 'danger' : appeal.status === 'won' ? 'success' : 'default'
  const outcomeLabel = appeal.status === 'won' ? 'Won' : appeal.status === 'lost' ? 'Lost' : 'Outcome'
  const displaySteps = ['Draft', 'Submitted', outcomeLabel]

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Appeal letter</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {appeal.letterText ? (
          <pre className="max-h-96 overflow-auto rounded-md border border-border bg-muted/50 p-4 text-xs leading-relaxed whitespace-pre-wrap text-foreground" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
            {appeal.letterText}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">
            Draft the appeal to auto-generate a payer-specific letter citing the matched guideline.
          </p>
        )}

        {appeal.status !== 'none' && (
          <div className="border-t border-border pt-4">
            <StatusTracker steps={displaySteps} activeIndex={activeIndex} variant={variant} />
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-start gap-2">
        {appeal.status === 'none' && (
          <Button type="button" onClick={draftAppeal}>
            Draft Appeal Letter
          </Button>
        )}
        {appeal.status === 'draft' && (
          <Button type="button" onClick={submitAppeal}>
            Submit Appeal
          </Button>
        )}
        {appeal.status === 'submitted' && (
          <Button type="button" onClick={markAppealWon}>
            Mark Appeal Won
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
