
import React, { useState } from 'react';
import { PageHeader, PageContainer, StatsCard } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle2, Lock, AlertCircle, TrendingUp, IndianRupee, ShieldCheck, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useInvestmentDeclaration } from '@/hooks/use-investment-proofs';
import { ProofSectionType } from '@/lib/services/proof-verification/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function InvestmentProofs() {
    const { declaration, isLoading, submitDeclaration, uploadProof, removeProof } = useInvestmentDeclaration();
    const [activeTab, setActiveTab] = useState("regime");
    const [uploadOpen, setUploadOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState<ProofSectionType>('80C');

    // Mock form state for upload
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);

    if (isLoading) return <div className="p-8">Loading...</div>;

    const handleUpload = async () => {
        if (!file || !amount || !declaration) return;

        try {
            await uploadProof({ file, section: selectedSection, description });

            // The service and hook/query handles persistence and re-fetching
            setUploadOpen(false);
            setAmount("");
            setDescription("");
            setFile(null);
        } catch (error) {
            console.error("Upload failed", error);
        }
    };

    const handleSubmit = () => {
        if (!declaration) return;

        // Prepare the submission request
        const request: any = {
            employeeId: declaration.employeeId,
            fiscalYear: declaration.fiscalYear,
            regime: declaration.regime,
            sections: {}
        };

        (Object.keys(declaration.sections) as ProofSectionType[]).forEach(key => {
            request.sections[key] = {
                declaredAmount: declaration.sections[key].declaredAmount,
                items: declaration.sections[key].items.map(i => ({
                    description: i.description,
                    amount: i.declaredAmount,
                    proofIds: i.proofIds
                }))
            };
        });

        submitDeclaration(request);
    };

    const isLocked = declaration?.status === 'Submitted' || declaration?.status === 'Verified' || declaration?.status === 'Locked';

    return (
        <PageContainer>
            <PageHeader
                title="Investment Proofs"
                description="Manage your tax declarations and submit proofs for verification."
                icon={<ShieldCheck className="w-6 h-6 text-primary" />}
                badge={
                    <Badge variant={isLocked ? "secondary" : "default"} className="ml-2">
                        {declaration?.status || 'Draft'}
                    </Badge>
                }
            />

            {/* Top Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Projected Tax"
                    value="₹42,500" // Mock
                    subtitle="Based on current declaration"
                    icon={<IndianRupee className="w-5 h-5 text-primary" />}
                />
                <StatsCard
                    title="Potential Savings"
                    value="₹12,400"
                    subtitle="If you max out 80C"
                    icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
                    trend="up"
                    trendValue="15%"
                />
                <StatsCard
                    title="Submission Deadline"
                    value="15 Mar"
                    subtitle="2025"
                    icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
                />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="regime">Regime Selection</TabsTrigger>
                    <TabsTrigger value="proofs">Proof Submission</TabsTrigger>
                </TabsList>

                <TabsContent value="regime" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Old Regime Card */}
                        <Card className={cn("relative overflow-hidden border-2", declaration?.regime === 'old' ? 'border-primary' : 'border-transparent')}>
                            {declaration?.regime === 'old' && <div className="absolute top-0 right-0 p-2 bg-primary text-primary-foreground text-xs font-bold rounded-bl-lg">SELECTED</div>}
                            <CardHeader>
                                <CardTitle>Old Regime</CardTitle>
                                <CardDescription>Benefit from deductions like 80C, HRA</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Gross Tax</span>
                                    <span className="font-mono">₹58,000</span>
                                </div>
                                <div className="flex justify-between text-sm text-emerald-500">
                                    <span>Deductions Benefit</span>
                                    <span className="font-mono">-₹15,500</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold">
                                    <span>Net Tax</span>
                                    <span>₹42,500</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={declaration?.regime === 'old' ? "default" : "outline"}
                                    disabled={isLocked}
                                    onClick={() => !isLocked && submitDeclaration({ ...declaration!, regime: 'old' } as any)}
                                >
                                    {declaration?.regime === 'old' ? 'Selected' : 'Switch to Old Regime'}
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* New Regime Card */}
                        <Card className={cn("relative overflow-hidden border-2", declaration?.regime === 'new' ? 'border-primary' : 'border-transparent')}>
                            {declaration?.regime === 'new' && <div className="absolute top-0 right-0 p-2 bg-primary text-primary-foreground text-xs font-bold rounded-bl-lg">SELECTED</div>}
                            <CardHeader>
                                <CardTitle>New Regime</CardTitle>
                                <CardDescription>Lower tax rates, fewer deductions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Gross Tax</span>
                                    <span className="font-mono">₹48,000</span>
                                </div>
                                <div className="flex justify-between text-sm text-emerald-500">
                                    <span>Standard Deduction</span>
                                    <span className="font-mono">-₹5,000</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold">
                                    <span>Net Tax</span>
                                    <span>₹43,000</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={declaration?.regime === 'new' ? "default" : "outline"}
                                    disabled={isLocked}
                                    onClick={() => !isLocked && submitDeclaration({ ...declaration!, regime: 'new' } as any)}
                                >
                                    {declaration?.regime === 'new' ? 'Selected' : 'Switch to New Regime'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Recommendation</AlertTitle>
                        <AlertDescription>
                            Based on your declared investments, the <strong>Old Regime</strong> saves you more this year.
                        </AlertDescription>
                    </Alert>
                </TabsContent>

                <TabsContent value="proofs" className="space-y-4">
                    {(['80C', '80D', 'HRA'] as ProofSectionType[]).map(section => (
                        <Card key={section}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle>{section} Deductions</CardTitle>
                                    <CardDescription>
                                        {section === '80C' ? 'Limit: ₹1,50,000' : 'Medical Insurance'}
                                    </CardDescription>
                                </div>
                                {isLocked ? (
                                    <Badge variant="outline"><Lock className="w-3 h-3 mr-1" /> Locked</Badge>
                                ) : (
                                    <Button size="sm" onClick={() => { setSelectedSection(section); setUploadOpen(true); }}>
                                        <Upload className="w-4 h-4 mr-2" /> Upload Proof
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Declared: ₹{declaration?.sections?.[section]?.declaredAmount || 0}</span>
                                        <span>Approved: ₹{declaration?.sections?.[section]?.approvedAmount || 0}</span>
                                    </div>
                                    <Progress value={((declaration?.sections?.[section]?.declaredAmount || 0) / 150000) * 100} className="h-2" />
                                </div>

                                <div className="space-y-2">
                                    {declaration?.sections?.[section]?.items?.length === 0 && (
                                        <div className="text-sm text-muted-foreground text-center py-4">No proofs uploaded yet.</div>
                                    )}
                                    {declaration?.sections?.[section]?.items?.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-primary" />
                                                <div>
                                                    <p className="text-sm font-medium">{item.description}</p>
                                                    <p className="text-xs text-muted-foreground">{item.proofIds.length} file(s)</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-mono text-sm">₹{item.declaredAmount}</p>
                                                    <Badge variant={item.status === 'Approved' ? 'secondary' : 'outline'} className="text-[10px]">
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                                {!isLocked && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                                                        onClick={() => removeProof({ declarationId: declaration.id, sectionType: section, itemId: item.id })}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <div className="flex justify-end pt-4">
                        <Button
                            size="lg"
                            disabled={isLocked || !Object.values(declaration.sections).some(s => s.items.length > 0)}
                            className="w-full md:w-auto"
                            onClick={handleSubmit}
                        >
                            {isLocked ? `Submitted on ${new Date(declaration?.submittedAt || '').toLocaleDateString()}` : 'Submit for Verification'}
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Upload Proof for {selectedSection}</DialogTitle>
                        <DialogDescription>Upload PDF or Image files.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="desc">Description</Label>
                            <Input id="desc" placeholder="e.g. LIC Premium Receipt" value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount (₹)</Label>
                            <Input id="amount" type="number" placeholder="15000" value={amount} onChange={e => setAmount(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="file">File</Label>
                            <Input id="file" type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpload}>Upload</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageContainer>
    );
}
