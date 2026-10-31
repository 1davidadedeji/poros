'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { taskKinds, type WorkItem } from '@/lib/workspace/tasks'
import { usePrefersReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion'

export function WorkflowChart({ items }: { items: WorkItem[] }) {
  const reduced = usePrefersReducedMotion()
  const data = taskKinds.map(kind => ({
    name: kind === 'Prior authorization' ? 'Prior auth' : kind,
    Open: items.filter(item => item.kind === kind && item.status !== 'Completed').length,
    Completed: items.filter(item => item.kind === kind && item.status === 'Completed').length,
  }))
  return <section className="workflow-chart" aria-labelledby="workflow-chart-title">
    <div className="tool-heading"><span>YOUR WORK AT A GLANCE</span><span>{items.length} tasks</span></div>
    <h3 id="workflow-chart-title">A clearer picture.</h3>
    {items.length ? <><div className="chart-legend"><span><i />Open</span><span><i />Completed</span></div><div className="chart-canvas">
      <ResponsiveContainer width="100%" height="100%"><BarChart data={data} barSize={24} margin={{ top: 10, right: 0, bottom: 0, left: -28 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 5" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-text)', fontSize: 11 }} dy={8} />
        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-text)', fontSize: 11 }} />
        <Tooltip cursor={{ fill: 'var(--soft)' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: 12 }} />
        <Bar dataKey="Open" stackId="tasks" fill="var(--teal-dark)" isAnimationActive={!reduced} />
        <Bar dataKey="Completed" stackId="tasks" fill="var(--chart-complete)" isAnimationActive={!reduced} />
      </BarChart></ResponsiveContainer>
    </div><p className="sr-only">{data.map(row => `${row.name}: ${row.Open} open, ${row.Completed} completed.`).join(' ')}</p></> : <p className="chart-empty">Add a task to see your estimates, authorizations, and appeals take shape here.</p>}
  </section>
}
