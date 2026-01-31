import { describe, it, expect } from 'vitest';
import {
    calculateGratuity,
    calculateLeaveEncashment,
    calculateNoticePeriodRecovery,
} from '@/lib/payroll-logic/gratuity-calculator';

describe('Gratuity Calculator', () => {
    it('should calculate gratuity correctly for eligible employee', () => {
        const result = calculateGratuity({
            lastDrawnBasicSalary: 50000,
            joiningDate: '2019-01-01',
            exitDate: '2024-01-31',
        });

        // 5 years of service
        expect(result.eligibleForGratuity).toBe(true);
        expect(result.yearsOfService).toBe(5);

        // (50000 × 15/26) × 5 = 144,230.77
        const expectedGratuity = (50000 * 15 / 26) * 5;
        expect(result.gratuityAmount).toBeCloseTo(expectedGratuity, 0);
    });

    it('should round up years when > 6 months (4.9 → 5)', () => {
        const result = calculateGratuity({
            lastDrawnBasicSalary: 60000,
            joiningDate: '2019-03-01',
            exitDate: '2024-01-31', // ~4.9 years
        });

        expect(result.yearsOfService).toBe(5); // Rounded up
    });

    it('should NOT round up years when < 6 months (4.4 → 4)', () => {
        const result = calculateGratuity({
            lastDrawnBasicSalary: 60000,
            joiningDate: '2019-09-01',
            exitDate: '2024-01-31', // ~4.4 years
        });

        expect(result.yearsOfService).toBe(4); // Not rounded
    });

    it('should return zero for service < 5 years', () => {
        const result = calculateGratuity({
            lastDrawnBasicSalary: 50000,
            joiningDate: '2021-01-01',
            exitDate: '2024-01-31', // 3 years
        });

        expect(result.eligibleForGratuity).toBe(false);
        expect(result.gratuityAmount).toBe(0);
        expect(result.formula).toContain('Not eligible');
    });

    it('should include DA in last drawn salary', () => {
        const result = calculateGratuity({
            lastDrawnBasicSalary: 40000,
            lastDrawnDA: 10000,
            joiningDate: '2018-01-01',
            exitDate: '2024-01-31', // 6 years
        });

        expect(result.lastDrawnSalary).toBe(50000); // Basic + DA

        // (50000 × 15/26) × 6
        const expectedGratuity = (50000 * 15 / 26) * 6;
        expect(result.gratuityAmount).toBeCloseTo(expectedGratuity, 0);
    });

    it('should cap gratuity at ₹20L statutory max', () => {
        const result = calculateGratuity({
            lastDrawnBasicSalary: 200000, // Very high salary
            joiningDate: '1994-01-01',
            exitDate: '2024-01-01', // 30 years
        });

        expect(result.isCapped).toBe(true);
        expect(result.cappedAmount).toBe(2000000); // Statutory max
        expect(result.gratuityAmount).toBeGreaterThan(2000000); // Uncapped would be higher
    });

    it('should NOT cap if below ₹20L', () => {
        const result = calculateGratuity({
            lastDrawnBasicSalary: 50000,
            joiningDate: '2014-01-01',
            exitDate: '2024-01-01', // 10 years
        });

        expect(result.isCapped).toBe(false);
        expect(result.cappedAmount).toBe(result.gratuityAmount);

        // (50000 × 15/26) × 10 = approximately 288,461.54
        const expectedGratuity = (50000 * 15 / 26) * 10;
        expect(result.gratuityAmount).toBeCloseTo(expectedGratuity, 0);
        expect(result.gratuityAmount).toBeLessThan(2000000);
    });

    it('should calculate actual days of service', () => {
        const result = calculateGratuity({
            lastDrawnBasicSalary: 50000,
            joiningDate: '2019-01-01',
            exitDate: '2024-01-31',
        });

        // ~5 years = ~1826 days (accounting for leap year)
        expect(result.actualDays).toBeGreaterThan(1800);
        expect(result.actualDays).toBeLessThan(1900);
    });

    it('should handle exact 5-year boundary', () => {
        const result = calculateGratuity({
            lastDrawnBasicSalary: 50000,
            joiningDate: '2019-01-01',
            exitDate: '2024-01-01', // Exactly 5 years
        });

        expect(result.eligibleForGratuity).toBe(true);
        expect(result.yearsOfService).toBe(5);
    });
});

describe('Leave Encashment Calculator', () => {
    it('should calculate leave encashment correctly', () => {
        const result = calculateLeaveEncashment(30, 50000, 26);

        // Daily wage = 50000 / 26 = 1923.08
        // 30 days × 1923.08 = 57,692.31
        const expectedEncashment = (50000 / 26) * 30;
        expect(result).toBeCloseTo(expectedEncashment, 0);
    });

    it('should handle zero leave balance', () => {
        const result = calculateLeaveEncashment(0, 50000, 26);
        expect(result).toBe(0);
    });

    it('should handle custom working days per month', () => {
        const result = calculateLeaveEncashment(20, 60000, 22);

        const expectedEncashment = (60000 / 22) * 20;
        expect(result).toBeCloseTo(expectedEncashment, 0);
    });

    it('should calculate for high leave balance', () => {
        const result = calculateLeaveEncashment(60, 80000, 26);

        const expectedEncashment = (80000 / 26) * 60;
        expect(result).toBeCloseTo(expectedEncashment, 0);
    });
});

describe('Notice Period Recovery Calculator', () => {
    it('should calculate recovery for full shortfall', () => {
        const result = calculateNoticePeriodRecovery(100000, 60, 0, 26);

        // Daily rate = 100000 / 26 = 3846.15
        // Shortfall = 60 days
        // Recovery = 3846.15 × 60 = 230,769.23
        const expectedRecovery = (100000 / 26) * 60;
        expect(result).toBeCloseTo(expectedRecovery, 0);
    });

    it('should calculate recovery for partial shortfall', () => {
        const result = calculateNoticePeriodRecovery(100000, 60, 30, 26);

        // Shortfall = 60 - 30 = 30 days
        const expectedRecovery = (100000 / 26) * 30;
        expect(result).toBeCloseTo(expectedRecovery, 0);
    });

    it('should return zero when notice period served fully', () => {
        const result = calculateNoticePeriodRecovery(100000, 60, 60, 26);
        expect(result).toBe(0);
    });

    it('should return zero when notice exceeded', () => {
        const result = calculateNoticePeriodRecovery(100000, 60, 90, 26);
        expect(result).toBe(0); // No recovery if employee served more than required
    });

    it('should handle custom working days', () => {
        const result = calculateNoticePeriodRecovery(120000, 90, 60, 22);

        // Shortfall = 30 days
        const expectedRecovery = (120000 / 22) * 30;
        expect(result).toBeCloseTo(expectedRecovery, 0);
    });

    it('should calculate for immediate resignation (0 days served)', () => {
        const result = calculateNoticePeriodRecovery(80000, 30, 0, 26);

        const expectedRecovery = (80000 / 26) * 30;
        expect(result).toBeCloseTo(expectedRecovery, 0);
    });
});

describe('Gratuity Calculator - Edge Cases', () => {
    it('should handle leap years correctly', () => {
        const result = calculateGratuity({
            lastDrawnBasicSalary: 50000,
            joiningDate: '2020-02-29', // Leap year start
            exitDate: '2024-02-29', // Leap year end
        });

        expect(result.eligibleForGratuity).toBe(false); // Exactly 4 years
        expect(result.yearsOfService).toBe(4);
    });

    it('should handle very short tenure', () => {
        const result = calculateGratuity({
            lastDrawnBasicSalary: 50000,
            joiningDate: '2024-01-01',
            exitDate: '2024-01-31', // 1 month
        });

        expect(result.eligibleForGratuity).toBe(false);
        expect(result.gratuityAmount).toBe(0);
    });

    it('should handle very long tenure (30+ years)', () => {
        const result = calculateGratuity({
            lastDrawnBasicSalary: 300000, // Use very high salary to ensure cap is triggered
            joiningDate: '1990-01-01',
            exitDate: '2024-01-01', // 34 years
        });

        expect(result.eligibleForGratuity).toBe(true);
        // (300000 × 15/26) × 34 should definitely exceed 20L
        // Should be capped at 20L
        expect(result.isCapped).toBe(true);
        expect(result.cappedAmount).toBe(2000000);
    });

    it('should produce valid formula string', () => {
        const result = calculateGratuity({
            lastDrawnBasicSalary: 50000,
            joiningDate: '2018-01-01',
            exitDate: '2024-01-31',
        });

        expect(result.formula).toContain('50,000');
        expect(result.formula).toContain('15/26');
        expect(result.formula).toContain('6 years');
    });
});
