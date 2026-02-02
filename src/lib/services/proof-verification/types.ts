import { TaxRegime } from "@/types/payroll";

// Domain Models

export type ProofSectionType = '80C' | '80D' | 'HRA' | 'NPS' | 'LTA' | 'Other';
export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected' | 'PartiallyApproved';
export type DeclarationStatus = 'Draft' | 'Submitted' | 'Verified' | 'Locked';

export interface ProofDocument {
    id: string;
    declarationId: string;
    section: ProofSectionType;
    documentType: string; // e.g., "LIC Receipt", "Rent Receipt"
    fileName: string;
    fileReference: string; // URL or Storage Path
    fileSize: number;
    uploadedAt: string;
    status: VerificationStatus;
    rejectionReason?: string;
}

export interface DeclarationSection {
    type: ProofSectionType;
    declaredAmount: number;
    approvedAmount: number;
    items: DeclarationItem[];
}

export interface DeclarationItem {
    id: string;
    description: string; // e.g. "LIC Policy 123"
    declaredAmount: number;
    approvedAmount: number;
    proofIds: string[];
    status: VerificationStatus;
    comments?: string;
}

export interface TaxDeclaration {
    id: string;
    employeeId: string;
    fiscalYear: string; // e.g. "2023-24"
    regime: TaxRegime;
    isRegimeLocked: boolean;

    // Sections
    sections: Record<ProofSectionType, DeclarationSection>;

    // Meta
    status: DeclarationStatus;
    submittedAt?: string;
    verifiedAt?: string;
    lockedAt?: string;
    currentVerifierId?: string;
}

export interface ProofVerificationLog {
    id: string;
    declarationId: string;
    reviewerId: string;
    action: 'Approve' | 'Reject' | 'PartialApprove';
    timestamp: string;
    comments: string;
    sectionId?: ProofSectionType;
    amountChanged?: {
        from: number;
        to: number;
    };
}

export interface PayrollTaxSnapshot {
    id: string;
    employeeId: string;
    payrollMonth: number; // 1-12
    payrollYear: number;
    finalApprovedDeductions: number;
    regime: TaxRegime;
    isLocked: boolean;
    generatedAt: string;
}

// DTOs for Service Methods

export interface SubmitDeclarationRequest {
    employeeId: string;
    fiscalYear: string;
    regime: TaxRegime;
    sections: Record<ProofSectionType, {
        declaredAmount: number;
        items: {
            description: string;
            amount: number;
            proofIds: string[];
        }[];
    }>;
}

export interface VerifyItemRequest {
    declarationId: string;
    sectionType: ProofSectionType;
    itemId: string;
    status: VerificationStatus;
    approvedAmount: number;
    verifierId: string;
    comments?: string;
}
