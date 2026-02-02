import { getItem, setItem } from '@/lib/storage-fallback';
import {
    TaxDeclaration,
    SubmitDeclarationRequest,
    ProofDocument,
    ProofVerificationLog,
    PayrollTaxSnapshot,
    DeclarationSection,
    VerificationStatus,
    DeclarationStatus,
    ProofSectionType
} from './types';
import { Employee } from '@/types/payroll';

const PROOF_STORAGE_KEYS = {
    DECLARATIONS: 'app_inv_proof_declarations',
    VERIFICATION_LOGS: 'app_inv_proof_logs',
    PAYROLL_SNAPSHOTS: 'app_inv_proof_snapshots'
} as const;

export class ProofVerificationService {

    /**
     * Initialize a new declaration for an employee if it doesn't exist.
     * Typically called when the employee visits the portal for the first time.
     */
    static getOrCreateDeclaration(employeeId: string, fiscalYear: string = '2024-25'): TaxDeclaration {
        const declarations = this.getDeclarations();
        const existing = declarations.find(d => d.employeeId === employeeId && d.fiscalYear === fiscalYear);

        if (existing) {
            return existing;
        }

        const newDeclaration: TaxDeclaration = {
            id: `decl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            employeeId,
            fiscalYear,
            regime: 'new', // Default
            isRegimeLocked: false,
            sections: {
                '80C': this.createEmptySection('80C'),
                '80D': this.createEmptySection('80D'),
                'HRA': this.createEmptySection('HRA'),
                'NPS': this.createEmptySection('NPS'),
                'LTA': this.createEmptySection('LTA'),
                'Other': this.createEmptySection('Other'),
            },
            status: 'Draft'
        };

        declarations.push(newDeclaration);
        this.saveDeclarations(declarations);
        return newDeclaration;
    }

    /**
     * Submit Proofs and Declaration.
     * This locks the declaration for the employee until HR reviews it.
     */
    static submitDeclaration(request: SubmitDeclarationRequest): TaxDeclaration {
        const declarations = this.getDeclarations();
        const index = declarations.findIndex(
            d => d.employeeId === request.employeeId && d.fiscalYear === request.fiscalYear
        );

        if (index === -1) {
            throw new Error('Declaration not found. Please initialize first.');
        }

        const declaration = declarations[index];

        if (declaration.status === 'Locked' || declaration.status === 'Verified') {
            throw new Error('Declaration is already locked or verified.');
        }

        // Update fields
        declaration.regime = request.regime;

        // If submitting, we lock the regime
        declaration.isRegimeLocked = true;
        declaration.submissionStatus = 'Submitted';
        declaration.submittedAt = new Date().toISOString();
        declaration.status = 'Submitted';

        // Update sections
        // Note: In a real app we would merge carefully. Here we replace content with submission.
        // We assume the frontend passes the full structured object for simplicity in this mock.
        (Object.keys(request.sections) as ProofSectionType[]).forEach(key => {
            if (request.sections[key]) {
                declaration.sections[key].declaredAmount = request.sections[key].declaredAmount;
                declaration.sections[key].items = request.sections[key].items.map((item, idx) => ({
                    id: `item-${Date.now()}-${idx}`,
                    description: item.description,
                    declaredAmount: item.amount,
                    approvedAmount: 0, // Default to 0 until approved
                    proofIds: item.proofIds,
                    status: 'Pending'
                }));
            }
        });

        declarations[index] = declaration;
        this.saveDeclarations(declarations);
        return declaration;
    }

    /**
     * Upload a proof document (Mock).
     * In reality, this would upload to S3/Blob storage and return a URL.
     */
    static async uploadProof(
        employeeId: string,
        file: File,
        section: ProofSectionType,
        description: string
    ): Promise<ProofDocument> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const proof: ProofDocument = {
            id: `proof-${Date.now()}`,
            declarationId: `temp-${employeeId}`, // Ideally linked to declaration ID
            section,
            documentType: file.type,
            fileName: file.name,
            fileReference: URL.createObjectURL(file), // Mock URL
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            status: 'Pending'
        };

        // In a real implementation we would append this to a "Proofs" table.
        // For now we assume the frontend holds this ID and submits it with submitDeclaration
        return proof;
    }

    /**
     * Verify a specific line item in a declaration.
     * Only accessible by HR/Admin.
     */
    static verifyItem(request: {
        declarationId: string,
        sectionType: ProofSectionType,
        itemId: string,
        action: 'Approve' | 'Reject' | 'Partial',
        approvedAmount?: number,
        verifierId: string,
        comments?: string
    }): TaxDeclaration {
        const declarations = this.getDeclarations();
        const index = declarations.findIndex(d => d.id === request.declarationId);

        if (index === -1) throw new Error('Declaration not found');

        const declaration = declarations[index];
        const section = declaration.sections[request.sectionType];
        const itemIndex = section.items.findIndex(i => i.id === request.itemId);

        if (itemIndex === -1) throw new Error('Item not found');

        const item = section.items[itemIndex];

        // Update Item Status
        if (request.action === 'Approve') {
            item.status = 'Approved';
            item.approvedAmount = item.declaredAmount;
        } else if (request.action === 'Reject') {
            item.status = 'Rejected';
            item.approvedAmount = 0;
        } else if (request.action === 'Partial') {
            item.status = 'PartiallyApproved';
            item.approvedAmount = request.approvedAmount || 0;
        }

        item.comments = request.comments;

        // Recalculate Section Total
        section.approvedAmount = section.items.reduce((sum, i) => sum + (i.approvedAmount || 0), 0);

        // check if all items are verified to update Declaration Status? 
        // For now, we keep Declaration as "Submitted" until explicitly Finalized, 
        // or we can set it to 'Verified' if all items are done.

        // Log the action
        this.auditLog({
            id: `log-${Date.now()}`,
            declarationId: declaration.id,
            reviewerId: request.verifierId,
            action: request.action === 'Partial' ? 'PartialApprove' : request.action,
            timestamp: new Date().toISOString(),
            comments: request.comments || '',
            sectionId: request.sectionType,
            amountChanged: { from: item.declaredAmount, to: item.approvedAmount }
        });

        declarations[index] = declaration;
        this.saveDeclarations(declarations);
        return declaration;
    }

    /**
     * Remove a line item.
     */
    static removeItem(declarationId: string, sectionType: ProofSectionType, itemId: string): TaxDeclaration {
        const declarations = this.getDeclarations();
        const index = declarations.findIndex(d => d.id === declarationId);
        if (index === -1) throw new Error('Declaration not found');

        const declaration = declarations[index];
        const section = declaration.sections[sectionType];

        const itemIndex = section.items.findIndex(i => i.id === itemId);
        if (itemIndex !== -1) {
            const item = section.items[itemIndex];
            section.declaredAmount -= item.declaredAmount;
            section.items.splice(itemIndex, 1);
        }

        declarations[index] = declaration;
        this.saveDeclarations(declarations);
        return declaration;
    }

    /**
     * Finalize verification for an employee.
     *Freezes the data and prepares it for Payroll.
     */
    static finalizeVerification(declarationId: string, verifierId: string): TaxDeclaration {
        const declarations = this.getDeclarations();
        const index = declarations.findIndex(d => d.id === declarationId);
        if (index === -1) throw new Error('Declaration not found');

        const declaration = declarations[index];

        declaration.status = 'Verified';
        declaration.verifiedAt = new Date().toISOString();
        declaration.currentVerifierId = verifierId;

        // Create Payroll Snapshot
        this.createPayrollSnapshot(declaration);

        declarations[index] = declaration;
        this.saveDeclarations(declarations);
        return declaration;
    }

    /**
     * Create a frozen snapshot for payroll processing.
     */
    private static createPayrollSnapshot(declaration: TaxDeclaration) {
        const snapshots = getItem<PayrollTaxSnapshot[]>(PROOF_STORAGE_KEYS.PAYROLL_SNAPSHOTS, []);

        // Calculate total deductions
        const totalApproved = Object.values(declaration.sections).reduce(
            (acc, sec) => acc + sec.approvedAmount, 0
        );

        const snapshot: PayrollTaxSnapshot = {
            id: `snap-${Date.now()}`,
            employeeId: declaration.employeeId,
            payrollMonth: 3, // Typically March for Year End
            payrollYear: parseInt(declaration.fiscalYear.split('-')[1]) || 2025,
            finalApprovedDeductions: totalApproved,
            regime: declaration.regime,
            isLocked: true,
            generatedAt: new Date().toISOString()
        };

        snapshots.push(snapshot);
        setItem(PROOF_STORAGE_KEYS.PAYROLL_SNAPSHOTS, snapshots);
    }

    // --- Helpers ---

    private static getDeclarations(): TaxDeclaration[] {
        return getItem<TaxDeclaration[]>(PROOF_STORAGE_KEYS.DECLARATIONS, []);
    }

    private static saveDeclarations(declarations: TaxDeclaration[]): void {
        setItem(PROOF_STORAGE_KEYS.DECLARATIONS, declarations);
    }

    private static createEmptySection(type: ProofSectionType): DeclarationSection {
        return {
            type,
            declaredAmount: 0,
            approvedAmount: 0,
            items: []
        };
    }

    private static auditLog(log: ProofVerificationLog) {
        const logs = getItem<ProofVerificationLog[]>(PROOF_STORAGE_KEYS.VERIFICATION_LOGS, []);
        logs.push(log);
        setItem(PROOF_STORAGE_KEYS.VERIFICATION_LOGS, logs);
    }

    static getPendingDeclarations(): TaxDeclaration[] {
        return this.getDeclarations().filter(d => d.status === 'Submitted');
    }
}
