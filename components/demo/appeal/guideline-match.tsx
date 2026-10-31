'use client'

import { getDenialByCode } from '@/lib/data/mock-denials'
import { useDemoState } from '@/lib/demo/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function GuidelineMatch() {
  const { denial } = useDemoState()

  if (!denial.received || !denial.reasonCode) return null

  const reason = getDenialByCode(denial.reasonCode)
  if (!reason) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matched guideline</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-[9px] font-semibold tracking-[.14em] text-muted-foreground uppercase">
          {reason.guideline.source}
        </p>
        <p className="text-sm leading-relaxed text-foreground">{reason.guideline.text}</p>
      </CardContent>
    </Card>
  )
}
