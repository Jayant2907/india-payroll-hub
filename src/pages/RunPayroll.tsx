import { useState, useMemo } from 'react';
import { Users, Calendar, IndianRupee, Lock, CheckCircle2, Receipt, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardContent } from '@/components/ui/bento-card';
import { PageHeader, PageContainer, StepIndicator, EmptyState } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  getEmployees,
  getSalaryStructures,
  getPFSettings,
  getPTSlabs,
  getPayrollRuns,
  setPayrollRuns,
  getTaxSettings,
  getIncentiveRules,
  getIncentiveAllocations,
  setIncentiveAllocations
} from '@/lib/storage';
import type { Employee, PayrollRun, Payslip, VariablePay } from '@/types/payroll';
import { calculateEmployeeTax } from '@/lib/payroll-logic';
import { useToast } from '@/hooks/use-toast';

const STEPS = ['Select Employees', 'Leave & Attendance', 'Variable Pay', 'Review & Freeze'];

export default function RunPayroll() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, { lwp: number; paidLeave: number }>>({});
  const [variablePayData, setVariablePayData] = useState<Record<string, VariablePay[]>>({});
  const { toast } = useToast();

  const employees = useMemo(() => getEmployees().filter(e => e.status === 'active'), []);
  const pfSettings = useMemo(() => getPFSettings(), []);
  const ptSlabs = useMemo(() => getPTSlabs(), []);
  const taxSettings = useMemo(() => getTaxSettings(), []);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const periodLabel = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const toggleEmployee = (id: string) => {
    setSelectedEmployees(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(e => e.id));
    }
  };

  const calculatePayslip = (emp: Employee): Payslip => {
    const monthlyCTC = emp.annualCTC / 12;
    const basicSalary = monthlyCTC * 0.4;
    const hra = basicSalary * 0.5;
    const otherAllowances = monthlyCTC - basicSalary - hra;

    const attendance = attendanceData[emp.id] || { lwp: 0, paidLeave: 0 };
    const lwpDeduction = (monthlyCTC / 30) * attendance.lwp;

    const variableEarnings = (variablePayData[emp.id] || []).filter(v => v.type === 'earning');
    const variableDeductions = (variablePayData[emp.id] || []).filter(v => v.type === 'deduction');
    const totalVarEarnings = variableEarnings.reduce((sum, v) => sum + v.amount, 0);
    const totalVarDeductions = variableDeductions.reduce((sum, v) => sum + v.amount, 0);

    const grossEarnings = basicSalary + hra + otherAllowances - lwpDeduction + totalVarEarnings;

    const pfWages = basicSalary + variableEarnings.filter(v => v.pfApplicable).reduce((sum, v) => sum + v.amount, 0);
    const pfDeduction = pfSettings.enabled ? Math.min(pfWages, pfSettings.wageCeiling) * (pfSettings.employeeContribution / 100) : 0;

    const ptSlab = ptSlabs.find(s => s.state === (emp.state || 'Karnataka') && grossEarnings >= s.minSalary && grossEarnings <= s.maxSalary);
    const ptDeduction = ptSlab?.taxAmount || 0;


    // Determine Fiscal Year for Tax Calculation
    const fiscalYearStart = currentMonth >= 4 ? currentYear : currentYear - 1;
    const fiscalYearEnd = (fiscalYearStart + 1) % 100; // e.g., 26 for 2026
    const fiscalYear = `${fiscalYearStart}-${fiscalYearEnd}`;

    // Real-time tax calculation with Variable Pay impact
    const projectedVariable = totalVarEarnings * 12; // Simple projection for tax spiking demo
    const taxCalculation = calculateEmployeeTax({
      annualGrossIncome: emp.annualCTC + projectedVariable,
      regime: emp.taxRegime,
      basicSalary: emp.annualCTC * 0.4 / 12,
      hra: emp.annualCTC * 0.2 / 12,
      taxSettings,
      fiscalYear, // Inferred from payroll period
    });

    const incomeTaxDeduction = Math.round(taxCalculation.monthlyTDS);

    const totalDeductions = pfDeduction + ptDeduction + incomeTaxDeduction + totalVarDeductions;
    const netPay = grossEarnings - totalDeductions;

    return {
      id: `slip-${emp.id}-${currentMonth}-${currentYear}`,
      payrollRunId: '',
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeCode,
      department: emp.department,
      month: currentMonth,
      year: currentYear,
      totalDays: 30,
      lwpDays: attendance.lwp,
      paidLeaveDays: attendance.paidLeave,
      workingDays: 30 - attendance.lwp,
      basicSalary,
      hra,
      otherAllowances,
      variableEarnings,
      grossEarnings,
      pfDeduction,
      ptDeduction,
      incomeTaxDeduction,
      variableDeductions,
      totalDeductions,
      netPay,
      createdAt: new Date().toISOString(),
    };
  };

  const handleFreeze = () => {
    const payslips = selectedEmployees.map(id => {
      const emp = employees.find(e => e.id === id)!;
      return calculatePayslip(emp);
    });

    const payrollRun: PayrollRun = {
      id: `run-${currentMonth}-${currentYear}`,
      month: currentMonth,
      year: currentYear,
      status: 'locked',
      processedAt: new Date().toISOString(),
      lockedAt: new Date().toISOString(),
      payslips,
    };

    const existingRuns = getPayrollRuns();
    setPayrollRuns([...existingRuns, payrollRun]);

    toast({
      title: 'Payroll Frozen Successfully',
      description: `Payroll for ${payslips.length} employees has been processed and locked for ${periodLabel}.`
    });
    setCurrentStep(0);
    setSelectedEmployees([]);
    setAttendanceData({});
    setVariablePayData({});
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const totalGross = selectedEmployees.reduce((sum, id) => {
    const emp = employees.find(e => e.id === id);
    return sum + (emp ? calculatePayslip(emp).grossEarnings : 0);
  }, 0);

  const totalNet = selectedEmployees.reduce((sum, id) => {
    const emp = employees.find(e => e.id === id);
    return sum + (emp ? calculatePayslip(emp).netPay : 0);
  }, 0);

  return (
    <PageContainer>
      <PageHeader
        title="Run Payroll"
        description={`Process monthly payroll for ${periodLabel}`}
        icon={<Receipt className="h-7 w-7 text-primary" />}
        badge={
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {selectedEmployees.length} Selected
          </Badge>
        }
      />

      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {/* Step Content */}
      <BentoCard>
        {currentStep === 0 && (
          <>
            <BentoCardHeader>
              <BentoCardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                Select Employees
              </BentoCardTitle>
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
              </Button>
            </BentoCardHeader>
            <BentoCardContent>
              {employees.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-10 w-10" />}
                  title="No active employees"
                  description="Add employees first before running payroll"
                />
              ) : (
                <Table className="premium-table">
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedEmployees.length === employees.length}
                          onCheckedChange={selectAll}
                        />
                      </TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Monthly CTC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map(emp => (
                      <TableRow key={emp.id} className="border-border/30">
                        <TableCell>
                          <Checkbox
                            checked={selectedEmployees.includes(emp.id)}
                            onCheckedChange={() => toggleEmployee(emp.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                              <p className="text-xs text-muted-foreground">{emp.employeeCode}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-muted/50">{emp.department}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(emp.annualCTC / 12)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </BentoCardContent>
          </>
        )}

        {currentStep === 1 && (
          <>
            <BentoCardHeader>
              <BentoCardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                  <Calendar className="h-4 w-4 text-amber-400" />
                </div>
                Leave & Attendance
              </BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent>
              <Table className="premium-table">
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Employee</TableHead>
                    <TableHead>LWP Days</TableHead>
                    <TableHead>Paid Leave</TableHead>
                    <TableHead>Working Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEmployees.map(id => {
                    const emp = employees.find(e => e.id === id)!;
                    const lwp = attendanceData[id]?.lwp || 0;
                    return (
                      <TableRow key={id} className="border-border/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <span className="font-medium">{emp.firstName} {emp.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-20 bg-muted/30 border-border/50"
                            value={attendanceData[id]?.lwp || 0}
                            onChange={e => setAttendanceData(prev => ({
                              ...prev,
                              [id]: { ...prev[id], lwp: Number(e.target.value), paidLeave: prev[id]?.paidLeave || 0 }
                            }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-20 bg-muted/30 border-border/50"
                            value={attendanceData[id]?.paidLeave || 0}
                            onChange={e => setAttendanceData(prev => ({
                              ...prev,
                              [id]: { ...prev[id], paidLeave: Number(e.target.value), lwp: prev[id]?.lwp || 0 }
                            }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="status-active">
                            {30 - lwp} days
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </BentoCardContent>
          </>
        )}

        {currentStep === 2 && (
          <>
            <BentoCardHeader className="flex flex-row items-center justify-between">
              <BentoCardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                  <IndianRupee className="h-4 w-4 text-emerald-400" />
                </div>
                Variable Pay
              </BentoCardTitle>
              <Button
                variant="outline"
                className="gap-2 border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
                onClick={() => {
                  const allAllocations = getIncentiveAllocations();
                  const allRules = getIncentiveRules();
                  const approved = allAllocations.filter(a =>
                    a.status === 'Approved' &&
                    a.payrollMonth === currentMonth &&
                    a.payrollYear === currentYear &&
                    selectedEmployees.includes(a.employeeId)
                  );

                  if (approved.length === 0) {
                    toast({
                      title: 'No Approved Incentives',
                      description: 'There are no pre-approved incentives for the selected employees in this payroll month.',
                      variant: 'destructive'
                    });
                    return;
                  }

                  const newVarPayData: Record<string, VariablePay[]> = { ...variablePayData };
                  approved.forEach(a => {
                    const rule = allRules.find(r => r.id === a.ruleId);
                    if (!newVarPayData[a.employeeId]) newVarPayData[a.employeeId] = [];
                    newVarPayData[a.employeeId].push({
                      id: a.id,
                      name: rule?.name || 'Approved Incentive',
                      type: a.isRecovery ? 'deduction' : 'earning',
                      amount: a.calculatedAmount,
                      pfApplicable: rule?.pfApplicable,
                      esiApplicable: rule?.esiApplicable,
                      isTaxable: rule?.taxTreatmentType !== 'Exempt'
                    });
                  });

                  setVariablePayData(newVarPayData);
                  toast({
                    title: 'Incentives Imported',
                    description: `Successfully synced ${approved.length} approved payouts into the payroll run.`
                  });
                }}
              >
                <Zap className="h-4 w-4" />
                Sync Approved Incentives
              </Button>
            </BentoCardHeader>
            <BentoCardContent>
              {selectedEmployees.length === 0 ? (
                <EmptyState
                  icon={<IndianRupee className="h-10 w-10" />}
                  title="No employees selected"
                  description="Go back to step 1 and select employees to add variable pay."
                />
              ) : (
                <Table className="premium-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead className="text-right">Total Variable</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEmployees.map(id => {
                      const emp = employees.find(e => e.id === id)!;
                      const items = variablePayData[id] || [];
                      const earnings = items.filter(i => i.type === 'earning').reduce((s, i) => s + i.amount, 0);
                      const deductions = items.filter(i => i.type === 'deduction').reduce((s, i) => s + i.amount, 0);
                      return (
                        <TableRow key={id}>
                          <TableCell>
                            <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                            <div className="text-xs text-muted-foreground">{emp.employeeCode}</div>
                          </TableCell>
                          <TableCell className="text-emerald-400 font-medium">+{formatCurrency(earnings)}</TableCell>
                          <TableCell className="text-rose-400 font-medium">-{formatCurrency(deductions)}</TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(earnings - deductions)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </BentoCardContent>
          </>
        )}

        {currentStep === 3 && (
          <>
            <BentoCardHeader>
              <BentoCardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20">
                  <Lock className="h-4 w-4 text-rose-400" />
                </div>
                Review & Freeze
              </BentoCardTitle>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Gross</p>
                  <p className="font-semibold">{formatCurrency(totalGross)}</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Net</p>
                  <p className="font-semibold text-emerald-400">{formatCurrency(totalNet)}</p>
                </div>
              </div>
            </BentoCardHeader>
            <BentoCardContent>
              <Table className="premium-table">
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">PF</TableHead>
                    <TableHead className="text-right">PT</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Net Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEmployees.map(id => {
                    const emp = employees.find(e => e.id === id)!;
                    const slip = calculatePayslip(emp);
                    return (
                      <TableRow key={id} className="border-border/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <span className="font-medium">{slip.employeeName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(slip.grossEarnings)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatCurrency(slip.pfDeduction)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatCurrency(slip.ptDeduction)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatCurrency(slip.incomeTaxDeduction)}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-emerald-400">{formatCurrency(slip.netPay)}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </BentoCardContent>
          </>
        )}
      </BentoCard>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(s => s - 1)}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        {currentStep < 3 ? (
          <Button
            onClick={() => setCurrentStep(s => s + 1)}
            disabled={currentStep === 0 && selectedEmployees.length === 0}
            className="gap-2 shadow-lg shadow-primary/20"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleFreeze}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
          >
            <Lock className="h-4 w-4" />
            Lock & Freeze Payroll
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
