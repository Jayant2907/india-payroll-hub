import { useMemo, useState } from 'react';
import {
  FileText,
  Users,
  DollarSign,
  ChevronRight,
  Calculator,
  Calendar,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardContent } from '@/components/ui/bento-card';
import { PageHeader, PageContainer, EmptyState } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { getEmployees, getSettlements, setSettlements } from '@/lib/storage';
import {
  calculateGratuity,
  calculateLeaveEncashment,
  calculateNoticePeriodRecovery
} from '@/lib/payroll-logic/gratuity-calculator';
import { useToast } from '@/hooks/use-toast';
import type { Settlement } from '@/types/payroll';

export default function Settlements() {
  const employees = useMemo(() => getEmployees().filter(e => e.status !== 'active'), []);
  const [settlements, setSettlementsState] = useState(getSettlements());
  const { toast } = useToast();

  const [processingEmployee, setProcessingEmployee] = useState<string | null>(null);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [noticeShortfall, setNoticeShortfall] = useState(0);

  const formatCurrency = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const pendingCount = employees.filter(e => !settlements.find(s => s.employeeId === e.id && s.status === 'finalized')).length;

  const selectedEmp = useMemo(() => employees.find(e => e.id === processingEmployee), [processingEmployee, employees]);

  const calculation = useMemo(() => {
    if (!selectedEmp) return null;

    const monthlyBasic = selectedEmp.annualCTC * 0.4 / 12;
    const monthlyCTC = selectedEmp.annualCTC / 12;

    const gratuity = calculateGratuity({
      lastDrawnBasicSalary: monthlyBasic,
      joiningDate: selectedEmp.joiningDate,
      exitDate: selectedEmp.exitDate || new Date().toISOString(),
    });

    const leaveEncashment = calculateLeaveEncashment(leaveBalance, monthlyBasic);
    const noticeRecovery = calculateNoticePeriodRecovery(monthlyCTC, 60, 60 - noticeShortfall);

    return {
      gratuity,
      leaveEncashment,
      noticeRecovery,
      totalSettlement: gratuity.gratuityAmount + leaveEncashment - noticeRecovery
    };
  }, [selectedEmp, leaveBalance, noticeShortfall]);

  const handleFinalize = () => {
    if (!selectedEmp || !calculation) return;

    const newSettlement: Settlement = {
      id: `set-${selectedEmp.id}-${Date.now()}`,
      employeeId: selectedEmp.id,
      employeeName: `${selectedEmp.firstName} ${selectedEmp.lastName}`,
      exitDate: selectedEmp.exitDate || new Date().toISOString(),
      status: 'finalized',
      gratuity: calculation.gratuity.gratuityAmount,
      leaveEncashment: calculation.leaveEncashment,
      noticeRecovery: calculation.noticeRecovery,
      totalAmount: calculation.totalSettlement,
      processedAt: new Date().toISOString(),
    };

    const updated = [...settlements.filter(s => s.employeeId !== selectedEmp.id), newSettlement];
    setSettlements(updated);
    setSettlementsState(updated);
    setProcessingEmployee(null);

    toast({
      title: 'Settlement Finalized',
      description: `F&F for ${selectedEmp.firstName} has been successfully processed.`
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Full & Final Settlement"
        description="Elite F&F engine with automated statutory gratuity and leave calculations."
        icon={<FileText className="h-7 w-7 text-primary" />}
        badge={
          pendingCount > 0 ? (
            <Badge className="status-pending animate-pulse">
              {pendingCount} Pending Processing
            </Badge>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <BentoCard>
          <BentoCardHeader>
            <BentoCardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              Pending Liability
            </BentoCardTitle>
          </BentoCardHeader>
          <BentoCardContent>
            <div className="text-2xl font-black text-rose-400">
              {formatCurrency(employees.length * 150000)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Est. total based on tenure</p>
          </BentoCardContent>
        </BentoCard>

        <BentoCard>
          <BentoCardHeader>
            <BentoCardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              Compliant Exits
            </BentoCardTitle>
          </BentoCardHeader>
          <BentoCardContent>
            <div className="text-2xl font-black text-emerald-400">
              {settlements.filter(s => s.status === 'finalized').length}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Process within 48h of exit</p>
          </BentoCardContent>
        </BentoCard>
      </div>

      <BentoCard>
        <BentoCardHeader>
          <BentoCardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20">
              <Users className="h-4 w-4 text-rose-400" />
            </div>
            Exit Queue
          </BentoCardTitle>
        </BentoCardHeader>
        <BentoCardContent>
          {employees.length === 0 ? (
            <EmptyState
              icon={<DollarSign className="h-10 w-10" />}
              title="No pending settlements"
              description="Excellent! All inactive employees have been settled."
            />
          ) : (
            <Table className="premium-table">
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Employee</TableHead>
                  <TableHead>Exit Date</TableHead>
                  <TableHead>Years of service</TableHead>
                  <TableHead>F&F Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map(emp => {
                  const settlement = settlements.find(s => s.employeeId === emp.id);
                  const isSettled = settlement?.status === 'finalized';

                  return (
                    <TableRow key={emp.id} className="border-border/30 group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-2xl font-semibold text-sm transition-transform group-hover:scale-110 ${isSettled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                            <p className="text-[10px] text-muted-foreground">{emp.employeeCode}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        {emp.exitDate ? new Date(emp.exitDate).toLocaleDateString('en-IN') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted/30">
                          {Math.floor((new Date().getTime() - new Date(emp.joiningDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} Years
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={isSettled ? 'status-active' : 'status-pending'}
                        >
                          {isSettled ? 'Completed' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant={isSettled ? "ghost" : "outline"}
                              size="sm"
                              className="gap-2"
                              onClick={() => {
                                setProcessingEmployee(emp.id);
                                setLeaveBalance(0);
                                setNoticeShortfall(0);
                              }}
                            >
                              {isSettled ? 'View Payslip' : 'Process F&F'}
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-card border-border/50">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-xl font-black">
                                <Calculator className="h-5 w-5 text-primary" />
                                Settlement Worksheet
                              </DialogTitle>
                            </DialogHeader>

                            {selectedEmp && calculation && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                                <div className="space-y-6">
                                  <div className="space-y-3">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Employee Context</Label>
                                    <div className="p-3 bg-muted/20 border border-border/50 rounded-xl">
                                      <p className="text-sm font-bold">{selectedEmp.firstName} {selectedEmp.lastName}</p>
                                      <p className="text-[10px] text-muted-foreground">Joined: {new Date(selectedEmp.joiningDate).toLocaleDateString()}</p>
                                      <p className="text-xs font-mono mt-1">Monthly Basic: {formatCurrency(selectedEmp.annualCTC * 0.4 / 12)}</p>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>Leave Balance (to encash)</Label>
                                      <Input
                                        type="number"
                                        value={leaveBalance}
                                        onChange={(e) => setLeaveBalance(Number(e.target.value))}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Notice Shortfall (days to recover)</Label>
                                      <Input
                                        type="number"
                                        value={noticeShortfall}
                                        onChange={(e) => setNoticeShortfall(Number(e.target.value))}
                                      />
                                    </div>
                                  </div>

                                  <div className={`p-4 rounded-xl border-l-4 ${calculation.gratuity.eligibleForGratuity ? 'bg-emerald-500/5 border-emerald-500' : 'bg-muted/40 border-slate-500 opacity-60'
                                    }`}>
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="text-xs font-bold">Gratuity Eligibility</span>
                                      <Badge variant="outline" className="text-[10px]">
                                        {calculation.gratuity.yearsOfService} Yrs
                                      </Badge>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-tight">
                                      {calculation.gratuity.formula}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="p-5 rounded-3xl bg-primary/10 border-2 border-primary/20 space-y-4">
                                    <h4 className="text-center font-bold text-sm">Settlement Summary</h4>

                                    <div className="space-y-2">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Gratuity</span>
                                        <span className="font-bold text-emerald-400">+{formatCurrency(calculation.gratuity.gratuityAmount)}</span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Leave Encashment</span>
                                        <span className="font-bold text-emerald-400">+{formatCurrency(calculation.leaveEncashment)}</span>
                                      </div>
                                      <div className="flex justify-between text-xs transition-all">
                                        <span className="text-muted-foreground">Notice Recovery</span>
                                        <span className="font-bold text-rose-400">-{formatCurrency(calculation.noticeRecovery)}</span>
                                      </div>
                                    </div>

                                    <div className="h-px bg-border/50 my-2" />

                                    <div className="text-center">
                                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-tighter">Net Settlement Payout</p>
                                      <div className="text-3xl font-black text-primary">
                                        {formatCurrency(calculation.totalSettlement)}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-muted-foreground leading-tight">
                                      Settlement once finalized cannot be reversed. Ensure all statutory deductions are verified.
                                    </p>
                                  </div>

                                  <Button className="w-full bg-primary hover:bg-primary/90 h-12 rounded-2xl gap-2 shadow-lg shadow-primary/20" onClick={handleFinalize}>
                                    <ShieldCheck className="h-5 w-5" />
                                    Finalize & Generate Payslip
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </BentoCardContent>
      </BentoCard>
    </PageContainer>
  );
}
