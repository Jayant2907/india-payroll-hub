Role & Context
You are a senior full-stack engineer building an enterprise-grade payroll SaaS for the Indian statutory context.
The system already supports monthly payroll runs.
Your task is to design and implement a market-leading Variable Pay & Incentive Management module, comparable to Workday / Darwinbox, but optimized for clarity, auditability, and correctness.

🎯 Objective

Implement a rule-based Variable Pay & Incentive module that supports:

Incentive definition

Approval workflows

Recurring payouts

Payroll-time import

Real-time tax impact preview

Full auditability

This module must be safe, deterministic, and payroll-accurate.

🧠 Core Design Principles (Non-Negotiable)

Strict separation of concerns

Incentive Rules (definitions) must be immutable once used

Incentive Allocations must store evaluated snapshots

Audit-first

Every approval, change, and payroll import must be traceable

Payroll safety

No recalculation after approval

No silent formula changes

India-specific payroll correctness

Explicit taxability and statutory flags

🧩 Functional Requirements
1️⃣ Data Model (TypeScript)

Extend the existing payroll models with:

IncentiveRule (Definition Layer)

id

name

category (Sales / Retention / Performance / Adhoc)

formulaExpression (string-based math expression)

baseComponent (CTC | Basic | Fixed)

capAmount (optional)

recurrenceType (OneTime | Monthly | Quarterly)

recurrenceCount (number of cycles)

taxTreatmentType (FullyTaxable | PartiallyTaxable | Exempt)

pfApplicable (boolean)

esiApplicable (boolean)

effectiveFrom / effectiveTo

version

createdBy / createdAt

isLocked (true after first approval)

IncentiveAllocation (Instance Layer)

id

ruleId

employeeId / departmentId

calculatedAmount

payrollMonth

status (Draft | PendingApproval | Approved | Imported | Paid | Cancelled)

isRecovery (boolean)

sourceRuleVersion

createdAt

IncentiveApprovalLog

allocationId

approvedBy

approvedAt

comments

2️⃣ Variable Pay Engine (variable-pay.ts)

Implement:

A safe formula evaluator

Support:

% of Basic

% of CTC

Fixed values

Caps

Negative values (recoveries)

Produce deterministic outputs

Store evaluated amounts in IncentiveAllocation (no re-evaluation later)

Edge cases to handle:

Missing employee data

Zero salary components

Formula errors (fail fast with clear messages)

3️⃣ Recurring Incentives Logic

Support:

Multi-month payouts (e.g. 6-month retention bonus)

Auto-generation of allocations per payroll month

Graceful handling of:

Employee exit

Unpaid leave

Cancellation mid-cycle

4️⃣ Storage & Audit Layer

Add persistence for:

IncentiveRules

IncentiveAllocations

Approval logs

Every approval must:

Lock the rule version

Record approver identity

Prevent further edits

5️⃣ Incentives Management UI (Incentives.tsx)

Build a Command Center that includes:

List of Draft / Pending / Approved incentives

Total projected variable payout (monthly & cumulative)

Filters by department, rule, status

Add a Rule Builder UI:

Guided templates first

Formula preview mode

Validation before save

Add a Timeline View:

Visual display of recurring incentive cycles

6️⃣ Payroll Integration (RunPayroll.tsx)

Implement:

"Import Approved Incentives" button

Import only Approved allocations for the selected month

Freeze values after import

Show TDS Alert if bonus spikes monthly tax

🧪 Verification & Testing
Automated Tests

Formula evaluator unit tests

Recurring incentive generation tests

Tax impact simulation tests

Manual Flow Validation

Create Sales incentive → 10% of Basic

Assign to Sales department

Review projected payout

Approve batch

Import into payroll

Verify correct TDS adjustment

🛑 Explicit Constraints

No silent recalculation after approval

No rule edits once allocations exist

No payroll-time formula execution

All money values must be traceable

✅ Expected Output

Clean TypeScript models

Modular payroll logic

Clear UI components

Safe, auditable payroll behavior

Code written as if this will be audited by Finance & Compliance