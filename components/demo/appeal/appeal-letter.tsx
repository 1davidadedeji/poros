'use client'

import { useState } from 'react'

import { useDemoState } from '@/lib/demo/context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { StatusTracker } from '@/components/demo/status-tracker'
import { DraftReview } from './draft-review'

const letterClass =
  'w-full rounded-md border border-border bg-muted/50 p-4 text-xs leading-relaxed whitespace-pre-wrap text-foreground'
const letterFont = { fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }

export function AppealLetter() {
  const { denial, appeal, drafting, clinicalNote, draftAppeal, approveAppeal, submitAppeal, markAppealWon } =
    useDemoState()
  const [letter, setLetter] = useState(appeal.letterText ?? '')
  const [checked, setChecked] = useState(false)
  const [shownDraft, setShownDraft] = useState(appeal.letterText)
  // A new draft replaces any unapproved edits and clears the review checkbox.
  if (shownDraft !== appeal.letterText) {
    setShownDraft(appeal.letterText)
    setLetter(appeal.letterText ?? '')
    setChecked(false)
  }

  if (!denial.received) return null

  const reviewing = appeal.status === 'draft' && !appeal.approved
  const stale = reviewing && appeal.draftedFromNote !== clinicalNote
  const activeIndex =
    appeal.status === 'none' ? -1 : appeal.status === 'draft' ? (appeal.approved ? 1 : 0) : appeal.status === 'submitted' ? 2 : 3
  const variant = appeal.status === 'lost' ? 'danger' : appeal.status === 'won' ? 'success' : 'default'
  const outcomeLabel = appeal.status === 'won' ? 'Won' : appeal.status === 'lost' ? 'Lost' : 'Outcome'
  const displaySteps = ['Draft', 'Approved', 'Submitted', outcomeLabel]

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>Appeal letter</CardTitle>
        {appeal.source && (
          <Badge variant={appeal.source === 'ai' ? 'default' : 'warning'}>
            {appeal.source === 'ai' ? 'AI draft · needs review' : 'Template draft'}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {appeal.status === 'none' ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {drafting
              ? 'Drafting from the clinical note and matched guideline…'
              : 'Poros sends the clinical note and matched guideline to OpenAI and drafts a letter limited to those two sources. If AI drafting is unavailable, the fixed template is used. Either way, staff review and approve it before it can be submitted.'}
          </p>
        ) : (
          <>
            {stale && (
              <p className="rounded-md border border-[#b4914e]/40 bg-[#b4914e]/10 p-3 text-sm" role="status">
                The clinical note changed after this draft. Redraft so the letter and extracted facts match the note.
              </p>
            )}
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
              <DraftReview appeal={appeal} />
              <div className="flex flex-col gap-2">
                <label htmlFor="appeal-letter" className="text-[9px] font-semibold tracking-[.14em] text-muted-foreground uppercase">
                  {reviewing ? 'Letter · edit before approving' : 'Approved letter'}
                </label>
                {reviewing ? (
                  <textarea
                    id="appeal-letter"
                    value={letter}
                    rows={18}
                    maxLength={8000}
                    onChange={(event) => setLetter(event.target.value)}
                    className={`${letterClass} resize-y focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none`}
                    style={letterFont}
                  />
                ) : (
                  <pre id="appeal-letter" className={`${letterClass} max-h-128 overflow-auto`} style={letterFont}>
                    {appeal.letterText}
                  </pre>
                )}
              </div>
            </div>
            {reviewing && (
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-primary"
                  checked={checked}
                  disabled={stale}
                  onChange={(event) => setChecked(event.target.checked)}
                />
                I checked every statement in the letter against the clinical note and the matched guideline.
              </label>
            )}
            <div className="border-t border-border pt-4">
              <StatusTracker steps={displaySteps} activeIndex={activeIndex} variant={variant} />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex-wrap justify-start gap-2">
        {appeal.status === 'none' && (
          <Button type="button" onClick={draftAppeal} disabled={drafting}>
            {drafting ? 'Drafting…' : 'Draft Appeal Letter'}
          </Button>
        )}
        {reviewing && (
          <>
            <Button type="button" onClick={() => approveAppeal(letter)} disabled={!checked || stale || drafting || !letter.trim()}>
              Approve Letter
            </Button>
            <Button type="button" variant="outline" onClick={draftAppeal} disabled={drafting}>
              {drafting ? 'Redrafting…' : 'Redraft From Note'}
            </Button>
          </>
        )}
        {appeal.status === 'draft' && appeal.approved && (
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
