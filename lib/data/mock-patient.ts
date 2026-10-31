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
}
