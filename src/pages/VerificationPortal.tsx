
import React, { useState } from 'react';
import { PageHeader, PageContainer } from '@/components/ui/page-header';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useProofVerification } from '@/hooks/use-proof-verification';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Check, X, Edit, FileText, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProofSectionType, TaxDeclaration, DeclarationItem } from '@/lib/services/proof-verification/types';

export default function VerificationPortal() {
    const { pendingDeclarations, isLoading, verifyItem, finalizeVerification } = useProofVerification();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Partial Approval Dialog State
    const [partialOpen, setPartialOpen] = useState(false);
    const [currentActionItem, setCurrentActionItem] = useState<{ declId: string, section: ProofSectionType, item: DeclarationItem } | null>(null);
    const [partialAmount, setPartialAmount] = useState("");
    const [comments, setComments] = useState("");

    const selectedDeclaration = pendingDeclarations?.find(d => d.id === selectedId);

    if (isLoading) return <div className="p-8">Loading verification queue...</div>;

    const handleAction = (declId: string, section: ProofSectionType, item: DeclarationItem, action: 'Approve' | 'Reject') => {
        verifyItem({
            declarationId: declId,
            sectionType: section,
            itemId: item.id,
            action,
            comments: action === 'Reject' ? "Rejected by HR" : undefined // Ideally prompt for reject reason
        });
    };

    const openPartial = (declId: string, section: ProofSectionType, item: DeclarationItem) => {
        setCurrentActionItem({ declId, section, item });
        setPartialAmount(item.declaredAmount.toString());
        setComments("");
        setPartialOpen(true);
    };

    const submitPartial = () => {
        if (!currentActionItem) return;
        verifyItem({
            declarationId: currentActionItem.declId,
            sectionType: currentActionItem.section,
            itemId: currentActionItem.item.id,
            action: 'Partial',
            approvedAmount: Number(partialAmount),
            comments
        });
        setPartialOpen(false);
    };

    return (
        <PageContainer className="h-[calc(100vh-100px)]">
            <PageHeader
                title="Verification Portal"
                description="Review and approve employee tax proofs."
            />

            <div className="h-full border rounded-xl overflow-hidden mt-4 bg-background shadow-sm">
                <ResizablePanelGroup direction="horizontal">

                    {/* LEFT LIST */}
                    <ResizablePanel defaultSize={30} minSize={20} maxSize={40} className="border-r">
                        <div className="p-4 border-b bg-muted/30">
                            <h3 className="font-semibold">Queue ({pendingDeclarations?.length || 0})</h3>
                        </div>
                        <ScrollArea className="h-[calc(100%-60px)]">
                            <div className="flex flex-col gap-1 p-2">
                                {pendingDeclarations?.length === 0 && <p className="text-center text-muted-foreground p-4">No pending verifications.</p>}
                                {pendingDeclarations?.map(decl => (
                                    <button
                                        key={decl.id}
                                        onClick={() => setSelectedId(decl.id)}
                                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${selectedId === decl.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                                    >
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>{decl.employeeId.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">Employee {decl.employeeId}</p>
                                            <p className="text-xs text-muted-foreground">Submitted: {new Date(decl.submittedAt!).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant="outline" className="ml-auto text-[10px]">{decl.regime.toUpperCase()}</Badge>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* RIGHT DETAIL */}
                    <ResizablePanel defaultSize={70}>
                        {!selectedDeclaration ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Select a declaration to review
                            </div>
                        ) : (
                            <ScrollArea className="h-full">
                                <div className="p-6 space-y-6">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-bold">Proof Verification</h2>
                                            <p className="text-muted-foreground">Reviewing submission for {selectedDeclaration.employeeId}</p>
                                        </div>
                                        <Button onClick={() => finalizeVerification(selectedDeclaration.id)}>Finalize & Lock Payroll</Button>
                                    </div>

                                    <Separator />

                                    {/* Sections Accordion */}
                                    <Accordion type="multiple" defaultValue={['80C', '80D']} className="w-full">
                                        {(Object.keys(selectedDeclaration.sections) as ProofSectionType[]).map(key => {
                                            const section = selectedDeclaration.sections[key];
                                            if (!section.items || section.items.length === 0) return null;

                                            return (
                                                <AccordionItem key={key} value={key}>
                                                    <AccordionTrigger className="hover:no-underline px-4 bg-muted/30 rounded-lg mb-2">
                                                        <div className="flex justify-between w-full pr-4">
                                                            <span>{key} ({section.items.length} items)</span>
                                                            <div className="flex gap-4 text-sm text-muted-foreground">
                                                                <span>Declared: ₹{section.declaredAmount}</span>
                                                                <span className="font-mono text-emerald-600">Approved: ₹{section.approvedAmount}</span>
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="p-4 pt-0">
                                                        <div className="space-y-4 pt-4">
                                                            {section.items.map(item => (
                                                                <Card key={item.id} className={`transition-all ${item.status === 'Approved' ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                                                                    <div className="flex items-center justify-between p-4">
                                                                        <div className="space-y-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-medium">{item.description}</span>
                                                                                <Badge variant={item.status === 'Approved' ? 'secondary' : 'outline'}>{item.status}</Badge>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
                                                                                <FileText className="h-4 w-4" />
                                                                                <span>View Proof ({item.proofIds.length} files)</span>
                                                                            </div>
                                                                            {item.comments && <p className="text-xs text-amber-600">Note: {item.comments}</p>}
                                                                        </div>

                                                                        <div className="flex items-center gap-4">
                                                                            <div className="text-right mr-4">
                                                                                <p className="text-sm text-muted-foreground">Declared</p>
                                                                                <p className="font-bold">₹{item.declaredAmount}</p>
                                                                            </div>

                                                                            {item.status === 'Pending' && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-100" title="Approve" onClick={() => handleAction(selectedDeclaration.id, key, item, 'Approve')}>
                                                                                        <Check className="h-4 w-4" />
                                                                                    </Button>
                                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:bg-amber-100" title="Partial" onClick={() => openPartial(selectedDeclaration.id, key, item)}>
                                                                                        <Edit className="h-4 w-4" />
                                                                                    </Button>
                                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600 hover:bg-rose-100" title="Reject" onClick={() => handleAction(selectedDeclaration.id, key, item, 'Reject')}>
                                                                                        <X className="h-4 w-4" />
                                                                                    </Button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            );
                                        })}
                                    </Accordion>
                                </div>
                            </ScrollArea>
                        )}
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>

            {/* Partial Approval Dialog */}
            <Dialog open={partialOpen} onOpenChange={setPartialOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Partial Approval</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Declared Amount</Label>
                            <Input disabled value={currentActionItem?.item.declaredAmount} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Approved Amount</Label>
                            <Input type="number" value={partialAmount} onChange={e => setPartialAmount(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Comments</Label>
                            <Textarea placeholder="Reason for partial approval..." value={comments} onChange={e => setComments(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPartialOpen(false)}>Cancel</Button>
                        <Button onClick={submitPartial}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageContainer>
    );
}
