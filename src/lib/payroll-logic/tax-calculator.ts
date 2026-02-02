/**
 * Tax Calculator - Income Tax Computation Engine
 * Supports both Old and New Tax Regimes with accurate slab-wise calculation
 */

import type { TaxRegime, TaxSettings, YearlyTaxConfig } from '@/types/payroll';

export interface TaxCalculationInput {
  annualGrossIncome: number;
  regime: TaxRegime;
  basicSalary: number;
  hra: number;
  rentPaid?: number;
  isMetro?: boolean;
  taxSettings: TaxSettings;
  fiscalYear?: string; // Optional override, defaults to active
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
 * Helper to get the correct tax configuration for a given year
 */
function getTaxConfig(settings: TaxSettings, fiscalYear?: string): YearlyTaxConfig {
  const targetYear = fiscalYear || settings.activeFiscalYear;
  const config = settings.yearlyConfigs.find(c => c.fiscalYear === targetYear);

  if (!config) {
    console.warn(`Tax config for FY ${targetYear} not found, falling back to first available.`);
    return settings.yearlyConfigs[0];
  }
  return config;
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
  config: YearlyTaxConfig
): { taxPayable: number; slabBreakdown: TaxCalculationResult['slabBreakdown'] } {
  const slabs = config.slabs
    .filter((s) => s.regime === regime && s.fiscalYear === config.fiscalYear)
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
  taxSettings: TaxSettings,
  fiscalYear?: string
): TaxCalculationResult {
  const config = getTaxConfig(taxSettings, fiscalYear);
  const standardDeduction = config.standardDeduction;
  const taxableIncome = Math.max(0, annualGrossIncome - standardDeduction);

  const { taxPayable, slabBreakdown } = calculateSlabwiseTax(
    taxableIncome,
    'new',
    config
  );

  // Section 87A Rebate logic based on configuration
  const rebateApplied = taxableIncome <= config.section87ARebateLimit;
  const finalTax = rebateApplied ? 0 : taxPayable;

  // Health & Education Cess
  const cess = Math.round(finalTax * (config.cessRate / 100));
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
  const { annualGrossIncome, basicSalary, hra, rentPaid, isMetro, taxSettings, investments, fiscalYear } = input;
  const config = getTaxConfig(taxSettings, fiscalYear);

  // Calculate all deductions
  const deductions: Record<string, number> = {};

  // Standard Deduction
  deductions.standardDeduction = config.standardDeduction;

  // HRA Exemption
  if (rentPaid && rentPaid > 0) {
    const annualRent = rentPaid * 12;
    const annualHRA = hra * 12;
    const annualBasic = basicSalary * 12;
    deductions.hraExemption = Math.min(
      calculateHRAExemption(annualHRA, annualBasic, annualRent, isMetro ?? false),
      config.hraExemptionLimit
    );
  } else {
    deductions.hraExemption = 0;
  }

  // Section 80C (PPF, ELSS, LIC, etc.)
  deductions.section80C = Math.min(investments?.section80C ?? 0, config.section80CLimit);

  // Section 80D (Health Insurance)
  deductions.section80D = Math.min(investments?.section80D ?? 0, 25000); // Max 25K for non-senior - TODO: Make this configurable if needed

  // Section 80CCD(1B) (Additional NPS)
  deductions.nps80CCD1B = Math.min(investments?.nps80CCD1B ?? 0, 50000);

  // Home Loan Interest (Section 24)
  deductions.homeLoanInterest = Math.min(investments?.homeLoanInterest ?? 0, 200000); // Max 2L for self-occupied

  const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
  const taxableIncome = Math.max(0, annualGrossIncome - totalDeductions);

  const { taxPayable, slabBreakdown } = calculateSlabwiseTax(
    taxableIncome,
    'old',
    config
  );

  // Health & Education Cess
  const cess = Math.round(taxPayable * (config.cessRate / 100));
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
    return calculateNewRegimeTax(input.annualGrossIncome, input.taxSettings, input.fiscalYear);
  } else {
    return calculateOldRegimeTax(input);
  }
}
