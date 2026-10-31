import type { CptCode } from './types'

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
  },
  {
    code: '29881',
    description: 'Knee arthroscopy with meniscectomy, medial or lateral',
    requiresPriorAuth: true,
    allowedAmount: 3200,
    isCopayBased: false,
  },
]

export function getProcedureByCode(code: string): CptCode | undefined {
  return mockProcedures.find((procedure) => procedure.code === code)
}
