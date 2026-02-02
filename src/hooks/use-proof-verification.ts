import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProofVerificationService } from '@/lib/services/proof-verification/service';
import { ProofSectionType, VerificationStatus } from '@/lib/services/proof-verification/types';
import { toast } from 'sonner';

export const useProofVerification = () => {
    const queryClient = useQueryClient();

    const { data: pendingDeclarations, isLoading } = useQuery({
        queryKey: ['pending-declarations'],
        queryFn: async () => {
            await new Promise(r => setTimeout(r, 500));
            // In real app, this would be an API call
            return ProofVerificationService.getPendingDeclarations();
        }
    });

    const verifyItemMutation = useMutation({
        mutationFn: async (params: {
            declarationId: string,
            sectionType: ProofSectionType,
            itemId: string,
            action: 'Approve' | 'Reject' | 'Partial',
            approvedAmount?: number,
            comments?: string
        }) => {
            return ProofVerificationService.verifyItem({
                ...params,
                verifierId: 'admin-1' // Mock ID
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-declarations'] });
            toast.success('Item Verified');
        },
        onError: (e: Error) => toast.error(e.message)
    });

    const finalizeMutation = useMutation({
        mutationFn: async (declarationId: string) => {
            return ProofVerificationService.finalizeVerification(declarationId, 'admin-1');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-declarations'] });
            toast.success('Verification Finalized & Tax Locked');
        }
    });

    return {
        pendingDeclarations,
        isLoading,
        verifyItem: verifyItemMutation.mutate,
        finalizeVerification: finalizeMutation.mutate
    };
};
