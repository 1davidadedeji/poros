'use client'

import Link from 'next/link'

import { getProcedureByCode } from '@/lib/data/mock-procedures'
import { useDemoState } from '@/lib/demo/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusTracker } from '@/components/demo/status-tracker'
import { DeadlineCountdown } from './deadline-countdown'

const STEPS = ['Draft', 'Submitted', 'Decision']

export function PriorAuthRequest() {
  const { selectedCptCode, patient, priorAuth, denial, generatePriorAuthRequest, submitPriorAuth, simulateDenial } =
    useDemoState()

  if (!selectedCptCode) {
    return (
      <Card>
        <CardContent className="pt-5 text-sm text-muted-foreground">
          No procedure selected yet.{' '}
          <Link href="/demo/estimate" className="font-semibold text-primary underline underline-offset-2">
            Pick a procedure in Cost Estimate
          </Link>{' '}
          to see if it needs prior authorization.
        </CardContent>
      </Card>
    )
  }

  const procedure = getProcedureByCode(selectedCptCode)
  if (!procedure) return null

  if (!procedure.requiresPriorAuth) {
    return (
      <Card>
        <CardContent className="pt-5 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{procedure.code}</span> does not require prior
          authorization — this procedure can proceed directly to scheduling.
        </CardContent>
      </Card>
    )
  }

  const activeIndex = priorAuth.status === 'none' ? -1 : priorAuth.status === 'draft' ? 0 : 1
  const trackerVariant = priorAuth.status === 'denied' ? 'danger' : 'default'
  const displaySteps = priorAuth.status === 'denied' ? ['Draft', 'Submitted', 'Denied'] : STEPS

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>
          {procedure.code} — {procedure.description}
        </CardTitle>
        <Badge variant="warning">Requires prior auth</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <p className="text-[9px] font-semibold tracking-[.14em] text-muted-foreground uppercase">Payer</p>
          <p className="mt-1 text-sm">{patient.plan.payerName}</p>
        </div>

        <div>
          <p className="text-[9px] font-semibold tracking-[.14em] text-muted-foreground uppercase">
            Clinical justification
          </p>
          <p className="mt-1 rounded-md border border-border bg-muted/50 p-3 text-sm leading-relaxed text-foreground">
            {priorAuth.justification ?? procedure.clinicalNote}
          </p>
        </div>

        {priorAuth.status !== 'none' && (
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <StatusTracker steps={displaySteps} activeIndex={activeIndex} variant={trackerVariant} />
            {priorAuth.deadline && priorAuth.status === 'submitted' && (
              <DeadlineCountdown deadline={priorAuth.deadline} label="Decision expected" />
            )}
            {priorAuth.status === 'denied' && (
              <p className="text-sm text-destructive">
                Denied — {denial.reasonCode}.{' '}
                <Link href="/demo/appeal" className="font-semibold underline underline-offset-2">
                  Start the appeal
                </Link>
                .
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-start gap-2">
        {priorAuth.status === 'none' && (
          <Button type="button" onClick={generatePriorAuthRequest}>
            Generate Prior Auth Request
          </Button>
        )}
        {priorAuth.status === 'draft' && (
          <Button type="button" onClick={submitPriorAuth}>
            Submit for Authorization
          </Button>
        )}
        {priorAuth.status === 'submitted' && (
          <Button type="button" variant="outline" onClick={simulateDenial}>
            Simulate Denial
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
