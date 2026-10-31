'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

import { mockPatient } from '@/lib/data/mock-patient'
import { getProcedureByCode } from '@/lib/data/mock-procedures'
import { getDenialByCode } from '@/lib/data/mock-denials'
import type { AppealDraft, AppealState, DenialState, EstimateResult, PriorAuthState, TimelineEvent } from '@/lib/data/types'
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
  drafting: boolean
  clinicalNote: string
  timeline: TimelineEvent[]
  setClinicalNote: (note: string) => void
  selectProcedure: (code: string) => void
  generateEstimate: () => void
  generatePriorAuthRequest: () => void
  submitPriorAuth: () => void
  simulateDenial: () => void
  draftAppeal: () => Promise<void>
  approveAppeal: (letterText: string) => void
  submitAppeal: () => void
  markAppealWon: () => void
  resetDemo: () => void
}

const initialPriorAuth: PriorAuthState = { status: 'none', cptCode: null, justification: null, deadline: null }
const initialDenial: DenialState = { received: false, reasonCode: null, deadlineToAppeal: null }
const initialAppeal: AppealState = {
  status: 'none',
  letterText: null,
  source: null,
  review: null,
  fallbackReason: null,
  draftedFromNote: null,
  approved: false,
}

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
  const [clinicalNote, setClinicalNoteState] = useState(mockPatient.clinicalNote)
  const [drafting, setDrafting] = useState(false)
  // Bumped on reset so a draft that returns afterwards is discarded.
  const draftRun = useRef(0)

  const pushEvent = useCallback((event: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
    setTimeline((prev) => [...prev, { ...event, id: nextEventId(), timestamp: new Date() }])
  }, [])

  const setClinicalNote = useCallback((note: string) => {
    setClinicalNoteState(note)
    // An unsubmitted request follows the note; a submitted one keeps what was sent.
    setPriorAuth((prev) => {
      const procedure = prev.cptCode ? getProcedureByCode(prev.cptCode) : undefined
      if (prev.status !== 'draft' || !procedure) return prev
      return { ...prev, justification: buildJustification(procedure, mockPatient, note) }
    })
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
    const justification = buildJustification(procedure, mockPatient, clinicalNote)
    setPriorAuth({ status: 'draft', cptCode: procedure.code, justification, deadline: null })
    pushEvent({
      flow: 'prior-auth',
      title: 'Prior authorization request drafted',
      description: `Request drafted for ${procedure.code} using the visit's clinical documentation.`,
      status: 'Draft',
    })
  }, [selectedCptCode, clinicalNote, pushEvent])

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

  const draftAppeal = useCallback(async () => {
    if (!selectedCptCode || !denial.reasonCode || drafting || appeal.approved) return
    const procedure = getProcedureByCode(selectedCptCode)
    const reason = getDenialByCode(denial.reasonCode)
    if (!procedure || !reason) return
    const run = ++draftRun.current
    const note = clinicalNote
    setDrafting(true)
    let draft: AppealDraft | null = null
    let fallbackReason: string | null = null
    try {
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ denialCode: reason.code, procedureCode: procedure.code, note }),
        signal: AbortSignal.timeout(35000),
      })
      const data = (await response.json().catch(() => ({}))) as { draft?: AppealDraft; error?: string }
      if (response.ok && data.draft) draft = data.draft
      else fallbackReason = data.error ?? 'AI drafting is temporarily unavailable.'
    } catch {
      fallbackReason = 'AI drafting did not respond in time.'
    }
    if (run !== draftRun.current) return
    setDrafting(false)
    setAppeal({
      status: 'draft',
      letterText: draft ? draft.letterText : draftAppealLetter(mockPatient, procedure, reason.code),
      source: draft ? 'ai' : 'template',
      review: draft,
      fallbackReason,
      draftedFromNote: note,
      approved: false,
    })
    pushEvent({
      flow: 'appeal',
      title: draft ? 'Appeal letter drafted from the note' : 'Appeal letter drafted from template',
      description: draft
        ? `AI draft citing ${reason.guideline.source}: ${draft.criteriaMet.length} criteria supported by the note, ${draft.criteriaNotSupported.length} not supported. Awaiting staff review.`
        : `Template letter citing ${reason.guideline.source}. ${fallbackReason} Awaiting staff review.`,
      status: 'Needs review',
    })
  }, [selectedCptCode, denial.reasonCode, drafting, appeal.approved, clinicalNote, pushEvent])

  const approveAppeal = useCallback(
    (letterText: string) => {
      if (appeal.status !== 'draft' || appeal.approved || !letterText.trim()) return
      setAppeal((prev) => ({ ...prev, letterText: letterText.trim(), approved: true }))
      pushEvent({
        flow: 'appeal',
        title: 'Appeal letter approved',
        description: 'Staff reviewed the letter against the clinical note and matched guideline.',
        status: 'Approved',
      })
    },
    [appeal.status, appeal.approved, pushEvent],
  )

  const submitAppeal = useCallback(() => {
    if (appeal.status !== 'draft' || !appeal.approved) return
    setAppeal((prev) => ({ ...prev, status: 'submitted' }))
    pushEvent({
      flow: 'appeal',
      title: 'Appeal submitted',
      description: `Appeal sent to ${mockPatient.plan.payerName} before the appeal deadline.`,
      status: 'Submitted',
    })
  }, [appeal.status, appeal.approved, pushEvent])

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
    setClinicalNoteState(mockPatient.clinicalNote)
    setDrafting(false)
    draftRun.current += 1
  }, [])

  const value = useMemo<DemoState>(
    () => ({
      patient: mockPatient,
      selectedCptCode,
      estimate,
      priorAuth,
      denial,
      appeal,
      drafting,
      clinicalNote,
      timeline,
      setClinicalNote,
      selectProcedure,
      generateEstimate,
      generatePriorAuthRequest,
      submitPriorAuth,
      simulateDenial,
      draftAppeal,
      approveAppeal,
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
      drafting,
      clinicalNote,
      timeline,
      setClinicalNote,
      selectProcedure,
      generateEstimate,
      generatePriorAuthRequest,
      submitPriorAuth,
      simulateDenial,
      draftAppeal,
      approveAppeal,
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
