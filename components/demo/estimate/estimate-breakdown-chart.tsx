'use client'

import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import type { EstimateResult } from '@/lib/data/types'
import { useThemeToggle } from '@/lib/theme/use-theme-toggle'
import { CHART_COLORS } from '@/lib/theme/chart-colors'

function moneyLabel(value: unknown) {
  const num = typeof value === 'number' ? value : 0
  return num > 0 ? `$${num.toLocaleString()}` : ''
}

export function EstimateBreakdownChart({ estimate }: { estimate: EstimateResult }) {
  const { darkMode } = useThemeToggle()
  const colors = darkMode ? CHART_COLORS.dark : CHART_COLORS.light

  const alreadyCovered = Math.max(estimate.allowedAmount - estimate.patientResponsibility, 0)
  const data = [
    {
      name: 'breakdown',
      deductible: estimate.deductibleApplied,
      coinsurance: estimate.coinsuranceOwed,
      covered: alreadyCovered,
    },
  ]

  return (
    <div style={{ height: 64 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" hide />
          <Bar dataKey="deductible" stackId="a" fill={colors.tealDark} radius={[3, 0, 0, 3]}>
            <LabelList dataKey="deductible" position="center" formatter={moneyLabel} fill={colors.soft} fontSize={11} fontWeight={600} />
          </Bar>
          <Bar dataKey="coinsurance" stackId="a" fill={colors.teal}>
            <LabelList dataKey="coinsurance" position="center" formatter={moneyLabel} fill={colors.soft} fontSize={11} fontWeight={600} />
          </Bar>
          <Bar dataKey="covered" stackId="a" fill={colors.soft} radius={[0, 3, 3, 0]}>
            <LabelList dataKey="covered" position="center" formatter={moneyLabel} fill={colors.mutedText} fontSize={11} fontWeight={600} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-1 flex gap-4 text-[10px] font-semibold tracking-[.08em] text-muted-foreground uppercase">
        <span style={{ color: colors.tealDark }}>■ Deductible</span>
        <span style={{ color: colors.teal }}>■ Coinsurance</span>
        <span style={{ color: colors.mutedText }}>■ Already covered</span>
      </div>
    </div>
  )
}
