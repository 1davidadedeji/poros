import type { CptCode, Patient } from '@/lib/data/types'

export const PRIOR_AUTH_WINDOW_DAYS = 10

export function buildJustification(procedure: CptCode, patient: Patient): string {
  if (procedure.clinicalNote) {
    return procedure.clinicalNote
  }
  return `Clinical documentation supports medical necessity of ${procedure.code} (${procedure.description}) for ${patient.name}.`
}

export function addDays(from: Date, days: number): Date {
  const result = new Date(from)
  result.setDate(result.getDate() + days)
  return result
}

export function daysRemaining(deadline: Date, from: Date = new Date()): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.ceil((deadline.getTime() - from.getTime()) / msPerDay)
}
