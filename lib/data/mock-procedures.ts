import type { CptCode } from './types'

const kneeClinicalNote =
  '46-year-old female presents with 8 weeks of right knee pain and intermittent locking following a twisting injury sustained while gardening. Failed conservative management including NSAIDs and one corticosteroid injection (CPT 20610, administered 6 weeks prior) with minimal relief; completed a 4-week course of physical therapy (CPT 97110) without resolution of symptoms. Exam notable for joint-line tenderness and a positive McMurray test, no effusion. Plan: MRI right knee without contrast to evaluate for meniscal tear; proceed to arthroscopic partial meniscectomy if a surgical lesion is confirmed and symptoms persist despite completed conservative treatment.'

export const mockProcedures: CptCode[] = [
  {
    code: '99213',
    description: 'Office visit, established patient, low complexity',
    requiresPriorAuth: false,
    allowedAmount: 110,
    isCopayBased: true,
  },
  {
    code: '20610',
    description: 'Arthrocentesis / injection, major joint (knee)',
    requiresPriorAuth: false,
    allowedAmount: 145,
    isCopayBased: false,
  },
  {
    code: '97110',
    description: 'Therapeutic exercise, per 15 minutes (physical therapy)',
    requiresPriorAuth: false,
    allowedAmount: 42,
    isCopayBased: false,
  },
  {
    code: '73721',
    description: 'MRI, lower extremity joint without contrast (knee)',
    requiresPriorAuth: true,
    allowedAmount: 950,
    isCopayBased: false,
    clinicalNote: kneeClinicalNote,
  },
  {
    code: '29881',
    description: 'Knee arthroscopy with meniscectomy, medial or lateral',
    requiresPriorAuth: true,
    allowedAmount: 3200,
    isCopayBased: false,
    clinicalNote: kneeClinicalNote,
  },
]

export function getProcedureByCode(code: string): CptCode | undefined {
  return mockProcedures.find((procedure) => procedure.code === code)
}
