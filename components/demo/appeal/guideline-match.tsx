'use client'

import { GUIDELINE_LIBRARY_LABEL, getDenialByCode } from '@/lib/data/mock-denials'
import { useDemoState } from '@/lib/demo/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function GuidelineMatch() {
  const { denial } = useDemoState()

  if (!denial.received || !denial.reasonCode) return null

  const reason = getDenialByCode(denial.reasonCode)
  if (!reason) return null

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>Matched guideline</CardTitle>
        <Badge variant="outline">{GUIDELINE_LIBRARY_LABEL}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-[9px] font-semibold tracking-[.14em] text-muted-foreground uppercase">
          {reason.guideline.source}
        </p>
        <p className="text-sm leading-relaxed text-foreground">{reason.guideline.text}</p>
        <p className="text-xs text-muted-foreground">
          Sample guideline library written for this demo. The payer and policy are fictional.
        </p>
      </CardContent>
    </Card>
  )
}
