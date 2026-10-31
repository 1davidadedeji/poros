'use client'

import Link from 'next/link'

import { getDenialByCode } from '@/lib/data/mock-denials'
import { useDemoState } from '@/lib/demo/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeadlineCountdown } from '@/components/demo/prior-auth/deadline-countdown'

export function DenialSummary() {
  const { denial } = useDemoState()

  if (!denial.received || !denial.reasonCode) {
    return (
      <Card>
        <CardContent className="pt-5 text-sm text-muted-foreground">
          No denial on file yet.{' '}
          <Link href="/demo/prior-auth" className="font-semibold text-primary underline underline-offset-2">
            Submit the prior auth request
          </Link>{' '}
          and simulate a denial to start an appeal.
        </CardContent>
      </Card>
    )
  }

  const reason = getDenialByCode(denial.reasonCode)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Denial received</CardTitle>
        <Badge variant="danger">{reason?.code}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm">{reason?.label}</p>
        {denial.deadlineToAppeal && <DeadlineCountdown deadline={denial.deadlineToAppeal} label="Appeal due" />}
      </CardContent>
    </Card>
  )
}
