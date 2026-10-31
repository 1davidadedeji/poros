export interface InsurancePlan {
  payerName: string
  planType: string
  deductibleTotal: number
  deductibleMet: number
  coinsuranceRate: number
  officeCopay: number
}

export interface Patient {
  id: string
  name: string
  dob: string
  plan: InsurancePlan
  clinicalNote: string
}

export interface CptCode {
  code: string
  description: string
  requiresPriorAuth: boolean
  allowedAmount: number
  isCopayBased: boolean
}

export interface GuidelineSnippet {
  source: string
  text: string
}

export interface DenialReason {
  code: string
  label: string
  guideline: GuidelineSnippet
}

export type PriorAuthStatus = 'none' | 'draft' | 'submitted' | 'approved' | 'denied'
export type AppealStatus = 'none' | 'draft' | 'submitted' | 'won' | 'lost'

export interface EstimateResult {
  cptCode: string
  allowedAmount: number
  deductibleApplied: number
  coinsuranceOwed: number
  copayOwed: number
  patientResponsibility: number
  highRisk: boolean
  plainLanguage: string
}

export interface PriorAuthState {
  status: PriorAuthStatus
  cptCode: string | null
  justification: string | null
  deadline: Date | null
}

export interface DenialState {
  received: boolean
  reasonCode: string | null
  deadlineToAppeal: Date | null
}

export interface CriterionMet {
  criterion: string
  quote: string
}

export interface CriterionGap {
  criterion: string
  reason: string
}

export interface AppealDraft {
  extractedFacts: string[]
  criteriaMet: CriterionMet[]
  criteriaNotSupported: CriterionGap[]
  letterText: string
  warnings: string[]
}

export interface AppealState {
  status: AppealStatus
  letterText: string | null
  source: 'ai' | 'template' | null
  review: AppealDraft | null
  fallbackReason: string | null
  draftedFromNote: string | null
  approved: boolean
}

export type TimelineFlow = 'estimate' | 'prior-auth' | 'appeal' | 'system'

export interface TimelineEvent {
  id: string
  timestamp: Date
  flow: TimelineFlow
  title: string
  description: string
  status?: string
}
