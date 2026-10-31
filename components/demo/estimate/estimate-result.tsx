'use client'

import { motion } from 'framer-motion'
import { usePrefersReducedMotion as useReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion'

import { useDemoState } from '@/lib/demo/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EstimateBreakdownChart } from './estimate-breakdown-chart'

export function EstimateResult() {
  const { estimate } = useDemoState()
  const reduceMotion = useReducedMotion()

  if (!estimate) {
    return (
      <Card>
        <CardContent className="pt-5 text-sm text-muted-foreground">
          Select a procedure and generate an estimate to see what the patient will likely owe.
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      key={estimate.cptCode}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Estimate</CardTitle>
        {estimate.highRisk && <Badge variant="danger">High risk of surprise bill</Badge>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
          {estimate.plainLanguage}
        </p>
        {!estimate.copayOwed && <EstimateBreakdownChart estimate={estimate} />}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-[9px] font-semibold tracking-[.14em] text-muted-foreground uppercase">
              Allowed amount
            </dt>
            <dd className="mt-1">${estimate.allowedAmount.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-[9px] font-semibold tracking-[.14em] text-muted-foreground uppercase">
              Applied to deductible
            </dt>
            <dd className="mt-1">${estimate.deductibleApplied.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-[9px] font-semibold tracking-[.14em] text-muted-foreground uppercase">
              Coinsurance
            </dt>
            <dd className="mt-1">${estimate.coinsuranceOwed.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-[9px] font-semibold tracking-[.14em] text-muted-foreground uppercase">
              Patient owes
            </dt>
            <dd className="mt-1 font-semibold">${estimate.patientResponsibility.toLocaleString()}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
    </motion.div>
  )
}
