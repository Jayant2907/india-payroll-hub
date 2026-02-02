import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProofVerificationService } from '@/lib/services/proof-verification/service';
import { SubmitDeclarationRequest, ProofSectionType } from '@/lib/services/proof-verification/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useInvestmentDeclaration = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // We assume the logged in user is an employee for this hook
    const employeeId = user?.employeeId || 'emp-1'; // Fallback for dev

    const { data: declaration, isLoading } = useQuery({
        queryKey: ['tax-declaration', employeeId],
        queryFn: async () => {
            // Simulate async delay
            await new Promise(r => setTimeout(r, 500));
            return ProofVerificationService.getOrCreateDeclaration(employeeId);
        }
    });

    const submitMutation = useMutation({
        mutationFn: async (data: SubmitDeclarationRequest) => {
            await new Promise(r => setTimeout(r, 1000));
            return ProofVerificationService.submitDeclaration(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-declaration', employeeId] });
            toast.success('Investment Proofs Submitted Successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    const uploadMutation = useMutation({
        mutationFn: async ({ file, section, description }: { file: File, section: ProofSectionType, description: string }) => {
            return ProofVerificationService.uploadProof(employeeId, file, section, description);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-declaration', employeeId] });
            toast.success('File Uploaded');
        }
    });

    const removeProofMutation = useMutation({
        mutationFn: async ({ declarationId, sectionType, itemId }: { declarationId: string, sectionType: ProofSectionType, itemId: string }) => {
            // We need to implement this in the service
            return ProofVerificationService.removeItem(declarationId, sectionType, itemId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-declaration', employeeId] });
            toast.success('Proof Removed');
        }
    });

    return {
        declaration,
        isLoading,
        submitDeclaration: submitMutation.mutate,
        isSubmitting: submitMutation.isPending,
        uploadProof: uploadMutation.mutateAsync,
        isUploading: uploadMutation.isPending,
        removeProof: removeProofMutation.mutate
    };
};
