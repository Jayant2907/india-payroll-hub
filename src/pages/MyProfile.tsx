import { useMemo } from 'react';
import { User, Briefcase, IndianRupee, Download } from 'lucide-react';
import { BentoCard, BentoGrid, BentoCardHeader, BentoCardTitle, BentoCardContent, BentoCardValue } from '@/components/ui/bento-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getEmployees, getPayrollRuns } from '@/lib/storage';

export default function MyProfile() {
  const { user } = useAuth();
  const employees = useMemo(() => getEmployees(), []);
  const payrollRuns = useMemo(() => getPayrollRuns(), []);

  const employee = employees.find(e => e.id === user?.employeeId);
  
  if (!employee) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Employee profile not found.</p>
      </div>
    );
  }

  const myPayslips = payrollRuns.flatMap(r => r.payslips).filter(s => s.employeeId === employee.id);
  const formatCurrency = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">View your personal and employment details</p>
      </div>

      <BentoGrid cols={3}>
        <BentoCard hover>
          <BentoCardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <User className="h-5 w-5 text-primary" />
            </div>
          </BentoCardHeader>
          <BentoCardContent>
            <p className="text-sm text-muted-foreground">Employee</p>
            <BentoCardValue className="text-xl">{employee.firstName} {employee.lastName}</BentoCardValue>
            <p className="text-xs text-muted-foreground mt-1">{employee.employeeCode}</p>
          </BentoCardContent>
        </BentoCard>

        <BentoCard hover>
          <BentoCardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
              <Briefcase className="h-5 w-5 text-emerald-400" />
            </div>
          </BentoCardHeader>
          <BentoCardContent>
            <p className="text-sm text-muted-foreground">Role</p>
            <BentoCardValue className="text-xl">{employee.role}</BentoCardValue>
            <p className="text-xs text-muted-foreground mt-1">{employee.department}</p>
          </BentoCardContent>
        </BentoCard>

        <BentoCard hover>
          <BentoCardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
              <IndianRupee className="h-5 w-5 text-amber-400" />
            </div>
          </BentoCardHeader>
          <BentoCardContent>
            <p className="text-sm text-muted-foreground">Annual CTC</p>
            <BentoCardValue className="text-xl">{formatCurrency(employee.annualCTC)}</BentoCardValue>
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(employee.annualCTC / 12)}/month</p>
          </BentoCardContent>
        </BentoCard>
      </BentoGrid>

      <BentoCard>
        <BentoCardHeader>
          <BentoCardTitle>Personal Information</BentoCardTitle>
          <Badge variant="outline" className="status-active">{employee.status}</Badge>
        </BentoCardHeader>
        <BentoCardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-muted-foreground">Email:</span> {employee.email}</div>
            <div><span className="text-muted-foreground">Phone:</span> {employee.phone}</div>
            <div><span className="text-muted-foreground">Joining Date:</span> {employee.joiningDate}</div>
            <div><span className="text-muted-foreground">PAN:</span> {employee.pan}</div>
            <div><span className="text-muted-foreground">Tax Regime:</span> {employee.taxRegime === 'new' ? 'New Regime' : 'Old Regime'}</div>
            <div><span className="text-muted-foreground">Bank:</span> {employee.bankName}</div>
          </div>
        </BentoCardContent>
      </BentoCard>

      <BentoCard>
        <BentoCardHeader>
          <BentoCardTitle>Payslips</BentoCardTitle>
        </BentoCardHeader>
        <BentoCardContent>
          {myPayslips.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payslips available yet.</p>
          ) : (
            <div className="space-y-2">
              {myPayslips.map(slip => (
                <div key={slip.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{new Date(slip.year, slip.month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                    <p className="text-sm text-muted-foreground">Net Pay: {formatCurrency(slip.netPay)}</p>
                  </div>
                  <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Download</Button>
                </div>
              ))}
            </div>
          )}
        </BentoCardContent>
      </BentoCard>
    </div>
  );
}
