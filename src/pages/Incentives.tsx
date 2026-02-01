import { useState, useMemo, useEffect } from 'react';
import {
    Trophy,
    Target,
    Send,
    CheckCircle2,
    Clock,
    Calculator,
    Plus,
    Filter,
    History,
    TrendingUp,
    AlertCircle,
    ShieldCheck,
    Zap,
    Trash2,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader, PageContainer } from '@/components/ui/page-header';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardContent } from '@/components/ui/bento-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    getIncentiveRules,
    getIncentiveAllocations,
    getEmployees,
    updateIncentiveStatus,
    setIncentiveRules,
    setIncentiveAllocations,
    resetIncentiveData
} from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createAllocation, generateRecurringAllocations } from '@/lib/payroll-logic/variable-pay';
import type { IncentiveRule, IncentiveAllocation, IncentiveCategory, RecurrenceType, IncentiveStatus } from '@/types/payroll';

export default function Incentives() {
    const { user } = useAuth();
    const { toast } = useToast();

    // Data State
    const [rules, setRules] = useState<IncentiveRule[]>([]);
    const [allocations, setAllocations] = useState<IncentiveAllocation[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);

    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterMonth, setFilterMonth] = useState<string>('all');
    const [showAddRule, setShowAddRule] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedRuleForAssign, setSelectedRuleForAssign] = useState<IncentiveRule | null>(null);

    // Assignment state
    const [assignmentTarget, setAssignmentTarget] = useState<'individual' | 'department' | 'all'>('individual');
    const [targetDept, setTargetDept] = useState<string>('');
    const [targetEmployeeIds, setTargetEmployeeIds] = useState<string[]>([]);
    const [newRule, setNewRule] = useState<Partial<IncentiveRule>>({
        name: '',
        category: 'Performance',
        formulaExpression: 'monthlyBasic * 0.1',
        baseComponent: 'Basic',
        recurrenceType: 'OneTime',
        recurrenceCount: 1,
        taxTreatmentType: 'FullyTaxable',
        pfApplicable: false,
        esiApplicable: false,
    });

    // Initial Data Load
    useEffect(() => {
        setRules(getIncentiveRules());
        setAllocations(getIncentiveAllocations());
        setEmployees(getEmployees());
    }, []);

    const filteredAllocations = useMemo(() => {
        let result = allocations;
        if (filterStatus !== 'all') result = result.filter(a => a.status === filterStatus);
        if (filterMonth !== 'all') result = result.filter(a => a.payrollMonth === Number(filterMonth));
        return result;
    }, [allocations, filterStatus, filterMonth]);

    const stats = useMemo(() => {
        const pending = allocations.filter(a => a.status === 'PendingApproval').length;
        const totalValue = allocations.reduce((sum, a) => sum + a.calculatedAmount, 0);
        const approvedThisMonth = allocations.filter(a => a.status === 'Approved').length;
        return { pending, totalValue, approvedThisMonth };
    }, [allocations]);

    const handleCreateRule = () => {
        const rule: IncentiveRule = {
            ...(newRule as IncentiveRule),
            id: `rule-${Date.now()}`,
            version: 1,
            createdBy: user?.name || 'Admin',
            createdAt: new Date().toISOString(),
            effectiveFrom: new Date().toISOString(),
            isLocked: false,
        };

        const updatedRules = [...rules, rule];
        setIncentiveRules(updatedRules);
        setRules(updatedRules);
        setShowAddRule(false);
        toast({
            title: 'Incentive Rule Created',
            description: `${rule.name} has been added to the master list.`,
        });
    };

    const handleOpenAssign = (rule: IncentiveRule) => {
        setSelectedRuleForAssign(rule);
        setShowAssignModal(true);
    };

    const handleExecuteAssignment = () => {
        if (!selectedRuleForAssign) return;

        let targets = [];
        if (assignmentTarget === 'all') {
            targets = employees;
        } else if (assignmentTarget === 'department') {
            targets = employees.filter(e => e.department === targetDept);
        } else {
            targets = employees.filter(e => targetEmployeeIds.includes(e.id));
        }

        if (targets.length === 0) {
            toast({
                title: 'No targets selected',
                description: 'Please select at least one employee or department.',
                variant: 'destructive'
            });
            return;
        }

        let newItems: IncentiveAllocation[] = [];

        targets.forEach(emp => {
            if (selectedRuleForAssign.recurrenceType !== 'OneTime' && selectedRuleForAssign.recurrenceCount > 1) {
                const recurring = generateRecurringAllocations(
                    selectedRuleForAssign,
                    emp,
                    new Date().getMonth() + 1,
                    new Date().getFullYear()
                );
                newItems = [...newItems, ...recurring];
            } else {
                newItems.push(createAllocation(
                    selectedRuleForAssign,
                    emp,
                    new Date().getMonth() + 1,
                    new Date().getFullYear()
                ));
            }
        });

        const updatedAllocations = [...allocations, ...newItems];
        setIncentiveAllocations(updatedAllocations);
        setAllocations(updatedAllocations);
        setShowAssignModal(false);
        setTargetEmployeeIds([]);
        setTargetDept('');

        toast({
            title: 'Incentives Allocated',
            description: `Successfully generated ${newItems.length} draft allocations.`,
        });
    };

    const handleStatusUpdate = (id: string, status: IncentiveStatus) => {
        updateIncentiveStatus(id, status, user?.name || 'Admin', 'Updated via Management Console');
        // Update state locally to avoid reload
        setAllocations(getIncentiveAllocations());
        setRules(getIncentiveRules()); // Rules might get locked
        toast({
            title: `Status Updated`,
            description: `Incentive is now ${status}.`,
        });
    };

    const handleBulkApprove = () => {
        const pending = allocations.filter(a => a.status === 'PendingApproval');
        if (pending.length === 0) return;

        pending.forEach(a => {
            updateIncentiveStatus(a.id, 'Approved', user?.name || 'Admin', 'Bulk Approved via Command Center');
        });

        setAllocations(getIncentiveAllocations());
        setRules(getIncentiveRules());
        toast({
            title: 'Bulk Approval Complete',
            description: `Successfully approved ${pending.length} incentives.`,
        });
    };

    const handleResetData = () => {
        resetIncentiveData();
        setAllocations([]);
        toast({
            title: 'Data Reset',
            description: 'All incentive allocations have been cleared.',
            variant: 'destructive'
        });
    };

    const getMonthName = (m: number) => {
        return new Date(2000, m - 1).toLocaleString('en-IN', { month: 'short' });
    };

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

    return (
        <PageContainer>
            <PageHeader
                title="Incentive Management"
                description="Enterprise command center for variable pay, performance bonuses, and sales commissions."
                icon={<Trophy className="h-7 w-7 text-primary animate-bounce-slow" />}
                actions={
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2 border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10" onClick={handleResetData}>
                            <Trash2 className="h-4 w-4" />
                            Reset All Data
                        </Button>
                        <Button variant="outline" className="gap-2 border-primary/20 bg-primary/5 text-primary">
                            <History className="h-4 w-4" />
                            Audit Logs
                        </Button>
                        <Button onClick={() => setShowAddRule(true)} className="gap-2 shadow-lg shadow-primary/20">
                            <Plus className="h-4 w-4" />
                            Define New Rule
                        </Button>
                    </div>
                }
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <BentoCard className="border-l-4 border-l-amber-500">
                        <BentoCardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Pending Approvals</p>
                                    <h3 className="text-3xl font-bold mt-1">{stats.pending}</h3>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-amber-500" />
                                </div>
                            </div>
                        </BentoCardContent>
                    </BentoCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <BentoCard className="border-l-4 border-l-emerald-500">
                        <BentoCardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Variable Payout</p>
                                    <h3 className="text-3xl font-bold mt-1 text-emerald-400">{formatCurrency(stats.totalValue)}</h3>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                                </div>
                            </div>
                        </BentoCardContent>
                    </BentoCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <BentoCard className="border-l-4 border-l-primary">
                        <BentoCardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Approved for Payroll</p>
                                    <h3 className="text-3xl font-bold mt-1">{stats.approvedThisMonth}</h3>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </BentoCardContent>
                    </BentoCard>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main List */}
                <BentoCard className="lg:col-span-8">
                    <BentoCardHeader className="flex flex-row items-center justify-between">
                        <BentoCardTitle>Active Incentives</BentoCardTitle>
                        <div className="flex gap-2">
                            <Select value={filterMonth} onValueChange={setFilterMonth}>
                                <SelectTrigger className="w-[120px] h-8 bg-muted/30 text-xs">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Every Month</SelectItem>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                        <SelectItem key={m} value={m.toString()}>{getMonthName(m)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[150px] h-8 bg-muted/30 text-xs">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="PendingApproval">Pending Approval</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                </SelectContent>
                            </Select>
                            {stats.pending > 0 && (
                                <Button size="sm" variant="outline" className="h-8 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10 text-xs" onClick={handleBulkApprove}>
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Bulk Approve
                                </Button>
                            )}
                        </div>
                    </BentoCardHeader>
                    <BentoCardContent>
                        {filteredAllocations.length === 0 ? (
                            <div className="py-12 text-center">
                                <Target className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                                <h3 className="text-lg font-medium">No incentives found</h3>
                                <p className="text-muted-foreground">Define a rule and assign it to employees to get started.</p>
                            </div>
                        ) : (
                            <Table className="premium-table">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Cycle</TableHead>
                                        <TableHead>Installment</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAllocations.map(alloc => {
                                        const emp = employees.find(e => e.id === alloc.employeeId);
                                        const rule = rules.find(r => r.id === alloc.ruleId);
                                        return (
                                            <TableRow key={alloc.id}>
                                                <TableCell>
                                                    <div className="font-medium">{emp?.firstName} {emp?.lastName}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase">{emp?.employeeCode}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold">{getMonthName(alloc.payrollMonth)}</span>
                                                        <span className="text-[10px] text-muted-foreground">{alloc.payrollYear}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {alloc.installmentNumber ? (
                                                        <Badge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-none">
                                                            {alloc.installmentNumber} of {alloc.totalInstallments}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground italic">One-time</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-emerald-400">
                                                    {formatCurrency(alloc.calculatedAmount)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            alloc.status === 'Approved' ? 'status-active text-[10px]' :
                                                                alloc.status === 'PendingApproval' ? 'status-pending text-[10px]' : 'bg-muted text-muted-foreground text-[10px]'
                                                        }
                                                    >
                                                        {alloc.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {alloc.status === 'Draft' && (
                                                        <Button size="sm" variant="ghost" className="h-8 text-amber-500 hover:text-amber-400 text-xs" onClick={() => handleStatusUpdate(alloc.id, 'PendingApproval')}>
                                                            <Send className="h-3 w-3 mr-1" /> Submit
                                                        </Button>
                                                    )}
                                                    {alloc.status === 'PendingApproval' && (
                                                        <Button size="sm" variant="ghost" className="h-8 text-emerald-500 hover:text-emerald-400 text-xs" onClick={() => handleStatusUpdate(alloc.id, 'Approved')}>
                                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </BentoCardContent>
                </BentoCard>

                {/* Master Rules */}
                <div className="lg:col-span-4 space-y-6">
                    <BentoCard>
                        <BentoCardHeader>
                            <BentoCardTitle className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-400" />
                                Master Rules
                            </BentoCardTitle>
                        </BentoCardHeader>
                        <BentoCardContent className="space-y-4">
                            {rules.length === 0 ? (
                                <div className="p-4 bg-muted/20 border border-dashed rounded-lg text-center">
                                    <p className="text-sm text-muted-foreground italic">No rules defined yet</p>
                                </div>
                            ) : (
                                rules.map(rule => (
                                    <div key={rule.id} className="p-4 bg-muted/30 border border-border/50 rounded-xl hover:border-primary/50 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-sm tracking-wide">{rule.name}</h4>
                                            <Badge className="text-[10px] uppercase font-bold tracking-tighter">v{rule.version}</Badge>
                                        </div>
                                        <code className="text-[10px] text-emerald-400 block mb-3 bg-emerald-950/20 p-2 rounded border border-emerald-500/10">
                                            {rule.formulaExpression}
                                        </code>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{rule.recurrenceType}</p>
                                                {rule.recurrenceCount > 1 && (
                                                    <p className="text-[9px] text-primary">{rule.recurrenceCount} Months</p>
                                                )}
                                            </div>
                                            <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleOpenAssign(rule)}>
                                                <Plus className="h-3 w-3" /> Assign
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}

                            <Button variant="ghost" className="w-full h-8 text-xs border border-dashed border-border/50 hover:bg-primary/5 hover:text-primary transition-all" onClick={() => setShowAddRule(true)}>
                                <Plus className="h-3 w-3 mr-1" /> New Rule
                            </Button>
                        </BentoCardContent>
                    </BentoCard>

                    <BentoCard className="bg-primary/5 border-primary/20">
                        <BentoCardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <AlertCircle className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold">Audit Assurance</p>
                                    <p className="text-xs text-muted-foreground">Every approved incentive is digitally locked and timestamped for financial audits.</p>
                                </div>
                            </div>
                        </BentoCardContent>
                    </BentoCard>
                </div>
            </div>

            {/* Add Rule Dialog */}
            <AnimatePresence>
                {showAddRule && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl"
                        >
                            <div className="p-6 border-b border-border/50 flex justify-between items-center">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Calculator className="h-5 w-5 text-primary" />
                                    New Rule
                                </h2>
                                <Button variant="ghost" size="sm" onClick={() => setShowAddRule(false)}>✕</Button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Rule Name</Label>
                                    <Input
                                        value={newRule.name}
                                        onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                                        placeholder="e.g. Sales Quarter Bonus"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select onValueChange={(v: IncentiveCategory) => setNewRule({ ...newRule, category: v })}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Sales">Sales</SelectItem>
                                                <SelectItem value="Performance">Performance</SelectItem>
                                                <SelectItem value="Retention">Retention</SelectItem>
                                                <SelectItem value="Adhoc">Adhoc</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Recurrence</Label>
                                        <Select onValueChange={(v: RecurrenceType) => setNewRule({ ...newRule, recurrenceType: v })}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="OneTime">One Time</SelectItem>
                                                <SelectItem value="Monthly">Monthly</SelectItem>
                                                <SelectItem value="Quarterly">Quarterly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Duration (Months)</Label>
                                        <Input
                                            type="number"
                                            value={newRule.recurrenceCount}
                                            onChange={e => setNewRule({ ...newRule, recurrenceCount: Number(e.target.value) })}
                                            min={1}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>PF Applicable</Label>
                                        <div className="flex items-center gap-2 pt-2">
                                            <input
                                                type="checkbox"
                                                checked={newRule.pfApplicable}
                                                onChange={e => setNewRule({ ...newRule, pfApplicable: e.target.checked })}
                                            />
                                            <span className="text-xs">Yes</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex justify-between">
                                        <span>Formula expression</span>
                                        <span className="text-[10px] text-primary">monthlyBasic, monthlyCTC</span>
                                    </Label>
                                    <Input
                                        className="font-mono text-sm bg-muted/20"
                                        value={newRule.formulaExpression}
                                        onChange={e => setNewRule({ ...newRule, formulaExpression: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-border/50 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowAddRule(false)}>Cancel</Button>
                                <Button onClick={handleCreateRule} className="bg-primary shadow-lg shadow-primary/20">
                                    Save Rule
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bulk Assign Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl"
                        >
                            <div className="p-6 border-b border-border/50 flex justify-between items-center">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Send className="h-5 w-5 text-primary" />
                                    Assign {selectedRuleForAssign?.name}
                                </h2>
                                <Button variant="ghost" size="sm" onClick={() => setShowAssignModal(false)}>✕</Button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Targets</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={assignmentTarget === 'individual' ? 'default' : 'outline'}
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => setAssignmentTarget('individual')}
                                        >
                                            Individuals
                                        </Button>
                                        <Button
                                            variant={assignmentTarget === 'department' ? 'default' : 'outline'}
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => setAssignmentTarget('department')}
                                        >
                                            By Dept
                                        </Button>
                                        <Button
                                            variant={assignmentTarget === 'all' ? 'default' : 'outline'}
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => setAssignmentTarget('all')}
                                        >
                                            All
                                        </Button>
                                    </div>
                                </div>

                                {assignmentTarget === 'department' && (
                                    <div className="space-y-2">
                                        <Label>Which Department?</Label>
                                        <Select onValueChange={setTargetDept}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Choose Department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from(new Set(employees.map(e => e.department))).map(dept => (
                                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {assignmentTarget === 'individual' && (
                                    <div className="space-y-2">
                                        <Label>Select Personnel</Label>
                                        <div className="max-h-[200px] overflow-y-auto border border-border/50 rounded-lg p-2 space-y-1 bg-muted/20">
                                            {employees.map(emp => (
                                                <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-border h-3 w-3"
                                                        checked={targetEmployeeIds.includes(emp.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setTargetEmployeeIds([...targetEmployeeIds, emp.id]);
                                                            else setTargetEmployeeIds(targetEmployeeIds.filter(id => id !== emp.id));
                                                        }}
                                                    />
                                                    <div className="text-xs">
                                                        <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase">{emp.department}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-border/50 flex justify-end gap-3">
                                <Button variant="outline" size="sm" onClick={() => setShowAssignModal(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleExecuteAssignment} className="bg-primary shadow-lg shadow-primary/20">
                                    Execute Bulk Assign
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageContainer>
    );
}
