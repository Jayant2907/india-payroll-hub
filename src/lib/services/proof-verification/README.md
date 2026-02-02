# Investment Proof Submission & Verification System

## Architecture
This module handles the end-to-end workflow of Investment Proof submission, verification, and payroll locking.
It is designed as a standalone service (`ProofVerificationService`) that bridges the gap between Tax Planning and Payroll Processing.

## Data Models
- **TaxDeclaration**: The aggregate root for an employee's tax submission. Contains `sections` (80C, 80D, etc.) and `regime` selection.
- **VerificationStatus**: `Pending` -> `Approved` | `Rejected` | `PartiallyApproved`
- **PayrollTaxSnapshot**: The final "frozen" state used by the Payroll Engine to deduct TDS in March.

## Workflow

### 1. Employee Flow (Frontend: `InvestmentProofs.tsx`)
1.  **Initialize**: On load, call `getOrCreateDeclaration(empId)`.
2.  **Regime Selection**:
    -   User toggles between "Old" vs "New".
    -   System calculates projected tax (using `TaxOptimizer` - to be integrated).
    -   User locks regime (cannot be changed after submission).
3.  **Upload Proofs**:
    -   User selects a section (e.g., 80C).
    -   Uploads file -> `ProofVerificationService.uploadProof()`.
    -   Enters amount & description -> updates local state.
4.  **Submit**:
    -   User clicks "Submit for Verification".
    -   `ProofVerificationService.submitDeclaration()` is called.
    -   State changes to `Submitted`. UI becomes read-only.

### 2. HR/Admin Flow (Frontend: `VerificationPortal.tsx`)
1.  **Queue**:
    -   HR views list of `Submitted` declarations via `getPendingDeclarations()`.
2.  **Verify**:
    -   HR opens a declaration.
    -   Iterates through each Item.
    -   View Proof (File URL).
    -   Action: `Approve` / `Reject` (with comment) / `Partial Approval` (edit amount).
    -   Calls `verifyItem()`.
3.  **Finalize**:
    -   Once all items are checked, HR clicks "Finalize & Lock".
    -   `finalizeVerification()` is called.
    -   Data is frozen into `PayrollTaxSnapshot`.

## Payroll Integration
- The Payroll Run logic (in `PayrollService`) will query `PROOF_STORAGE_KEYS.PAYROLL_SNAPSHOTS` for the current month.
- If a snapshot exists, it OVERRIDES any estimated tax declarations.
- This ensures 100% compliance based on verified data.

## Audit Trail
- Every approval/rejection action creates a `ProofVerificationLog`.
- This log is immutable and stores: Timestamp, Verifier ID, Old Value, New Value, Reason.
