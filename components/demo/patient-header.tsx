'use client'

import { useDemoState } from '@/lib/demo/context'

function formatDob(dob: string) {
  return new Date(`${dob}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function PatientHeader() {
  const { patient } = useDemoState()
  const deductibleRemaining = Math.max(patient.plan.deductibleTotal - patient.plan.deductibleMet, 0)

  return (
    <header className="patient-header flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-border bg-background px-4 py-3 md:px-6 md:py-4">
      <div>
        <p className="text-[9px] font-semibold tracking-[.2em] text-muted-foreground uppercase">Patient</p>
        <h1 className="mt-1 text-2xl leading-none">{patient.name}</h1>
      </div>
      <div className="hidden sm:block">
        <p className="text-[9px] font-semibold tracking-[.2em] text-muted-foreground uppercase">Date of Birth</p>
        <p className="mt-1 text-sm">{formatDob(patient.dob)}</p>
      </div>
      <div className="hidden sm:block">
        <p className="text-[9px] font-semibold tracking-[.2em] text-muted-foreground uppercase">Plan</p>
        <p className="mt-1 text-sm">
          {patient.plan.payerName} · {patient.plan.planType}
        </p>
      </div>
      <div className="hidden md:block">
        <p className="text-[9px] font-semibold tracking-[.2em] text-muted-foreground uppercase">Deductible Remaining</p>
        <p className="mt-1 text-sm">
          ${deductibleRemaining.toLocaleString()} of ${patient.plan.deductibleTotal.toLocaleString()}
        </p>
      </div>
      <span className="sample-patient-label">Sample patient</span>
    </header>
  )
}
