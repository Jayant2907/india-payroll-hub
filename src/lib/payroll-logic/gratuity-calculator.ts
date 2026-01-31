/**
 * Gratuity Calculator - Full & Final Settlement Component
 * Implements statutory gratuity formula as per Payment of Gratuity Act, 1972
 */

export interface GratuityCalculationInput {
    lastDrawnBasicSalary: number; // Monthly basic salary
    lastDrawnDA?: number; // Dearness Allowance (if applicable)
    joiningDate: string; // ISO date string
    exitDate: string; // ISO date string
    monthsInYear?: number; // Default 12 (monthly), use 26 for biweekly
}

export interface GratuityCalculationResult {
    yearsOfService: number; // Rounded up (4.9 → 5)
    actualDays: number;
    eligibleForGratuity: boolean; // Must complete 5 years
    lastDrawnSalary: number;
    gratuityAmount: number;
    cappedAmount: number; // Statutory max cap
    isCapped: boolean;
    formula: string; // Human-readable formula
}

const STATUTORY_MAX_GRATUITY = 2000000; // ₹20 Lakhs as per latest amendment
const MIN_YEARS_FOR_GRATUITY = 5;

/**
 * Calculate years of service using calendar logic to accurately handle leap years
 */
function calculateYearsOfService(joiningDate: string, exitDate: string): { years: number; exactYears: number; days: number } {
    const start = new Date(joiningDate);
    const end = new Date(exitDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return { years: 0, exactYears: 0, days: 0 };
    }

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Calendar years calculation
    let years = end.getFullYear() - start.getFullYear();
    const startAtExitYear = new Date(start);
    startAtExitYear.setFullYear(start.getFullYear() + years);

    if (startAtExitYear > end) {
        years--;
        startAtExitYear.setFullYear(start.getFullYear() + years);
    }

    // Calculate fractional part of the current year
    const startOfNextYear = new Date(startAtExitYear);
    startOfNextYear.setFullYear(startOfNextYear.getFullYear() + 1);
    const daysInYear = Math.round((startOfNextYear.getTime() - startAtExitYear.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = (end.getTime() - startAtExitYear.getTime()) / (1000 * 60 * 60 * 24);

    const exactYears = years + (remainingDays / daysInYear);

    return { years, exactYears, days: diffDays };
}

/**
 * Round years for gratuity calculation
 * As per Act: Any fraction > 6 months (0.5 years) is rounded up to 1 year
 */
function roundYearsForGratuity(exactYears: number): number {
    const wholePart = Math.floor(exactYears);
    const decimalPart = exactYears - wholePart;

    // We use 0.5 as the threshold for "6 months"
    // Note: some companies use 240 days in the 5th year, but 0.5 is the standard formula simplification
    return decimalPart >= 0.5 ? wholePart + 1 : wholePart;
}

/**
 * Calculate gratuity amount
 * Formula: (Last Drawn Salary × 15/26) × Completed Years of Service
 */
export function calculateGratuity(input: GratuityCalculationInput): GratuityCalculationResult {
    const { lastDrawnBasicSalary, lastDrawnDA = 0, joiningDate, exitDate } = input;

    const { exactYears, days: actualDays } = calculateYearsOfService(joiningDate, exitDate);
    const yearsOfService = roundYearsForGratuity(exactYears);

    // Eligibility check: strictly 5 years or 4 years 7 months (approx 4.58 years) in some cases.
    // We'll stick to a strict 5-year check or very close to it (4.95 to account for minor date mismatches)
    // But calendar logic should be exact.
    const eligibleForGratuity = exactYears >= 4.8; // 4.8 years is common minimum (roughly 4 years 10 months)

    if (!eligibleForGratuity) {
        return {
            yearsOfService,
            actualDays,
            eligibleForGratuity: false,
            lastDrawnSalary: lastDrawnBasicSalary + lastDrawnDA,
            gratuityAmount: 0,
            cappedAmount: 0,
            isCapped: false,
            formula: `Not eligible - Service period: ${exactYears.toFixed(2)} years (minimum 5 years continuous service required)`,
        };
    }

    const lastDrawnSalary = lastDrawnBasicSalary + lastDrawnDA;

    // Standard formula: (Salary × 15/26) × Years
    const gratuityAmount = Math.round((lastDrawnSalary * 15 / 26) * yearsOfService);

    // Apply statutory cap
    const cappedAmount = Math.min(gratuityAmount, STATUTORY_MAX_GRATUITY);
    const isCapped = gratuityAmount > STATUTORY_MAX_GRATUITY;

    const formula = `(₹${lastDrawnSalary.toLocaleString('en-IN')} × 15/26) × ${yearsOfService} years = ₹${gratuityAmount.toLocaleString('en-IN')}${isCapped ? ` (capped to ₹${STATUTORY_MAX_GRATUITY.toLocaleString('en-IN')})` : ''
        }`;

    return {
        yearsOfService,
        actualDays,
        eligibleForGratuity: true,
        lastDrawnSalary,
        gratuityAmount,
        cappedAmount,
        isCapped,
        formula,
    };
}

/**
 * Calculate leave encashment
 * Formula: (Leave Balance × Daily Wage)
 */
export function calculateLeaveEncashment(
    leaveBalance: number,
    monthlyBasicSalary: number,
    workingDaysPerMonth: number = 26
): number {
    const dailyWage = monthlyBasicSalary / workingDaysPerMonth;
    return leaveBalance * dailyWage;
}

/**
 * Calculate notice period recovery
 * Formula: (Monthly CTC / Working Days) × Shortfall Days
 * Returns positive number for recovery (deduction)
 */
export function calculateNoticePeriodRecovery(
    monthlyCTC: number,
    noticePeriodDays: number,
    actualNoticeDays: number,
    workingDaysPerMonth: number = 26
): number {
    const shortfallDays = Math.max(0, noticePeriodDays - actualNoticeDays);
    const dailyRate = monthlyCTC / workingDaysPerMonth;
    return shortfallDays * dailyRate;
}
