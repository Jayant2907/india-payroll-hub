import { useState, useMemo } from 'react';
import { Users, Calendar, DollarSign, Lock, CheckCircle2 } from 'lucide-react';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardContent } from '@/components/ui/bento-card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getEmployees, getSalaryStructures, getPFSettings, getPTSlabs, getPayrollRuns, setPayrollRuns } from '@/lib/storage';
import type { Employee, PayrollRun, Payslip, VariablePay } from '@/types/payroll';
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

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

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
    
    const pfDeduction = pfSettings.enabled ? Math.min(basicSalary, pfSettings.wageCeiling) * (pfSettings.employeeContribution / 100) : 0;
    const ptSlab = ptSlabs.find(s => s.state === 'Karnataka' && grossEarnings >= s.minSalary && grossEarnings <= s.maxSalary);
    const ptDeduction = ptSlab?.taxAmount || 0;
    const incomeTaxDeduction = grossEarnings > 25000 ? grossEarnings * 0.1 : 0;
    
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
    
    toast({ title: 'Payroll Frozen', description: `Payroll for ${payslips.length} employees has been processed and locked.` });
    setCurrentStep(0);
    setSelectedEmployees([]);
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Run Payroll</h1>
        <p className="text-muted-foreground">Process monthly payroll for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Steps */}
      <div className="flex gap-2">
        {STEPS.map((step, i) => (
          <div key={step} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${i === currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm bg-background/20">{i + 1}</span>
            <span className="text-sm font-medium">{step}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <BentoCard>
        {currentStep === 0 && (
          <BentoCardContent>
            <div className="flex justify-between mb-4">
              <BentoCardTitle>Select Employees</BentoCardTitle>
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox checked={selectedEmployees.length === employees.length} onCheckedChange={selectAll} /></TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Monthly CTC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell><Checkbox checked={selectedEmployees.includes(emp.id)} onCheckedChange={() => toggleEmployee(emp.id)} /></TableCell>
                    <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{formatCurrency(emp.annualCTC / 12)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </BentoCardContent>
        )}

        {currentStep === 1 && (
          <BentoCardContent>
            <BentoCardTitle className="mb-4">Leave & Attendance</BentoCardTitle>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>LWP Days</TableHead>
                  <TableHead>Paid Leave</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedEmployees.map(id => {
                  const emp = employees.find(e => e.id === id)!;
                  return (
                    <TableRow key={id}>
                      <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                      <TableCell><Input type="number" className="w-20" value={attendanceData[id]?.lwp || 0} onChange={e => setAttendanceData(prev => ({ ...prev, [id]: { ...prev[id], lwp: Number(e.target.value), paidLeave: prev[id]?.paidLeave || 0 } }))} /></TableCell>
                      <TableCell><Input type="number" className="w-20" value={attendanceData[id]?.paidLeave || 0} onChange={e => setAttendanceData(prev => ({ ...prev, [id]: { ...prev[id], paidLeave: Number(e.target.value), lwp: prev[id]?.lwp || 0 } }))} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </BentoCardContent>
        )}

        {currentStep === 2 && (
          <BentoCardContent>
            <BentoCardTitle className="mb-4">Variable Pay</BentoCardTitle>
            <p className="text-muted-foreground mb-4">Add bonuses, arrears, or deductions for selected employees.</p>
            <div className="text-center py-8 text-muted-foreground">Variable pay can be added here. Click Next to proceed with standard calculations.</div>
          </BentoCardContent>
        )}

        {currentStep === 3 && (
          <BentoCardContent>
            <BentoCardTitle className="mb-4">Review & Freeze</BentoCardTitle>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>PF</TableHead>
                  <TableHead>PT</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Net Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedEmployees.map(id => {
                  const emp = employees.find(e => e.id === id)!;
                  const slip = calculatePayslip(emp);
                  return (
                    <TableRow key={id}>
                      <TableCell>{slip.employeeName}</TableCell>
                      <TableCell>{formatCurrency(slip.grossEarnings)}</TableCell>
                      <TableCell>{formatCurrency(slip.pfDeduction)}</TableCell>
                      <TableCell>{formatCurrency(slip.ptDeduction)}</TableCell>
                      <TableCell>{formatCurrency(slip.incomeTaxDeduction)}</TableCell>
                      <TableCell className="font-bold text-emerald-400">{formatCurrency(slip.netPay)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </BentoCardContent>
        )}
      </BentoCard>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 0}>Previous</Button>
        {currentStep < 3 ? (
          <Button onClick={() => setCurrentStep(s => s + 1)} disabled={currentStep === 0 && selectedEmployees.length === 0}>Next</Button>
        ) : (
          <Button onClick={handleFreeze} className="gap-2"><Lock className="h-4 w-4" />Lock & Freeze Payroll</Button>
        )}
      </div>
    </div>
  );
}
