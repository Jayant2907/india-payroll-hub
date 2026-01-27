import { useMemo } from 'react';
import { User, Briefcase, IndianRupee, Download, Calendar, Mail, Phone, Building2, CreditCard } from 'lucide-react';
import { BentoCard, BentoGrid, BentoCardHeader, BentoCardTitle, BentoCardContent } from '@/components/ui/bento-card';
import { PageHeader, PageContainer, StatsCard, EmptyState } from '@/components/ui/page-header';
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
      <PageContainer>
        <EmptyState
          icon={<User className="h-10 w-10" />}
          title="Profile not found"
          description="Your employee profile could not be loaded. Please contact your administrator."
        />
      </PageContainer>
    );
  }

  const myPayslips = payrollRuns.flatMap(r => r.payslips).filter(s => s.employeeId === employee.id);
  const formatCurrency = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  return (
    <PageContainer>
      <PageHeader
        title="My Profile"
        description="View your personal and employment details"
        icon={<User className="h-7 w-7 text-primary" />}
        badge={
          <Badge className={employee.status === 'active' ? 'status-active' : 'status-inactive'}>
            {employee.status}
          </Badge>
        }
      />

      <BentoGrid cols={3} className="stagger-children">
        <StatsCard
          title="Employee"
          value={`${employee.firstName} ${employee.lastName}`}
          subtitle={employee.employeeCode}
          icon={<User className="h-6 w-6" />}
          iconColor="bg-primary/20 text-primary"
        />
        <StatsCard
          title="Role"
          value={employee.role}
          subtitle={employee.department}
          icon={<Briefcase className="h-6 w-6" />}
          iconColor="bg-emerald-500/20 text-emerald-400"
        />
        <StatsCard
          title="Annual CTC"
          value={formatCurrency(employee.annualCTC)}
          subtitle={`${formatCurrency(employee.annualCTC / 12)}/month`}
          icon={<IndianRupee className="h-6 w-6" />}
          iconColor="bg-amber-500/20 text-amber-400"
        />
      </BentoGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <BentoCard>
          <BentoCardHeader>
            <BentoCardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                <User className="h-4 w-4 text-primary" />
              </div>
              Personal Information
            </BentoCardTitle>
          </BentoCardHeader>
          <BentoCardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Phone className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{employee.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <Calendar className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Joining Date</p>
                  <p className="font-medium">{employee.joiningDate}</p>
                </div>
              </div>
            </div>
          </BentoCardContent>
        </BentoCard>

        {/* Statutory & Bank Details */}
        <BentoCard>
          <BentoCardHeader>
            <BentoCardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                <CreditCard className="h-4 w-4 text-emerald-400" />
              </div>
              Statutory & Bank Details
            </BentoCardTitle>
          </BentoCardHeader>
          <BentoCardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
                  <Building2 className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">PAN</p>
                  <p className="font-medium font-mono">{employee.pan || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <IndianRupee className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tax Regime</p>
                  <p className="font-medium">{employee.taxRegime === 'new' ? 'New Regime' : 'Old Regime'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bank</p>
                  <p className="font-medium">{employee.bankName || '-'}</p>
                </div>
              </div>
            </div>
          </BentoCardContent>
        </BentoCard>
      </div>

      {/* Payslips */}
      <BentoCard>
        <BentoCardHeader>
          <BentoCardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
              <IndianRupee className="h-4 w-4 text-amber-400" />
            </div>
            Payslips
          </BentoCardTitle>
        </BentoCardHeader>
        <BentoCardContent>
          {myPayslips.length === 0 ? (
            <EmptyState
              icon={<IndianRupee className="h-10 w-10" />}
              title="No payslips available"
              description="Your payslips will appear here once payroll is processed"
            />
          ) : (
            <div className="space-y-3">
              {myPayslips.map(slip => (
                <div 
                  key={slip.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 transition-all hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {new Date(slip.year, slip.month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-muted-foreground">
                          Gross: {formatCurrency(slip.grossEarnings)}
                        </span>
                        <span className="text-sm font-medium text-emerald-400">
                          Net: {formatCurrency(slip.netPay)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </BentoCardContent>
      </BentoCard>
    </PageContainer>
  );
}
