import { useState, useMemo } from 'react';
import { 
  Users, 
  IndianRupee, 
  TrendingUp, 
  Building2, 
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  BentoCard, 
  BentoGrid, 
  BentoCardHeader, 
  BentoCardTitle, 
  BentoCardContent,
  BentoCardValue 
} from '@/components/ui/bento-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getEmployees, getPayrollRuns, getCompanyConfig } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const CHART_COLORS = [
  'hsl(262, 80%, 65%)',
  'hsl(173, 80%, 50%)',
  'hsl(47, 96%, 58%)',
  'hsl(340, 75%, 60%)',
  'hsl(24, 95%, 58%)',
];

// Compliance calendar deadlines
const getComplianceDeadlines = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();

  const deadlines = [
    { 
      name: 'TDS Payment', 
      day: 7, 
      description: 'Monthly TDS deposit for salaries',
      type: 'tax'
    },
    { 
      name: 'PF Payment', 
      day: 15, 
      description: 'Monthly PF contribution',
      type: 'pf'
    },
    { 
      name: 'ESI Payment', 
      day: 15, 
      description: 'Monthly ESI contribution',
      type: 'esi'
    },
    { 
      name: 'PT Payment', 
      day: 20, 
      description: 'Professional Tax deposit',
      type: 'pt'
    },
  ];

  return deadlines.map(d => {
    const deadlineDate = new Date(currentYear, currentMonth, d.day);
    let status: 'overdue' | 'due-today' | 'upcoming';
    
    if (currentDay > d.day) {
      status = 'overdue';
    } else if (currentDay === d.day) {
      status = 'due-today';
    } else {
      status = 'upcoming';
    }

    return {
      ...d,
      date: deadlineDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      status,
    };
  });
};

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedPayrollPeriod, setSelectedPayrollPeriod] = useState<string>('');
  
  const employees = useMemo(() => getEmployees(), []);
  const payrollRuns = useMemo(() => getPayrollRuns(), []);
  const companyConfig = useMemo(() => getCompanyConfig(), []);
  const complianceDeadlines = useMemo(() => getComplianceDeadlines(), []);

  const activeEmployees = employees.filter(e => e.status === 'active');
  const inactiveEmployees = employees.filter(e => e.status !== 'active');

  // Calculate totals
  const totalAnnualCTC = activeEmployees.reduce((sum, e) => sum + e.annualCTC, 0);
  const monthlyPayroll = totalAnnualCTC / 12;

  // Department distribution data
  const departmentData = useMemo(() => {
    const deptCounts: Record<string, number> = {};
    activeEmployees.forEach(e => {
      deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
    });
    return Object.entries(deptCounts).map(([name, value]) => ({ name, value }));
  }, [activeEmployees]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatLakhs = (value: number) => {
    const lakhs = value / 100000;
    return `₹${lakhs.toFixed(1)}L`;
  };

  // Mock trend data for analytics
  const trendData = [
    { month: 'Sep', cost: 850000, headcount: 4 },
    { month: 'Oct', cost: 920000, headcount: 4 },
    { month: 'Nov', cost: 980000, headcount: 5 },
    { month: 'Dec', cost: 1020000, headcount: 5 },
    { month: 'Jan', cost: monthlyPayroll, headcount: activeEmployees.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here's your payroll overview.
        </p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="glass-card">
          <TabsTrigger value="active">Active Payroll</TabsTrigger>
          <TabsTrigger value="past">Past Payrolls</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Active Payroll Tab */}
        <TabsContent value="active" className="space-y-6">
          <BentoGrid cols={4}>
            {/* Workforce Strength */}
            <BentoCard hover>
              <BentoCardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </BentoCardHeader>
              <BentoCardContent>
                <p className="text-sm text-muted-foreground">Workforce Strength</p>
                <BentoCardValue>{activeEmployees.length}</BentoCardValue>
                <p className="mt-1 text-xs text-muted-foreground">
                  +{inactiveEmployees.length} inactive
                </p>
              </BentoCardContent>
            </BentoCard>

            {/* Monthly Payroll */}
            <BentoCard hover>
              <BentoCardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                  <IndianRupee className="h-5 w-5 text-emerald-400" />
                </div>
              </BentoCardHeader>
              <BentoCardContent>
                <p className="text-sm text-muted-foreground">Monthly Payroll</p>
                <BentoCardValue trend="up">{formatLakhs(monthlyPayroll)}</BentoCardValue>
                <p className="mt-1 text-xs text-muted-foreground">
                  Estimated for this month
                </p>
              </BentoCardContent>
            </BentoCard>

            {/* Annual CTC */}
            <BentoCard hover>
              <BentoCardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                  <TrendingUp className="h-5 w-5 text-amber-400" />
                </div>
              </BentoCardHeader>
              <BentoCardContent>
                <p className="text-sm text-muted-foreground">Annual CTC</p>
                <BentoCardValue>{formatLakhs(totalAnnualCTC)}</BentoCardValue>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total company cost
                </p>
              </BentoCardContent>
            </BentoCard>

            {/* Organization */}
            <BentoCard hover>
              <BentoCardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20">
                  <Building2 className="h-5 w-5 text-rose-400" />
                </div>
              </BentoCardHeader>
              <BentoCardContent>
                <p className="text-sm text-muted-foreground">Organization</p>
                <BentoCardValue className="text-xl">{companyConfig.tradeName}</BentoCardValue>
                <p className="mt-1 text-xs text-muted-foreground">
                  {departmentData.length} departments
                </p>
              </BentoCardContent>
            </BentoCard>
          </BentoGrid>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Department Distribution Chart */}
            <BentoCard size="lg">
              <BentoCardHeader>
                <BentoCardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Department Distribution
                </BentoCardTitle>
              </BentoCardHeader>
              <BentoCardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      fontSize={12}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </BentoCardContent>
            </BentoCard>

            {/* Compliance Calendar */}
            <BentoCard>
              <BentoCardHeader>
                <BentoCardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  Compliance Calendar
                </BentoCardTitle>
              </BentoCardHeader>
              <BentoCardContent>
                <div className="space-y-3">
                  {complianceDeadlines.map((deadline, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        {deadline.status === 'overdue' && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                        {deadline.status === 'due-today' && (
                          <Clock className="h-4 w-4 text-amber-400" />
                        )}
                        {deadline.status === 'upcoming' && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{deadline.name}</p>
                          <p className="text-xs text-muted-foreground">{deadline.date}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          deadline.status === 'overdue'
                            ? 'destructive'
                            : deadline.status === 'due-today'
                            ? 'secondary'
                            : 'outline'
                        }
                        className={
                          deadline.status === 'due-today'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : deadline.status === 'upcoming'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : ''
                        }
                      >
                        {deadline.status === 'overdue' && 'Overdue'}
                        {deadline.status === 'due-today' && 'Due Today'}
                        {deadline.status === 'upcoming' && 'Upcoming'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </BentoCardContent>
            </BentoCard>
          </div>
        </TabsContent>

        {/* Past Payrolls Tab */}
        <TabsContent value="past" className="space-y-6">
          <BentoCard>
            <BentoCardHeader>
              <BentoCardTitle>Historical Payroll Data</BentoCardTitle>
              <Select value={selectedPayrollPeriod} onValueChange={setSelectedPayrollPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {payrollRuns.length === 0 ? (
                    <SelectItem value="none" disabled>No payrolls processed</SelectItem>
                  ) : (
                    payrollRuns.map(run => (
                      <SelectItem key={run.id} value={run.id}>
                        {new Date(run.year, run.month - 1).toLocaleDateString('en-IN', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </BentoCardHeader>
            <BentoCardContent>
              {payrollRuns.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <PieChart className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No payrolls have been processed yet.</p>
                  <p className="text-sm text-muted-foreground/70">
                    Process your first payroll to see historical data here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-4">
                  <BentoCard className="bg-muted/30">
                    <p className="text-sm text-muted-foreground">Gross Payroll</p>
                    <BentoCardValue className="text-xl">₹0</BentoCardValue>
                  </BentoCard>
                  <BentoCard className="bg-muted/30">
                    <p className="text-sm text-muted-foreground">Deductions</p>
                    <BentoCardValue className="text-xl">₹0</BentoCardValue>
                  </BentoCard>
                  <BentoCard className="bg-muted/30">
                    <p className="text-sm text-muted-foreground">Income Tax</p>
                    <BentoCardValue className="text-xl">₹0</BentoCardValue>
                  </BentoCard>
                  <BentoCard className="bg-muted/30">
                    <p className="text-sm text-muted-foreground">Net Payout</p>
                    <BentoCardValue className="text-xl text-emerald-400">₹0</BentoCardValue>
                  </BentoCard>
                </div>
              )}
            </BentoCardContent>
          </BentoCard>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <BentoGrid cols={2}>
            {/* Cost vs Headcount Trend */}
            <BentoCard size="lg">
              <BentoCardHeader>
                <BentoCardTitle>Cost vs Headcount Trend</BentoCardTitle>
              </BentoCardHeader>
              <BentoCardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      fontSize={12}
                      tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'cost' ? formatCurrency(value) : value,
                        name === 'cost' ? 'Monthly Cost' : 'Headcount'
                      ]}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="cost" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                      name="cost"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="headcount" 
                      stroke="hsl(173, 80%, 50%)" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(173, 80%, 50%)' }}
                      name="headcount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </BentoCardContent>
            </BentoCard>

            {/* Department Pie Chart */}
            <BentoCard>
              <BentoCardHeader>
                <BentoCardTitle>Headcount by Department</BentoCardTitle>
              </BentoCardHeader>
              <BentoCardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </BentoCardContent>
            </BentoCard>
          </BentoGrid>
        </TabsContent>
      </Tabs>
    </div>
  );
}
