import { getDenialByCode } from '@/lib/data/mock-denials'
import type { CptCode, Patient } from '@/lib/data/types'

export const APPEAL_WINDOW_DAYS = 30

export function draftAppealLetter(patient: Patient, procedure: CptCode, denialCode: string): string {
  const denial = getDenialByCode(denialCode)
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (!denial) {
    return `${today}\n\nRe: Appeal of denied claim for ${patient.name}, procedure ${procedure.code}\n\nWe are appealing this denial and request reconsideration based on the enclosed clinical documentation.`
  }

  return `${today}

Re: Appeal of Adverse Determination — ${patient.name} (DOB ${patient.dob})
Procedure: ${procedure.code} — ${procedure.description}
Denial Reason: ${denial.code} — ${denial.label}

To the Utilization Review Department,

We are writing to formally appeal the denial of the above-referenced procedure for our patient, ${patient.name}. The stated reason for denial was "${denial.label}."

${denial.guideline.text}

The patient's clinical record satisfies these requirements. Prior to this request, ${patient.name} completed a documented course of conservative management, including a corticosteroid injection (CPT 20610) and physical therapy (CPT 97110), without resolution of symptoms. Examination findings — including joint-line tenderness and a positive McMurray test — support the medical necessity of the requested procedure.

We respectfully request that this determination be reversed and the procedure authorized. Supporting clinical documentation, including the treating provider's notes, is enclosed for your review.

Please contact our office if any additional information is required.

Sincerely,
Care Coordination Team
on behalf of ${patient.name}'s treating provider

Reference: ${denial.guideline.source}`
}
