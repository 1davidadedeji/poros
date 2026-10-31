'use client'

import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { usePrefersReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion'

export function CostScenario() {
  const [deductible, setDeductible] = useState(150)
  const reduced = usePrefersReducedMotion()
  const data = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map(allowed => ({
    allowed, patient: Math.min(allowed, deductible) + Math.max(0, allowed - deductible) * .2,
  }))
  return <div className="cost-scenario">
    <div className="tool-heading"><span>SEE HOW AN ESTIMATE CHANGES</span><span>20% coinsurance</span></div>
    <h3>Different benefits.<br />A different bottom line.</h3>
    <div className="scenario-controls" role="group" aria-label="Remaining deductible">
      {[0, 150, 500].map(value => <button key={value} type="button" aria-pressed={deductible === value} onClick={() => setDeductible(value)}>${value} deductible</button>)}
    </div>
    <div className="scenario-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 12, right: 12, bottom: 8, left: -10 }} accessibilityLayer>
      <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 5" />
      <XAxis dataKey="allowed" tickCount={4} minTickGap={40} tickFormatter={v => `$${v}`} tick={{ fill: 'var(--muted-text)', fontSize: 10 }} axisLine={false} tickLine={false} />
      <YAxis domain={[0, 700]} tickFormatter={v => `$${v}`} tick={{ fill: 'var(--muted-text)', fontSize: 10 }} axisLine={false} tickLine={false} />
      <Tooltip formatter={value => [`$${value}`, 'Patient estimate']} labelFormatter={value => `$${value} allowed amount`} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: 12 }} />
      <Area type="linear" dataKey="patient" stroke="var(--teal-dark)" strokeWidth={2} fill="var(--teal)" fillOpacity={.1} isAnimationActive={!reduced} animationDuration={500} />
    </AreaChart></ResponsiveContainer></div>
    <p className="scenario-result" aria-live="polite">At a $1,000 allowed amount, the patient estimate is <strong>${data[data.length - 1].patient}</strong>.</p>
    <p className="tool-note">Illustrative calculation. Horizontal axis: allowed amount. Vertical axis: patient estimate. Excludes copays and out-of-pocket limits.</p>
  </div>
}
