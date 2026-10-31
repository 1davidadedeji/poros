'use client'

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import { useThemeToggle } from '@/lib/theme/use-theme-toggle'
import { CHART_COLORS } from '@/lib/theme/chart-colors'

const data = [{ name: 'Prior auth', value: 13 }]
const WEEK_HOURS = 40

export function ProblemStatChart() {
  const { darkMode } = useThemeToggle()
  const colors = darkMode ? CHART_COLORS.dark : CHART_COLORS.light

  return (
    <div style={{ height: 92 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 64, bottom: 4, left: 0 }}>
          <XAxis type="number" domain={[0, WEEK_HOURS]} hide />
          <YAxis type="category" dataKey="name" hide />
          <Bar dataKey="value" background={{ fill: colors.soft, radius: 3 }} radius={3} barSize={40}>
            <Cell fill={colors.tealDark} />
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value) => `${value} hrs / week`}
              fill={colors.ink}
              fontSize={20}
              style={{ fontFamily: "'Playfair Display', serif" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
