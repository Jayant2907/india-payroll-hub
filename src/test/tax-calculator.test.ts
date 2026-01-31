import { describe, it, expect } from 'vitest';
import {
    calculateNewRegimeTax,
    calculateOldRegimeTax,
    calculateEmployeeTax,
} from '@/lib/payroll-logic/tax-calculator';
import type { TaxSettings } from '@/types/payroll';

// Mock tax settings for FY 2024-25
const mockTaxSettings: TaxSettings = {
    fiscalYear: '2024-25',
    standardDeduction: 50000,
    section80CLimit: 150000,
    hraExemptionLimit: 100000,
    slabs: [
        // New Regime
        { id: 'tax-1', regime: 'new', fiscalYear: '2024-25', minIncome: 0, maxIncome: 300000, taxRate: 0 },
        { id: 'tax-2', regime: 'new', fiscalYear: '2024-25', minIncome: 300001, maxIncome: 600000, taxRate: 5 },
        { id: 'tax-3', regime: 'new', fiscalYear: '2024-25', minIncome: 600001, maxIncome: 900000, taxRate: 10 },
        { id: 'tax-4', regime: 'new', fiscalYear: '2024-25', minIncome: 900001, maxIncome: 1200000, taxRate: 15 },
        { id: 'tax-5', regime: 'new', fiscalYear: '2024-25', minIncome: 1200001, maxIncome: 1500000, taxRate: 20 },
        { id: 'tax-6', regime: 'new', fiscalYear: '2024-25', minIncome: 1500001, maxIncome: 99999999, taxRate: 30 },
        // Old Regime
        { id: 'tax-7', regime: 'old', fiscalYear: '2024-25', minIncome: 0, maxIncome: 250000, taxRate: 0 },
        { id: 'tax-8', regime: 'old', fiscalYear: '2024-25', minIncome: 250001, maxIncome: 500000, taxRate: 5 },
        { id: 'tax-9', regime: 'old', fiscalYear: '2024-25', minIncome: 500001, maxIncome: 1000000, taxRate: 20 },
        { id: 'tax-10', regime: 'old', fiscalYear: '2024-25', minIncome: 1000001, maxIncome: 99999999, taxRate: 30 },
    ],
};

describe('Tax Calculator - New Regime', () => {
    it('should calculate zero tax for income ≤ 3L', () => {
        const result = calculateNewRegimeTax(300000, mockTaxSettings);
        expect(result.totalTax).toBe(0);
        expect(result.taxableIncome).toBe(250000); // 300000 - 50000 SD
    });

    it('should apply Section 87A rebate for taxable income ≤ 7L', () => {
        const result = calculateNewRegimeTax(700000, mockTaxSettings);
        expect(result.rebateApplied).toBe(true);
        expect(result.totalTax).toBe(0);
    });

    it('should NOT apply rebate for taxable income > 7L', () => {
        const result = calculateNewRegimeTax(800000, mockTaxSettings);
        expect(result.rebateApplied).toBe(false);
        expect(result.totalTax).toBeGreaterThan(0);
    });

    it('should calculate tax correctly for 15L income', () => {
        const result = calculateNewRegimeTax(1500000, mockTaxSettings);

        // Taxable = 1500000 - 50000 = 1450000
        // 0-3L: 0
        // 3-6L: 300000 × 5% = 15000
        // 6-9L: 300000 × 10% = 30000
        // 9-12L: 300000 × 15% = 45000
        // 12-14.5L: 250000 × 20% = 50000
        // Total tax = 140000
        // Cess 4% = 5600
        // Grand total = 145600

        expect(result.taxPayable).toBe(140000);
        expect(result.cess).toBe(5600);
        expect(result.totalTax).toBe(145600);
    });

    it('should calculate monthly TDS correctly', () => {
        const result = calculateNewRegimeTax(1200000, mockTaxSettings);
        expect(result.monthlyTDS).toBe(result.totalTax / 12);
    });

    it('should handle edge case at exact slab boundaries', () => {
        const result = calculateNewRegimeTax(900000, mockTaxSettings);
        // Taxable = 900000 - 50000 = 850000
        // 0-3L: 0
        // 3-6L: 300000 × 5% = 15000
        // 6-8.5L: 250000 × 10% = 25000
        // Tax = 40000, Cess = 1600
        // Total = 41600
        expect(result.taxPayable).toBe(40000);
        expect(result.cess).toBe(1600);
        expect(result.totalTax).toBe(41600);
        expect(result.rebateApplied).toBe(false);
    });
});

describe('Tax Calculator - Old Regime', () => {
    it('should apply standard deduction', () => {
        const result = calculateOldRegimeTax({
            annualGrossIncome: 500000,
            regime: 'old',
            basicSalary: 20000,
            hra: 10000,
            taxSettings: mockTaxSettings,
        });

        expect(result.deductions.standardDeduction).toBe(50000);
    });

    it('should apply 80C deduction correctly', () => {
        const result = calculateOldRegimeTax({
            annualGrossIncome: 1000000,
            regime: 'old',
            basicSalary: 40000,
            hra: 20000,
            taxSettings: mockTaxSettings,
            investments: {
                section80C: 150000,
            },
        });

        expect(result.deductions.section80C).toBe(150000);
    });

    it('should cap 80C at limit', () => {
        const result = calculateOldRegimeTax({
            annualGrossIncome: 1000000,
            regime: 'old',
            basicSalary: 40000,
            hra: 20000,
            taxSettings: mockTaxSettings,
            investments: {
                section80C: 200000, // More than limit
            },
        });

        expect(result.deductions.section80C).toBe(150000); // Capped
    });

    it('should calculate HRA exemption for metro', () => {
        const result = calculateOldRegimeTax({
            annualGrossIncome: 800000,
            regime: 'old',
            basicSalary: 30000,
            hra: 15000,
            rentPaid: 20000,
            isMetro: true,
            taxSettings: mockTaxSettings,
        });

        // Annual: Basic = 360000, HRA = 180000, Rent = 240000
        // Exemption1 = 180000 (actual HRA)
        // Exemption2 = 240000 - 36000 = 204000
        // Exemption3 = 360000 × 50% = 180000
        // Min = 180000
        expect(result.deductions.hraExemption).toBe(100000); // Capped at limit
    });

    it('should apply all deductions together', () => {
        const result = calculateOldRegimeTax({
            annualGrossIncome: 1500000,
            regime: 'old',
            basicSalary: 50000,
            hra: 25000,
            rentPaid: 30000,
            isMetro: true,
            taxSettings: mockTaxSettings,
            investments: {
                section80C: 150000,
                section80D: 25000,
                nps80CCD1B: 50000,
                homeLoanInterest: 200000,
            },
        });

        expect(result.deductions.section80C).toBe(150000);
        expect(result.deductions.section80D).toBe(25000);
        expect(result.deductions.nps80CCD1B).toBe(50000);
        expect(result.deductions.homeLoanInterest).toBe(200000);
    });

    it('should calculate cess at 4%', () => {
        const result = calculateOldRegimeTax({
            annualGrossIncome: 1000000,
            regime: 'old',
            basicSalary: 40000,
            hra: 20000,
            taxSettings: mockTaxSettings,
        });

        expect(result.cess).toBe(result.taxPayable * 0.04);
    });
});

describe('Tax Calculator - Regime Selection', () => {
    it('should use new regime when specified', () => {
        const result = calculateEmployeeTax({
            annualGrossIncome: 800000,
            regime: 'new',
            basicSalary: 30000,
            hra: 15000,
            taxSettings: mockTaxSettings,
        });

        expect(result.rebateApplied).toBeDefined(); // Only new regime has this
    });

    it('should use old regime when specified', () => {
        const result = calculateEmployeeTax({
            annualGrossIncome: 800000,
            regime: 'old',
            basicSalary: 30000,
            hra: 15000,
            taxSettings: mockTaxSettings,
            investments: { section80C: 50000 },
        });

        expect(result.deductions.section80C).toBe(50000); // Only old regime has deductions
    });
});

describe('Tax Calculator - Edge Cases', () => {
    it('should handle zero income', () => {
        const result = calculateNewRegimeTax(0, mockTaxSettings);
        expect(result.totalTax).toBe(0);
        expect(result.taxableIncome).toBe(0);
    });

    it('should handle very high income', () => {
        const result = calculateNewRegimeTax(10000000, mockTaxSettings);
        expect(result.totalTax).toBeGreaterThan(0);
        expect(result.slabBreakdown.length).toBeGreaterThan(0);
    });

    it('should not go negative on taxable income', () => {
        const result = calculateOldRegimeTax({
            annualGrossIncome: 100000,
            regime: 'old',
            basicSalary: 5000,
            hra: 2500,
            taxSettings: mockTaxSettings,
            investments: {
                section80C: 150000, // More than income
            },
        });

        expect(result.taxableIncome).toBeGreaterThanOrEqual(0);
    });
});
