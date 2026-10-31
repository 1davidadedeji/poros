import type { Patient } from './types'

export const mockPatient: Patient = {
  id: 'pt-1024',
  name: 'Maria Torres',
  dob: '1979-03-14',
  plan: {
    payerName: 'Meridian Health Alliance',
    planType: 'PPO',
    deductibleTotal: 2500,
    deductibleMet: 1150,
    coinsuranceRate: 0.2,
    officeCopay: 35,
  },
  // Default text for the editable note on /demo/prior-auth and /demo/appeal.
  clinicalNote:
    '46-year-old female presents with 8 weeks of right knee pain and intermittent locking following a twisting injury sustained while gardening. Failed conservative management including NSAIDs and one corticosteroid injection (CPT 20610, administered 6 weeks prior) with minimal relief; completed a 4-week course of physical therapy (CPT 97110) without resolution of symptoms. Exam notable for joint-line tenderness and a positive McMurray test, no effusion. Plan: MRI right knee without contrast to evaluate for meniscal tear; proceed to arthroscopic partial meniscectomy if a surgical lesion is confirmed and symptoms persist despite completed conservative treatment.',
}
