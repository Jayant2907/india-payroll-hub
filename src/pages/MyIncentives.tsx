import { useMemo } from 'react';
import {
    Trophy,
    TrendingUp,
    Clock,
    ShieldCheck,
    CheckCircle2,
    Calendar,
    Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, PageContainer, StatsCard } from '@/components/ui/page-header';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardContent } from '@/components/ui/bento-card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { getIncentiveAllocations, getIncentiveRules } from '@/lib/storage';

export default function MyIncentives() {
    const { user } = useAuth();

    // In a real app, this would be a React Query hook fetching from API
    const myAllocations = useMemo(() => {
        if (!user?.employeeId) return [];
        return getIncentiveAllocations().filter(a => a.employeeId === user.employeeId);
    }, [user]);

    const rules = useMemo(() => getIncentiveRules(), []);

    const stats = useMemo(() => {
        const total = myAllocations.reduce((sum, a) => sum + a.calculatedAmount, 0);
        const approved = myAllocations.filter(a => a.status === 'Approved').reduce((sum, a) => sum + a.calculatedAmount, 0);
        const pending = myAllocations.filter(a => a.status === 'PendingApproval').length;
        return { total, approved, pending };
    }, [myAllocations]);

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

    const getMonthName = (m: number) => {
        return new Date(2000, m - 1).toLocaleString('en-IN', { month: 'short' });
    };

    return (
        <PageContainer>
            <PageHeader
                title="My Incentives"
                description="Track your performance bonuses, commissions, and variable pay earnings."
                icon={<Trophy className="h-7 w-7 text-primary" />}
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    title="Total Variable Pay"
                    value={formatCurrency(stats.total)}
                    subtitle="FY 2024-25"
                    icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
                />
                <StatsCard
                    title="Approved Payouts"
                    value={formatCurrency(stats.approved)}
                    subtitle="Processed for Payroll"
                    icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                />
                <StatsCard
                    title="Pending Approval"
                    value={stats.pending.toString()}
                    subtitle="Awaiting Manager Action"
                    icon={<Clock className="h-5 w-5 text-amber-500" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main List */}
                <BentoCard className="lg:col-span-8">
                    <BentoCardHeader>
                        <BentoCardTitle>Earning History</BentoCardTitle>
                    </BentoCardHeader>
                    <BentoCardContent>
                        {myAllocations.length === 0 ? (
                            <div className="py-12 text-center">
                                <Target className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                                <h3 className="text-lg font-medium">No incentives yet</h3>
                                <p className="text-muted-foreground">Performance bonuses will appear here once allocated.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cycle</TableHead>
                                        <TableHead>Incentive Type</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myAllocations.map(alloc => {
                                        const rule = rules.find(r => r.id === alloc.ruleId);
                                        return (
                                            <TableRow key={alloc.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{getMonthName(alloc.payrollMonth)} {alloc.payrollYear}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{rule?.name || 'Bonus'}</div>
                                                        <div className="text-[10px] text-muted-foreground">{rule?.category || 'General'}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-emerald-500">
                                                    {formatCurrency(alloc.calculatedAmount)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            alloc.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                                alloc.status === 'PendingApproval' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-muted text-muted-foreground'
                                                        }
                                                        variant="outline"
                                                    >
                                                        {alloc.status === 'Approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                        {alloc.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </BentoCardContent>
                </BentoCard>

                {/* Side Panel: Policy Highlights */}
                <div className="lg:col-span-4 space-y-6">
                    <BentoCard>
                        <BentoCardHeader>
                            <BentoCardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                How it works
                            </BentoCardTitle>
                        </BentoCardHeader>
                        <BentoCardContent className="space-y-4">
                            <div className="p-4 bg-muted/30 rounded-xl space-y-2 text-sm">
                                <h4 className="font-semibold text-foreground">Monthly Processing</h4>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                    Incentives are calculated by the 25th of every month. Once approved, they are added to your monthly payroll slip.
                                </p>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-xl space-y-2 text-sm">
                                <h4 className="font-semibold text-foreground">Tax Implications</h4>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                    Variable pay is fully taxable as per your income tax slab. See the <strong>Tax Optimizer</strong> to plan your tax liability.
                                </p>
                            </div>

                            <div className="p-4 border border-indigo-500/20 bg-indigo-50/5 rounded-xl space-y-2 text-sm">
                                <h4 className="font-semibold text-indigo-400">Have a query?</h4>
                                <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                                    If you believe there is a discrepancy in your incentive calculation, please raise a ticket.
                                </p>
                                <a href="mailto:finance@company.com?subject=Incentive Query" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                                    Contact Finance Team →
                                </a>
                            </div>
                        </BentoCardContent>
                    </BentoCard>
                </div>
            </div>
        </PageContainer>
    );
}
