import type { CptCode, EstimateResult, InsurancePlan } from '@/lib/data/types'

const HIGH_RISK_THRESHOLD = 300

export function calculateEstimate(procedure: CptCode, plan: InsurancePlan): EstimateResult {
  if (procedure.isCopayBased) {
    const patientResponsibility = plan.officeCopay
    return {
      cptCode: procedure.code,
      allowedAmount: procedure.allowedAmount,
      deductibleApplied: 0,
      coinsuranceOwed: 0,
      copayOwed: patientResponsibility,
      patientResponsibility,
      highRisk: false,
      plainLanguage: `Based on your plan, you'll owe a $${patientResponsibility} copay for this visit.`,
    }
  }

  const deductibleRemaining = Math.max(plan.deductibleTotal - plan.deductibleMet, 0)
  const deductibleApplied = Math.min(deductibleRemaining, procedure.allowedAmount)
  const remainderAfterDeductible = procedure.allowedAmount - deductibleApplied
  const coinsuranceOwed = Math.round(remainderAfterDeductible * plan.coinsuranceRate)
  const patientResponsibility = deductibleApplied + coinsuranceOwed

  const highRisk =
    patientResponsibility >= HIGH_RISK_THRESHOLD ||
    (procedure.requiresPriorAuth && procedure.allowedAmount >= HIGH_RISK_THRESHOLD)

  return {
    cptCode: procedure.code,
    allowedAmount: procedure.allowedAmount,
    deductibleApplied,
    coinsuranceOwed,
    copayOwed: 0,
    patientResponsibility,
    highRisk,
    plainLanguage: `Based on your plan, you'll likely owe around $${patientResponsibility} for this visit${
      deductibleApplied > 0 ? ` (${deductibleApplied} toward your deductible, ${coinsuranceOwed} in coinsurance)` : ''
    }.`,
  }
}
