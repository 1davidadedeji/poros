'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { mockPatient } from '@/lib/data/mock-patient'
import { getProcedureByCode } from '@/lib/data/mock-procedures'
import { getDenialByCode } from '@/lib/data/mock-denials'
import type { AppealState, DenialState, EstimateResult, PriorAuthState, TimelineEvent } from '@/lib/data/types'
import { calculateEstimate } from './estimate'
import { addDays, buildJustification, PRIOR_AUTH_WINDOW_DAYS } from './prior-auth'
import { APPEAL_WINDOW_DAYS, draftAppealLetter } from './appeal'

const DEFAULT_DENIAL_CODE = 'CO-50'

interface DemoState {
  patient: typeof mockPatient
  selectedCptCode: string | null
  estimate: EstimateResult | null
  priorAuth: PriorAuthState
  denial: DenialState
  appeal: AppealState
  timeline: TimelineEvent[]
  selectProcedure: (code: string) => void
  generateEstimate: () => void
  generatePriorAuthRequest: () => void
  submitPriorAuth: () => void
  simulateDenial: () => void
  draftAppeal: () => void
  submitAppeal: () => void
  markAppealWon: () => void
  resetDemo: () => void
}

const initialPriorAuth: PriorAuthState = { status: 'none', cptCode: null, justification: null, deadline: null }
const initialDenial: DenialState = { received: false, reasonCode: null, deadlineToAppeal: null }
const initialAppeal: AppealState = { status: 'none', letterText: null }

const DemoContext = createContext<DemoState | null>(null)

let eventCounter = 0
function nextEventId() {
  eventCounter += 1
  return `evt-${eventCounter}`
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [selectedCptCode, setSelectedCptCode] = useState<string | null>(null)
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const [priorAuth, setPriorAuth] = useState<PriorAuthState>(initialPriorAuth)
  const [denial, setDenial] = useState<DenialState>(initialDenial)
  const [appeal, setAppeal] = useState<AppealState>(initialAppeal)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])

  const pushEvent = useCallback((event: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
    setTimeline((prev) => [...prev, { ...event, id: nextEventId(), timestamp: new Date() }])
  }, [])

  const selectProcedure = useCallback((code: string) => {
    setSelectedCptCode(code)
    setEstimate(null)
  }, [])

  const generateEstimate = useCallback(() => {
    if (!selectedCptCode) return
    const procedure = getProcedureByCode(selectedCptCode)
    if (!procedure) return
    const result = calculateEstimate(procedure, mockPatient.plan)
    setEstimate(result)
    pushEvent({
      flow: 'estimate',
      title: 'Cost estimate generated',
      description: `${procedure.code} — ${procedure.description}: ${result.plainLanguage}`,
      status: result.highRisk ? 'High risk of surprise bill' : 'Standard estimate',
    })
  }, [selectedCptCode, pushEvent])

  const generatePriorAuthRequest = useCallback(() => {
    if (!selectedCptCode) return
    const procedure = getProcedureByCode(selectedCptCode)
    if (!procedure) return
    const justification = buildJustification(procedure, mockPatient)
    setPriorAuth({ status: 'draft', cptCode: procedure.code, justification, deadline: null })
    pushEvent({
      flow: 'prior-auth',
      title: 'Prior authorization request drafted',
      description: `Request drafted for ${procedure.code} using the visit's clinical documentation.`,
      status: 'Draft',
    })
  }, [selectedCptCode, pushEvent])

  const submitPriorAuth = useCallback(() => {
    setPriorAuth((prev) => {
      if (prev.status !== 'draft') return prev
      const deadline = addDays(new Date(), PRIOR_AUTH_WINDOW_DAYS)
      return { ...prev, status: 'submitted', deadline }
    })
    pushEvent({
      flow: 'prior-auth',
      title: 'Prior authorization submitted',
      description: `Request sent to ${mockPatient.plan.payerName}. Decision expected within ${PRIOR_AUTH_WINDOW_DAYS} days.`,
      status: 'Submitted',
    })
  }, [pushEvent])

  const simulateDenial = useCallback(() => {
    setPriorAuth((prev) => (prev.status === 'submitted' ? { ...prev, status: 'denied' } : prev))
    const deadlineToAppeal = addDays(new Date(), APPEAL_WINDOW_DAYS)
    setDenial({ received: true, reasonCode: DEFAULT_DENIAL_CODE, deadlineToAppeal })
    const reason = getDenialByCode(DEFAULT_DENIAL_CODE)
    pushEvent({
      flow: 'prior-auth',
      title: 'Prior authorization denied',
      description: `${mockPatient.plan.payerName} denied the request — ${reason?.code}: ${reason?.label}.`,
      status: 'Denied',
    })
  }, [pushEvent])

  const draftAppeal = useCallback(() => {
    if (!selectedCptCode || !denial.reasonCode) return
    const procedure = getProcedureByCode(selectedCptCode)
    if (!procedure) return
    const letterText = draftAppealLetter(mockPatient, procedure, denial.reasonCode)
    setAppeal({ status: 'draft', letterText })
    pushEvent({
      flow: 'appeal',
      title: 'Appeal letter drafted',
      description: `Appeal drafted citing ${getDenialByCode(denial.reasonCode)?.guideline.source}.`,
      status: 'Draft',
    })
  }, [selectedCptCode, denial.reasonCode, pushEvent])

  const submitAppeal = useCallback(() => {
    setAppeal((prev) => (prev.status === 'draft' ? { ...prev, status: 'submitted' } : prev))
    pushEvent({
      flow: 'appeal',
      title: 'Appeal submitted',
      description: `Appeal sent to ${mockPatient.plan.payerName} before the appeal deadline.`,
      status: 'Submitted',
    })
  }, [pushEvent])

  const markAppealWon = useCallback(() => {
    setAppeal((prev) => (prev.status === 'submitted' ? { ...prev, status: 'won' } : prev))
    pushEvent({
      flow: 'appeal',
      title: 'Appeal won',
      description: `${mockPatient.plan.payerName} reversed the denial. Procedure is now authorized.`,
      status: 'Won',
    })
  }, [pushEvent])

  const resetDemo = useCallback(() => {
    setSelectedCptCode(null)
    setEstimate(null)
    setPriorAuth(initialPriorAuth)
    setDenial(initialDenial)
    setAppeal(initialAppeal)
    setTimeline([])
  }, [])

  const value = useMemo<DemoState>(
    () => ({
      patient: mockPatient,
      selectedCptCode,
      estimate,
      priorAuth,
      denial,
      appeal,
      timeline,
      selectProcedure,
      generateEstimate,
      generatePriorAuthRequest,
      submitPriorAuth,
      simulateDenial,
      draftAppeal,
      submitAppeal,
      markAppealWon,
      resetDemo,
    }),
    [
      selectedCptCode,
      estimate,
      priorAuth,
      denial,
      appeal,
      timeline,
      selectProcedure,
      generateEstimate,
      generatePriorAuthRequest,
      submitPriorAuth,
      simulateDenial,
      draftAppeal,
      submitAppeal,
      markAppealWon,
      resetDemo,
    ],
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemoState() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemoState must be used within a DemoProvider')
  return ctx
}
