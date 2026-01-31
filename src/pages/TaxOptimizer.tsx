import { useState, useMemo, useEffect } from 'react';
import {
    Calculator,
    TrendingUp,
    Lightbulb,
    ArrowLeftRight,
    ChevronRight,
    ShieldCheck,
    AlertCircle,
    BarChart3,
    Dna,
    Bug
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BentoCard,
    BentoCardHeader,
    BentoCardTitle,
    BentoCardContent
} from '@/components/ui/bento-card';
import { PageHeader, PageContainer } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    Legend
} from 'recharts';
import { getTaxSettings, getEmployees } from '@/lib/storage';
import { optimizeTaxRegime, type OptimizerInput } from '@/lib/payroll-logic/tax-optimizer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

const CHART_COLORS = ['hsl(262, 80%, 65%)', 'hsl(173, 80%, 50%)', 'hsl(47, 96%, 58%)', 'hsl(340, 75%, 60%)'];

export default function TaxOptimizer() {
    const taxSettings = useMemo(() => getTaxSettings(), []);
    const employees = useMemo(() => getEmployees(), []);

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '');
    const [showDebug, setShowDebug] = useState(false);

    const selectedEmployee = useMemo(() =>
        employees.find(e => e.id === selectedEmployeeId) || employees[0],
        [selectedEmployeeId, employees]);

    // Form state with default values
    const [formData, setFormData] = useState({
        annualGrossIncome: selectedEmployee?.annualCTC || 1200000,
        basicSalary: (selectedEmployee?.annualCTC || 1200000) * 0.4 / 12,
        hra: (selectedEmployee?.annualCTC || 1200000) * 0.2 / 12,
        rentPaid: 25000,
        isMetro: true,
        section80C: 150000,
        section80D: 25000,
        nps80CCD1B: 50000,
        homeLoanInterest: 0,
    });

    // Sync form data with selected employee
    useEffect(() => {
        if (selectedEmployee) {
            setFormData({
                annualGrossIncome: selectedEmployee.annualCTC,
                basicSalary: selectedEmployee.annualCTC * 0.4 / 12,
                hra: selectedEmployee.annualCTC * 0.2 / 12,
                rentPaid: 25000,
                isMetro: true,
                section80C: 150000,
                section80D: 25000,
                nps80CCD1B: 50000,
                homeLoanInterest: 0,
            });
        }
    }, [selectedEmployee]);

    const optimizerResult = useMemo(() => {
        const input: OptimizerInput = {
            annualGrossIncome: formData.annualGrossIncome,
            basicSalary: formData.basicSalary,
            hra: formData.hra,
            rentPaid: formData.rentPaid,
            isMetro: formData.isMetro,
            taxSettings,
            investments: {
                section80C: formData.section80C,
                section80D: formData.section80D,
                nps80CCD1B: formData.nps80CCD1B,
                homeLoanInterest: formData.homeLoanInterest,
            }
        };
        return optimizeTaxRegime(input);
    }, [formData, taxSettings]);

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(v);

    const comparisonData = [
        { name: 'Old Regime', tax: Math.round(optimizerResult.oldRegime.totalTax) },
        { name: 'New Regime', tax: Math.round(optimizerResult.newRegime.totalTax) },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Smart Tax Optimizer"
                description="Elite tax engine comparing Old vs New regimes with precision math and AI-driven suggestions."
                icon={<Dna className="h-7 w-7 text-primary animate-pulse" />}
                badge={
                    <div className="flex gap-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            FY {taxSettings.fiscalYear}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] gap-1 opacity-50 hover:opacity-100"
                            onClick={() => setShowDebug(!showDebug)}
                        >
                            <Bug className="h-3 w-3" />
                            Debug
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Input Panel */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    className="lg:col-span-4 space-y-6"
                >
                    <BentoCard>
                        <BentoCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <BentoCardTitle className="flex items-center gap-2">
                                <Calculator className="h-4 w-4 text-primary" />
                                Financial Inputs
                            </BentoCardTitle>
                            <div className="w-[180px]">
                                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                                    <SelectTrigger className="h-8 text-xs bg-muted/50">
                                        <SelectValue placeholder="Select Employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map(emp => (
                                            <SelectItem key={emp.id} value={emp.id} className="text-xs">
                                                {emp.firstName} {emp.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </BentoCardHeader>
                        <BentoCardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Annual Gross Income (CTC)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                                    <Input
                                        type="number"
                                        className="pl-7 bg-muted/20"
                                        value={formData.annualGrossIncome}
                                        onChange={(e) => setFormData({ ...formData, annualGrossIncome: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Monthly Basic</Label>
                                    <Input
                                        type="number"
                                        value={formData.basicSalary}
                                        onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Monthly HRA</Label>
                                    <Input
                                        type="number"
                                        value={formData.hra}
                                        onChange={(e) => setFormData({ ...formData, hra: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Monthly Rent Paid</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Metro City</span>
                                        <Switch
                                            checked={formData.isMetro}
                                            onCheckedChange={(v) => setFormData({ ...formData, isMetro: v })}
                                        />
                                    </div>
                                </div>
                                <Input
                                    type="number"
                                    value={formData.rentPaid}
                                    onChange={(e) => setFormData({ ...formData, rentPaid: Number(e.target.value) })}
                                />
                            </div>

                            <div className="pt-4 border-t border-border/50 space-y-4">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Investments (Old Regime)</p>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="flex justify-between">
                                            <span>Section 80C</span>
                                            <span className="text-[10px] text-primary">Limit: ₹1.5L</span>
                                        </Label>
                                        <Input
                                            type="number"
                                            value={formData.section80C}
                                            onChange={(e) => setFormData({ ...formData, section80C: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Section 80D (Health)</Label>
                                        <Input
                                            type="number"
                                            value={formData.section80D}
                                            onChange={(e) => setFormData({ ...formData, section80D: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>NPS 80CCD(1B)</Label>
                                        <Input
                                            type="number"
                                            value={formData.nps80CCD1B}
                                            onChange={(e) => setFormData({ ...formData, nps80CCD1B: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </BentoCardContent>
                    </BentoCard>
                </motion.div>

                {/* Results Panel */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    className="lg:col-span-8 space-y-6"
                >
                    {/* Recommendation Top Card */}
                    <motion.div
                        layout
                        className={`p-6 rounded-2xl border-2 transition-all duration-500 overflow-hidden relative ${optimizerResult.recommendation === 'new'
                            ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]'
                            : 'bg-primary/10 border-primary/30 shadow-[0_0_40px_-10px_rgba(139,92,246,0.2)]'
                            }`}
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${optimizerResult.recommendation === 'new' ? 'bg-emerald-500 text-white' : 'bg-primary text-white'
                                    }`}>
                                    <ShieldCheck className="h-10 w-10" />
                                </div>
                                <div>
                                    <Badge variant="outline" className="mb-1 bg-background/50 backdrop-blur-sm">System Recommendation</Badge>
                                    <h2 className="text-3xl font-bold">
                                        Switch to <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70 uppercase">
                                            {optimizerResult.recommendation === 'new' ? 'New Tax Regime' : 'Old Tax Regime'}
                                        </span>
                                    </h2>
                                </div>
                            </div>
                            <div className="text-center md:text-right">
                                <p className="text-sm text-muted-foreground mb-1">Potential Annual Savings</p>
                                <div className="text-4xl font-black text-emerald-400">
                                    {formatCurrency(optimizerResult.savingsAmount)}
                                </div>
                            </div>
                        </div>

                        {/* Blazing background animation element */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.2, 0.1]
                            }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[100px] ${optimizerResult.recommendation === 'new' ? 'bg-emerald-500' : 'bg-primary'
                                }`}
                        />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tax Comparison Chart */}
                        <BentoCard>
                            <BentoCardHeader>
                                <BentoCardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                    Regime Comparison
                                </BentoCardTitle>
                            </BentoCardHeader>
                            <BentoCardContent className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis hide />
                                        <RechartsTooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                                        />
                                        <Bar dataKey="tax" radius={[10, 10, 0, 0]}>
                                            {comparisonData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.name.includes(optimizerResult.recommendation.toUpperCase()) ? 'hsl(173, 80%, 50%)' : 'hsl(262, 80%, 65%)'}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </BentoCardContent>
                        </BentoCard>

                        {/* Smart Suggestions */}
                        <BentoCard>
                            <BentoCardHeader>
                                <BentoCardTitle className="flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-amber-400" />
                                    Tax Optimization Tips
                                </BentoCardTitle>
                            </BentoCardHeader>
                            <BentoCardContent>
                                <ScrollArea className="h-64 pr-4">
                                    <div className="space-y-3">
                                        {optimizerResult.suggestions.map((tip, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                key={i}
                                                className={`p-3 rounded-xl border flex gap-3 ${tip.type === 'tip' ? 'bg-emerald-500/5 border-emerald-500/20' :
                                                    tip.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
                                                        'bg-primary/5 border-primary/20'
                                                    }`}
                                            >
                                                <div className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${tip.type === 'tip' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    tip.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-primary/20 text-primary'
                                                    }`}>
                                                    {tip.type === 'tip' ? <TrendingUp className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{tip.title}</p>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
                                                    {tip.potentialSaving && (
                                                        <p className="text-[10px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
                                                            <ShieldCheck className="h-3 w-3" />
                                                            Potential Saving: {formatCurrency(tip.potentialSaving)}
                                                        </p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </BentoCardContent>
                        </BentoCard>
                    </div>

                    {/* Breakdown Tabs */}
                    <BentoCard>
                        <Tabs defaultValue="old">
                            <BentoCardHeader>
                                <TabsList className="grid w-[400px] grid-cols-2">
                                    <TabsTrigger value="old">Old Regime Details</TabsTrigger>
                                    <TabsTrigger value="new">New Regime Details</TabsTrigger>
                                </TabsList>
                            </BentoCardHeader>
                            <BentoCardContent>
                                <TabsContent value="old" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="bg-muted/30 p-4 rounded-2xl space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Gross Income</span>
                                                    <span className="font-semibold">{formatCurrency(optimizerResult.oldRegime.totalTax + optimizerResult.oldRegime.taxableIncome)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Total Deductions</span>
                                                    <span className="font-semibold text-rose-400">
                                                        - {formatCurrency(Object.values(optimizerResult.oldRegime.deductionsApplied).reduce((a, b) => a + b, 0))}
                                                    </span>
                                                </div>
                                                <div className="h-px bg-border my-2" />
                                                <div className="flex justify-between font-bold">
                                                    <span>Taxable Income</span>
                                                    <span className="text-emerald-400">{formatCurrency(optimizerResult.oldRegime.taxableIncome)}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Deductions Applied</Label>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {Object.entries(optimizerResult.oldRegime.deductionsApplied).map(([key, value]) => (
                                                        <div key={key} className="flex justify-between text-xs p-2 rounded-lg bg-muted/20 border border-border/50">
                                                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                            <span className="font-mono">{formatCurrency(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                                                <Calculator className="h-6 w-6 text-primary" />
                                            </div>
                                            <h4 className="text-lg font-bold mb-1">Old Regime Total Tax</h4>
                                            <p className="text-muted-foreground text-sm mb-4">Including 4% Education Cess</p>
                                            <div className="text-4xl font-black text-primary">
                                                {formatCurrency(optimizerResult.oldRegime.totalTax)}
                                            </div>
                                            <div className="mt-4 text-xs font-mono text-muted-foreground">
                                                Approx. Monthly TDS: {formatCurrency(optimizerResult.oldRegime.monthlyTDS)}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="new" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                                            {optimizerResult.newRegime.rebateApplied && (
                                                <div className="mb-4">
                                                    <Badge className="bg-emerald-500 text-white animate-bounce">
                                                        Section 87A Rebate Applied!
                                                    </Badge>
                                                </div>
                                            )}
                                            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                                                <Calculator className="h-6 w-6 text-emerald-400" />
                                            </div>
                                            <h4 className="text-lg font-bold mb-1">New Regime Total Tax</h4>
                                            <p className="text-muted-foreground text-sm mb-4">Standard Deduction: {formatCurrency(taxSettings.standardDeduction)}</p>
                                            <div className="text-4xl font-black text-emerald-400">
                                                {formatCurrency(optimizerResult.newRegime.totalTax)}
                                            </div>
                                            <div className="mt-4 text-xs font-mono text-muted-foreground">
                                                Approx. Monthly TDS: {formatCurrency(optimizerResult.newRegime.monthlyTDS)}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Taxable Slab Calculation</Label>
                                            <div className="space-y-2">
                                                <div className="p-3 rounded-xl border border-border/50 bg-muted/10">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>Slab 0-3L @ 0%</span>
                                                        <span className="text-muted-foreground">₹0</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>Slab 3-6L @ 5%</span>
                                                        <span className="text-muted-foreground">₹15,000</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>Slab 6-9L @ 10%</span>
                                                        <span className="text-muted-foreground">₹30,000</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs font-bold mt-2 pt-2 border-t border-dashed">
                                                        <span>Total Slab Tax</span>
                                                        <span>{formatCurrency(optimizerResult.newRegime.taxPayable)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </BentoCardContent>
                        </Tabs>
                    </BentoCard>
                </motion.div>
            </div>

            {/* Debug Panel - Floating */}
            <AnimatePresence>
                {showDebug && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-6 left-6 right-6 z-50 pointer-events-none"
                    >
                        <Card className="glass-card shadow-2xl border-primary/20 pointer-events-auto">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2 font-mono text-xs text-primary">
                                        <Bug className="h-3 w-3" />
                                        LIVE COMPUTATION ENGINE DATA
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-6" onClick={() => setShowDebug(false)}>Close</Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <ScrollArea className="h-40 bg-black/40 rounded-xl p-3">
                                        <pre className="text-[10px] font-mono text-emerald-400">
                                            {JSON.stringify(optimizerResult, null, 2)}
                                        </pre>
                                    </ScrollArea>
                                    <ScrollArea className="h-40 bg-black/40 rounded-xl p-3">
                                        <pre className="text-[10px] font-mono text-primary">
                                            {JSON.stringify(formData, null, 2)}
                                        </pre>
                                    </ScrollArea>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageContainer>
    );
}
