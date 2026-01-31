/**
 * Tax Calculator - Income Tax Computation Engine
 * Supports both Old and New Tax Regimes with accurate slab-wise calculation
 */

import type { TaxRegime, TaxSettings } from '@/types/payroll';

export interface TaxCalculationInput {
  annualGrossIncome: number;
  regime: TaxRegime;
  basicSalary: number;
  hra: number;
  rentPaid?: number;
  isMetro?: boolean;
  taxSettings: TaxSettings;
  investments?: {
    section80C?: number;
    section80D?: number;
    nps80CCD1B?: number;
    homeLoanInterest?: number;
  };
}

export interface TaxCalculationResult {
  grossIncome: number;
  deductions: Record<string, number>;
  taxableIncome: number;
  taxPayable: number;
  cess: number;
  totalTax: number;
  monthlyTDS: number;
  rebateApplied: boolean;
  slabBreakdown: Array<{
    slab: string;
    income: number;
    rate: number;
    tax: number;
  }>;
}

/**
 * Calculate HRA exemption under Old Tax Regime
 */
function calculateHRAExemption(
  actualHRA: number,
  basicSalary: number,
  rentPaid: number,
  isMetro: boolean
): number {
  if (rentPaid === 0) return 0;

  const exemption1 = actualHRA; // Actual HRA received
  const exemption2 = rentPaid - 0.1 * basicSalary; // Rent - 10% of Basic
  const exemption3 = isMetro ? 0.5 * basicSalary : 0.4 * basicSalary; // 50% or 40% of Basic

  return Math.max(0, Math.min(exemption1, exemption2, exemption3));
}

/**
 * Calculate tax using slab-wise progressive taxation
 */
function calculateSlabwiseTax(
  taxableIncome: number,
  regime: TaxRegime,
  taxSettings: TaxSettings
): { taxPayable: number; slabBreakdown: TaxCalculationResult['slabBreakdown'] } {
  const slabs = taxSettings.slabs
    .filter((s) => s.regime === regime && s.fiscalYear === taxSettings.fiscalYear)
    .sort((a, b) => a.minIncome - b.minIncome);

  let taxPayable = 0;
  const slabBreakdown: TaxCalculationResult['slabBreakdown'] = [];

  for (const slab of slabs) {
    if (taxableIncome <= slab.minIncome) break;

    const applicableIncome = Math.min(
      taxableIncome - slab.minIncome,
      slab.maxIncome - slab.minIncome
    );

    if (applicableIncome > 0) {
      const taxForThisSlab = Math.round((applicableIncome * slab.taxRate) / 100);
      taxPayable += taxForThisSlab;

      slabBreakdown.push({
        slab: `₹${(slab.minIncome / 100000).toFixed(1)}L - ${slab.maxIncome >= 99999999 ? '∞' : `₹${(slab.maxIncome / 100000).toFixed(1)}L`
          }`,
        income: applicableIncome,
        rate: slab.taxRate,
        tax: taxForThisSlab,
      });
    }

    if (taxableIncome <= slab.maxIncome) break;
  }

  return { taxPayable, slabBreakdown };
}

/**
 * Calculate income tax for New Tax Regime
 */
export function calculateNewRegimeTax(
  annualGrossIncome: number,
  taxSettings: TaxSettings
): TaxCalculationResult {
  const standardDeduction = taxSettings.standardDeduction;
  const taxableIncome = Math.max(0, annualGrossIncome - standardDeduction);

  const { taxPayable, slabBreakdown } = calculateSlabwiseTax(
    taxableIncome,
    'new',
    taxSettings
  );

  // Section 87A Rebate: If taxable income ≤ 7L, tax = 0 (as per Budget 2023)
  const rebateApplied = taxableIncome <= 700000;
  const finalTax = rebateApplied ? 0 : taxPayable;

  // Health & Education Cess (4%)
  const cess = Math.round(finalTax * 0.04);
  const totalTax = finalTax + cess;

  return {
    grossIncome: annualGrossIncome,
    deductions: {
      standardDeduction,
    },
    taxableIncome,
    taxPayable: finalTax,
    cess,
    totalTax,
    monthlyTDS: totalTax / 12,
    rebateApplied,
    slabBreakdown,
  };
}

/**
 * Calculate income tax for Old Tax Regime (with deductions)
 */
export function calculateOldRegimeTax(
  input: TaxCalculationInput
): TaxCalculationResult {
  const { annualGrossIncome, basicSalary, hra, rentPaid, isMetro, taxSettings, investments } = input;

  // Calculate all deductions
  const deductions: Record<string, number> = {};

  // Standard Deduction
  deductions.standardDeduction = taxSettings.standardDeduction;

  // HRA Exemption
  if (rentPaid && rentPaid > 0) {
    const annualRent = rentPaid * 12;
    const annualHRA = hra * 12;
    const annualBasic = basicSalary * 12;
    deductions.hraExemption = Math.min(
      calculateHRAExemption(annualHRA, annualBasic, annualRent, isMetro ?? false),
      taxSettings.hraExemptionLimit
    );
  } else {
    deductions.hraExemption = 0;
  }

  // Section 80C (PPF, ELSS, LIC, etc.)
  deductions.section80C = Math.min(investments?.section80C ?? 0, taxSettings.section80CLimit);

  // Section 80D (Health Insurance)
  deductions.section80D = Math.min(investments?.section80D ?? 0, 25000); // Max 25K for non-senior

  // Section 80CCD(1B) (Additional NPS)
  deductions.nps80CCD1B = Math.min(investments?.nps80CCD1B ?? 0, 50000);

  // Home Loan Interest (Section 24)
  deductions.homeLoanInterest = Math.min(investments?.homeLoanInterest ?? 0, 200000); // Max 2L for self-occupied

  const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
  const taxableIncome = Math.max(0, annualGrossIncome - totalDeductions);

  const { taxPayable, slabBreakdown } = calculateSlabwiseTax(
    taxableIncome,
    'old',
    taxSettings
  );

  // Health & Education Cess (4%)
  const cess = Math.round(taxPayable * 0.04);
  const totalTax = taxPayable + cess;

  return {
    grossIncome: annualGrossIncome,
    deductions,
    taxableIncome,
    taxPayable,
    cess,
    totalTax,
    monthlyTDS: totalTax / 12,
    rebateApplied: false,
    slabBreakdown,
  };
}

/**
 * Calculate tax based on employee's selected regime
 */
export function calculateEmployeeTax(input: TaxCalculationInput): TaxCalculationResult {
  if (input.regime === 'new') {
    return calculateNewRegimeTax(input.annualGrossIncome, input.taxSettings);
  } else {
    return calculateOldRegimeTax(input);
  }
}
