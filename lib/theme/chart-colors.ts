export const CHART_COLORS = {
  light: {
    teal: '#147d73',
    tealDark: '#0d514b',
    gold: '#b4914e',
    soft: '#d9e6df',
    ink: '#172321',
    mutedText: '#53615e',
    destructive: '#c0413a',
  },
  dark: {
    teal: '#4ac4b4',
    tealDark: '#8fe4d6',
    gold: '#d4b36b',
    soft: '#1b302b',
    ink: '#e5efeb',
    mutedText: '#a9bbb5',
    destructive: '#d9695f',
  },
} as const

export type ChartPalette = (typeof CHART_COLORS)['light']
