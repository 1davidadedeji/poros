import type { DenialReason } from './types'

// Meridian Health Alliance and its policies are fictional. Show this label wherever the library appears.
export const GUIDELINE_LIBRARY_LABEL = 'Illustrative, not real payer policy'

export const mockDenials: DenialReason[] = [
  {
    code: 'CO-50',
    label: 'Not deemed a medical necessity by the payer',
    guideline: {
      source: 'Meridian Health Alliance Medical Policy MP-247 — Arthroscopic Partial Meniscectomy',
      text: 'Meridian Health Alliance Medical Policy MP-247, consistent with the AAOS Clinical Practice Guideline on meniscal tears, requires documentation of at least 6 weeks of failed conservative management — physical therapy, NSAIDs, or corticosteroid injection — prior to authorizing arthroscopic partial meniscectomy. Concurrent mechanical symptoms (locking, catching) and a positive provocative exam finding support medical necessity when conservative measures have failed.',
    },
  },
  {
    code: 'CO-197',
    label: 'Precertification / authorization absent',
    guideline: {
      source: 'Meridian Health Alliance Provider Manual, Section 6.2 — Prior Authorization Requirements',
      text: 'Services requiring precertification must have an authorization number on file prior to the date of service. Where clinical documentation supports medical necessity and the request was submitted prior to service, retroactive authorization may be granted on appeal.',
    },
  },
  {
    code: 'PR-204',
    label: 'Service not covered under the patient’s current plan',
    guideline: {
      source: 'Meridian Health Alliance PPO Summary of Benefits, Section 4 — Covered Services',
      text: 'The PPO plan covers medically necessary orthopedic imaging and surgical intervention when conservative treatment has been attempted and documented. Denials citing non-coverage should be verified against the member’s active benefit schedule before an appeal is filed.',
    },
  },
]

export function getDenialByCode(code: string): DenialReason | undefined {
  return mockDenials.find((denial) => denial.code === code)
}
