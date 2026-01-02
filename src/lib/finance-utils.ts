import { addDays, addWeeks, addMonths } from 'date-fns';

export type PaymentFrequency = 'SEMANAL' | 'QUINCENAL' | 'MENSUAL';

export interface AmortizationItem {
  number: number;
  date: Date;
  amount: number;      // Cuota Total
  principal: number;   // Capital
  interest: number;    // Interés
  balance: number;     // Saldo Restante
}

export interface AmortizationResult {
  quotaAmount: number;
  totalInterest: number;
  totalPayable: number;
  schedule: AmortizationItem[];
}

/**
 * Calculates amortization schedule using Simple Interest (Flat Rate).
 * Total Interest = Principal * (Rate / 100)
 * Total Payable = Principal + Total Interest
 * Quota = Total Payable / Number of Installments
 */
export function calculateAmortization(
  principal: number,
  rate: number, // Annual rate in percentage (e.g., 18 for 18%)
  installments: number,
  frequency: PaymentFrequency,
  startDate: Date = new Date()
): AmortizationResult {
  // 1. Calculate Totals (Simple Interest Logic)
  // Note: Usually "Flat Rate" implies the rate is applied to the full principal for the full term.
  // However, strict "Annual Rate" interpretation might require time adjustment.
  // GIVEN THE USER REQUEST: "Monto total + interés dividido entre cuotas",
  // we assume the 'rate' provided is the TOTAL interest percentage to apply, 
  // OR it's an annual rate applied proportionally to the time.
  // Let's stick to the simplest interpretation often used in local lending: 
  // "Tasa" is often "Tasa Mensual" in informal lending, or "Tasa Anual" in formal.
  // Let's assume Tasa Anual for consistency with the audit.
  
  // Actually, standard "Flat Rate" usually means: Interest = P * R * T
  // Let's calculate Time (T) in years.
  let timeInYears = 0;
  if (frequency === 'MENSUAL') timeInYears = installments / 12;
  else if (frequency === 'QUINCENAL') timeInYears = installments / 24;
  else if (frequency === 'SEMANAL') timeInYears = installments / 52;

  // Total Interest = P * (R/100) * T
  const totalInterest = principal * (rate / 100) * timeInYears;
  
  // Total to Pay
  const totalPayable = principal + totalInterest;
  
  // Quota Amount (Fixed)
  const quotaAmount = totalPayable / installments;

  // 2. Generate Schedule
  const schedule: AmortizationItem[] = [];
  let currentBalance = totalPayable;
  let currentDate = startDate;

  // Values per quota for breakdown
  const interestPerQuota = totalInterest / installments;
  const principalPerQuota = principal / installments;

  for (let i = 1; i <= installments; i++) {
    // Calculate Date
    if (frequency === 'SEMANAL') currentDate = addWeeks(currentDate, 1);
    else if (frequency === 'QUINCENAL') currentDate = addDays(currentDate, 15);
    else if (frequency === 'MENSUAL') currentDate = addMonths(currentDate, 1);

    currentBalance -= quotaAmount;

    schedule.push({
      number: i,
      date: new Date(currentDate),
      amount: Number(quotaAmount.toFixed(2)),
      principal: Number(principalPerQuota.toFixed(2)),
      interest: Number(interestPerQuota.toFixed(2)),
      balance: Math.max(0, Number(currentBalance.toFixed(2)))
    });
  }

  return {
    quotaAmount: Number(quotaAmount.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    totalPayable: Number(totalPayable.toFixed(2)),
    schedule
  };
}
