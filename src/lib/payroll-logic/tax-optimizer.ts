/**
 * Tax Optimizer - Regime Comparison Engine
 * Compares Old vs New tax regimes and suggests optimal choice
 */

import { calculateNewRegimeTax, calculateOldRegimeTax, type TaxCalculationInput } from './tax-calculator';
import type { TaxSettings, YearlyTaxConfig } from '@/types/payroll';

export interface OptimizerInput {
    annualGrossIncome: number;
    basicSalary: number;
    hra: number;
    rentPaid?: number;
    isMetro?: boolean;
    taxSettings: TaxSettings;
    fiscalYear?: string; // Support for versioned tax optimization
    investments?: {
        section80C?: number;
        section80D?: number;
        nps80CCD1B?: number;
        homeLoanInterest?: number;
    };
}

export interface OptimizerResult {
    oldRegime: {
        taxableIncome: number;
        taxPayable: number;
        cess: number;
        totalTax: number;
        monthlyTDS: number;
        deductionsApplied: Record<string, number>;
    };
    newRegime: {
        taxableIncome: number;
        taxPayable: number;
        cess: number;
        totalTax: number;
        monthlyTDS: number;
        rebateApplied: boolean;
    };
    recommendation: 'old' | 'new';
    savingsAmount: number;
    savingsPercentage: number;
    suggestions: Array<{
        type: 'info' | 'warning' | 'tip';
        title: string;
        description: string;
        potentialSaving?: number;
    }>;
}

/**
 * Helper to get the correct tax configuration
 */
function getTaxConfig(settings: TaxSettings, fiscalYear?: string): YearlyTaxConfig {
    const targetYear = fiscalYear || settings.activeFiscalYear;
    return settings.yearlyConfigs.find(c => c.fiscalYear === targetYear) || settings.yearlyConfigs[0];
}

/**
 * Compare both tax regimes and recommend optimal choice
 */
export function optimizeTaxRegime(input: OptimizerInput): OptimizerResult {
    const { annualGrossIncome, basicSalary, hra, rentPaid, isMetro, taxSettings, investments, fiscalYear } = input;
    const config = getTaxConfig(taxSettings, fiscalYear);

    // Calculate Old Regime
    const oldRegimeInput: TaxCalculationInput = {
        annualGrossIncome,
        regime: 'old',
        basicSalary,
        hra,
        rentPaid,
        isMetro,
        taxSettings,
        fiscalYear,
        investments,
    };
    const oldResult = calculateOldRegimeTax(oldRegimeInput);

    // Calculate New Regime
    const newResult = calculateNewRegimeTax(annualGrossIncome, taxSettings, fiscalYear);

    // Determine recommendation
    const recommendation = oldResult.totalTax <= newResult.totalTax ? 'old' : 'new';
    const savingsAmount = Math.abs(oldResult.totalTax - newResult.totalTax);
    const higherTax = Math.max(oldResult.totalTax, newResult.totalTax);
    const savingsPercentage = higherTax > 0 ? (savingsAmount / higherTax) * 100 : 0;

    // Generate intelligent suggestions
    const suggestions = generateSuggestions(input, oldResult, newResult, recommendation, config);

    return {
        oldRegime: {
            taxableIncome: oldResult.taxableIncome,
            taxPayable: oldResult.taxPayable,
            cess: oldResult.cess,
            totalTax: oldResult.totalTax,
            monthlyTDS: oldResult.monthlyTDS,
            deductionsApplied: oldResult.deductions,
        },
        newRegime: {
            taxableIncome: newResult.taxableIncome,
            taxPayable: newResult.taxPayable,
            cess: newResult.cess,
            totalTax: newResult.totalTax,
            monthlyTDS: newResult.monthlyTDS,
            rebateApplied: newResult.rebateApplied,
        },
        recommendation,
        savingsAmount,
        savingsPercentage,
        suggestions,
    };
}

/**
 * Generate intelligent tax-saving suggestions
 */
function generateSuggestions(
    input: OptimizerInput,
    oldResult: any,
    newResult: any,
    recommendation: 'old' | 'new',
    config: YearlyTaxConfig
): OptimizerResult['suggestions'] {
    const suggestions: OptimizerResult['suggestions'] = [];
    const { annualGrossIncome, investments = {} } = input;

    // Recommendation explanation
    if (recommendation === 'new') {
        suggestions.push({
            type: 'info',
            title: 'New Regime Recommended',
            description: `You'll save ₹${(oldResult.totalTax - newResult.totalTax).toLocaleString('en-IN')} by choosing the New Tax Regime.`,
        });

        if (newResult.rebateApplied) {
            suggestions.push({
                type: 'info',
                title: 'Section 87A Rebate Applied',
                description: `Your taxable income is ≤ ₹${(config.section87ARebateLimit / 100000).toFixed(1)}L, so you pay zero tax under New Regime!`,
            });
        }
    } else {
        suggestions.push({
            type: 'info',
            title: 'Old Regime Recommended',
            description: `You'll save ₹${(newResult.totalTax - oldResult.totalTax).toLocaleString('en-IN')} by choosing the Old Tax Regime with deductions.`,
        });
    }

    // Section 80C optimization (Old Regime only)
    if (recommendation === 'old') {
        const current80C = investments.section80C ?? 0;
        const max80C = config.section80CLimit;
        const shortfall = max80C - current80C;

        if (shortfall > 10000) {
            const potentialSaving = shortfall * 0.3; // Assuming 30% tax bracket
            suggestions.push({
                type: 'tip',
                title: 'Maximize 80C Deductions',
                description: `You can invest ₹${shortfall.toLocaleString('en-IN')} more in 80C instruments (PPF, ELSS, etc.) to save up to ₹${potentialSaving.toLocaleString('en-IN')} in taxes.`,
                potentialSaving,
            });
        }
    }

    // HRA optimization
    if (input.rentPaid && input.rentPaid > 0 && recommendation === 'old') {
        const annualRent = input.rentPaid * 12;
        const tenPercentBasic = (input.basicSalary * 12) * 0.1;

        if (annualRent < tenPercentBasic) {
            suggestions.push({
                type: 'warning',
                title: 'Low Rent Claimed',
                description: `Your annual rent (₹${annualRent.toLocaleString('en-IN')}) is less than 10% of basic salary. HRA exemption might be minimal.`,
            });
        }
    } else if (!input.rentPaid && input.hra > 0 && recommendation === 'old') {
        suggestions.push({
            type: 'warning',
            title: 'Declare Rent for HRA Exemption',
            description: 'You receive HRA but haven\'t declared rent. Submit rent receipts to claim HRA exemption and save taxes.',
        });
    }

    // NPS 80CCD(1B)
    if (recommendation === 'old') {
        const currentNPS = investments.nps80CCD1B ?? 0;
        if (currentNPS < 50000) {
            const shortfall = 50000 - currentNPS;
            const potentialSaving = shortfall * 0.3;
            suggestions.push({
                type: 'tip',
                title: 'Additional NPS Contribution',
                description: `Invest ₹${shortfall.toLocaleString('en-IN')} in NPS Tier-1 under Section 80CCD(1B) to save ₹${potentialSaving.toLocaleString('en-IN')}.`,
                potentialSaving,
            });
        }
    }

    // Health Insurance (80D)
    if (recommendation === 'old') {
        const current80D = investments.section80D ?? 0;
        if (current80D < 25000) {
            const shortfall = 25000 - current80D;
            const potentialSaving = shortfall * 0.3;
            suggestions.push({
                type: 'tip',
                title: 'Health Insurance Premium',
                description: `Pay ₹${shortfall.toLocaleString('en-IN')} more for health insurance to claim 80D deduction and save ₹${potentialSaving.toLocaleString('en-IN')}.`,
                potentialSaving,
            });
        }
    }

    // High-income New Regime advantage
    if (annualGrossIncome > 1500000 && recommendation === 'new') {
        suggestions.push({
            type: 'info',
            title: 'New Regime Beneficial for High Income',
            description: 'The New Regime often benefits high earners without long-term investments due to lower slab rates.',
        });
    }

    return suggestions;
}
