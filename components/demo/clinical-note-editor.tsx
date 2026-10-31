'use client'

import { useId } from 'react'

import { DRAFT_NOTE_MAX } from '@/lib/demo/draft'
import { useDemoState } from '@/lib/demo/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ClinicalNoteEditor({ description }: { description: string }) {
  const { patient, clinicalNote, setClinicalNote } = useDemoState()
  const id = useId()
  const edited = clinicalNote !== patient.clinicalNote

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>
          <label htmlFor={id}>Clinical note</label>
        </CardTitle>
        {edited && (
          <Button type="button" variant="outline" size="sm" onClick={() => setClinicalNote(patient.clinicalNote)}>
            Restore sample note
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {description} Sample patient only. Don’t enter real patient information.
        </p>
        <textarea
          id={id}
          aria-describedby={`${id}-hint`}
          value={clinicalNote}
          maxLength={DRAFT_NOTE_MAX}
          rows={6}
          onChange={(event) => setClinicalNote(event.target.value)}
          className="w-full resize-y rounded-md border border-border bg-muted/50 p-3 text-sm leading-relaxed text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
        <p className="text-right text-[10px] text-muted-foreground tabular-nums">
          {clinicalNote.length.toLocaleString()} / {DRAFT_NOTE_MAX.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  )
}
