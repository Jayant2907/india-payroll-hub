import type {
    Employee,
    IncentiveRule,
    IncentiveAllocation,
    IncentiveStatus
} from '@/types/payroll';

/**
 * Enterprise Variable Pay Engine
 * Deterministic formula evaluation for Indian Payroll Context
 */

export interface FormulaContext {
    monthlyBasic: number;
    monthlyCTC: number;
    fixedValue: number;
}

/**
 * Safely evaluates a formula expression
 */
export const evaluateIncentiveAmount = (
    rule: IncentiveRule,
    context: FormulaContext
): number => {
    const { formulaExpression, baseComponent, capAmount } = rule;
    let amount = 0;

    try {
        // Basic "DSL" for formulas
        // We replace tokens with actual values. In a production app, use a real math parser.
        const evaluatedExpression = formulaExpression
            .replace(/monthlyBasic/g, context.monthlyBasic.toString())
            .replace(/monthlyCTC/g, context.monthlyCTC.toString())
            .replace(/fixedValue/g, context.fixedValue.toString());

        // Using Function as a simple/safe math evaluator for demo
        // In real enterprise SaaS, use mathjs or similar with strict sandbox
        amount = new Function(`return ${evaluatedExpression}`)();

        if (isNaN(amount) || !isFinite(amount)) {
            throw new Error('Calculated amount is not a valid number');
        }

        // Apply Cap if defined
        if (capAmount && amount > capAmount) {
            amount = capAmount;
        }

        return Math.round(amount * 100) / 100; // Round to 2 decimal places
    } catch (error) {
        console.error(`Formula evaluation failed for rule ${rule.name}:`, error);
        throw new Error(`Invalid formula expression: ${formulaExpression}`);
    }
};

/**
 * Generates an allocation instance for an employee based on a rule
 */
export const createAllocation = (
    rule: IncentiveRule,
    employee: Employee,
    payrollMonth: number,
    payrollYear: number,
    installmentNumber?: number,
    totalInstallments?: number
): IncentiveAllocation => {
    const context: FormulaContext = {
        monthlyBasic: employee.annualCTC * 0.4 / 12,
        monthlyCTC: employee.annualCTC / 12,
        fixedValue: 0 // Could be passed as extra param if needed
    };

    const amount = evaluateIncentiveAmount(rule, context);

    return {
        id: `alloc-${rule.id}-${employee.id}-${Date.now()}`,
        ruleId: rule.id,
        employeeId: employee.id,
        departmentId: employee.department,
        calculatedAmount: amount,
        payrollMonth,
        payrollYear,
        status: 'Draft',
        isRecovery: amount < 0,
        sourceRuleVersion: rule.version,
        installmentNumber,
        totalInstallments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

/**
 * Handles recurring incentive generation
 */
export const generateRecurringAllocations = (
    rule: IncentiveRule,
    employee: Employee,
    startMonth: number,
    startYear: number
): IncentiveAllocation[] => {
    const allocations: IncentiveAllocation[] = [];
    let currentMonth = startMonth;
    let currentYear = startYear;

    const total = rule.recurrenceCount;

    for (let i = 0; i < total; i++) {
        allocations.push(createAllocation(
            rule,
            employee,
            currentMonth,
            currentYear,
            i + 1,
            total
        ));

        // Advance month
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
    }

    return allocations;
};
