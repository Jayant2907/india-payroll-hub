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
  LayoutDashboard,
  Sparkles
} from 'lucide-react';
import { 
  BentoCard, 
  BentoGrid, 
  BentoCardHeader, 
  BentoCardTitle, 
  BentoCardContent,
} from '@/components/ui/bento-card';
import { PageHeader, PageContainer, StatsCard } from '@/components/ui/page-header';
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
  Area,
  AreaChart,
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
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.name}. Here's your payroll command center.`}
        icon={<LayoutDashboard className="h-7 w-7 text-primary" />}
        badge={
          <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
            <Sparkles className="h-3 w-3" />
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </Badge>
        }
      />

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="premium-tabs">
          <TabsTrigger value="active" className="gap-2 rounded-lg">
            <Users className="h-4 w-4" />
            Active Payroll
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2 rounded-lg">
            <CalendarClock className="h-4 w-4" />
            Past Payrolls
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 rounded-lg">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Active Payroll Tab */}
        <TabsContent value="active" className="space-y-6">
          <BentoGrid cols={4} className="stagger-children">
            <StatsCard
              title="Workforce Strength"
              value={activeEmployees.length}
              subtitle={`+${inactiveEmployees.length} inactive`}
              icon={<Users className="h-6 w-6" />}
              iconColor="bg-primary/20 text-primary"
            />
            <StatsCard
              title="Monthly Payroll"
              value={formatLakhs(monthlyPayroll)}
              subtitle="Estimated for this month"
              icon={<IndianRupee className="h-6 w-6" />}
              iconColor="bg-emerald-500/20 text-emerald-400"
              trend="up"
              trendValue="5.2%"
            />
            <StatsCard
              title="Annual CTC"
              value={formatLakhs(totalAnnualCTC)}
              subtitle="Total company cost"
              icon={<TrendingUp className="h-6 w-6" />}
              iconColor="bg-amber-500/20 text-amber-400"
            />
            <StatsCard
              title="Organization"
              value={companyConfig.tradeName}
              subtitle={`${departmentData.length} departments`}
              icon={<Building2 className="h-6 w-6" />}
              iconColor="bg-rose-500/20 text-rose-400"
            />
          </BentoGrid>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Department Distribution Chart */}
            <BentoCard size="lg" className="lg:col-span-3">
              <BentoCardHeader>
                <BentoCardTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  Department Distribution
                </BentoCardTitle>
              </BentoCardHeader>
              <BentoCardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(262, 80%, 65%)" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(262, 80%, 45%)" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px -10px hsl(var(--glass-shadow))',
                      }}
                    />
                    <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </BentoCardContent>
            </BentoCard>

            {/* Compliance Calendar */}
            <BentoCard className="lg:col-span-2">
              <BentoCardHeader>
                <BentoCardTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                    <CalendarClock className="h-4 w-4 text-amber-400" />
                  </div>
                  Compliance Calendar
                </BentoCardTitle>
              </BentoCardHeader>
              <BentoCardContent>
                <div className="space-y-3">
                  {complianceDeadlines.map((deadline, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-4 transition-all hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          deadline.status === 'overdue' ? 'bg-destructive/20' :
                          deadline.status === 'due-today' ? 'bg-amber-500/20' : 'bg-emerald-500/20'
                        }`}>
                          {deadline.status === 'overdue' && (
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                          )}
                          {deadline.status === 'due-today' && (
                            <Clock className="h-5 w-5 text-amber-400" />
                          )}
                          {deadline.status === 'upcoming' && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{deadline.name}</p>
                          <p className="text-xs text-muted-foreground">{deadline.date}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          deadline.status === 'overdue'
                            ? 'status-inactive'
                            : deadline.status === 'due-today'
                            ? 'status-pending'
                            : 'status-active'
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
              <BentoCardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <CalendarClock className="h-4 w-4 text-primary" />
                </div>
                Historical Payroll Data
              </BentoCardTitle>
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
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
                    <CalendarClock className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <p className="text-lg font-medium text-foreground">No payrolls processed yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Process your first payroll to see historical data here.
                  </p>
                </div>
              ) : (
                <BentoGrid cols={4}>
                  <StatsCard
                    title="Gross Payroll"
                    value="₹0"
                    icon={<IndianRupee className="h-5 w-5" />}
                    iconColor="bg-primary/20 text-primary"
                  />
                  <StatsCard
                    title="Deductions"
                    value="₹0"
                    icon={<TrendingUp className="h-5 w-5" />}
                    iconColor="bg-rose-500/20 text-rose-400"
                  />
                  <StatsCard
                    title="Income Tax"
                    value="₹0"
                    icon={<Building2 className="h-5 w-5" />}
                    iconColor="bg-amber-500/20 text-amber-400"
                  />
                  <StatsCard
                    title="Net Payout"
                    value="₹0"
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    iconColor="bg-emerald-500/20 text-emerald-400"
                  />
                </BentoGrid>
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
                <BentoCardTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  Cost vs Headcount Trend
                </BentoCardTitle>
              </BentoCardHeader>
              <BentoCardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(262, 80%, 65%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(262, 80%, 65%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'cost' ? formatCurrency(value) : value,
                        name === 'cost' ? 'Monthly Cost' : 'Headcount'
                      ]}
                    />
                    <Legend />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="cost" 
                      stroke="hsl(262, 80%, 65%)" 
                      strokeWidth={3}
                      fill="url(#costGradient)"
                      name="cost"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="headcount" 
                      stroke="hsl(173, 80%, 50%)" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(173, 80%, 50%)', strokeWidth: 2, r: 5 }}
                      name="headcount"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </BentoCardContent>
            </BentoCard>

            {/* Department Pie Chart */}
            <BentoCard>
              <BentoCardHeader>
                <BentoCardTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                    <Users className="h-4 w-4 text-emerald-400" />
                  </div>
                  Headcount by Department
                </BentoCardTitle>
              </BentoCardHeader>
              <BentoCardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px' }}
                      formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </BentoCardContent>
            </BentoCard>
          </BentoGrid>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
