import { useMemo } from 'react';
import { FileText, Users, DollarSign } from 'lucide-react';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardContent } from '@/components/ui/bento-card';
import { PageHeader, PageContainer, EmptyState } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getEmployees, getSettlements } from '@/lib/storage';

export default function Settlements() {
  const employees = useMemo(() => getEmployees().filter(e => e.status !== 'active'), []);
  const settlements = useMemo(() => getSettlements(), []);

  const formatCurrency = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const pendingCount = employees.filter(e => !settlements.find(s => s.employeeId === e.id && s.status === 'finalized')).length;

  return (
    <PageContainer>
      <PageHeader
        title="Full & Final Settlement"
        description="Process settlements for resigned or terminated employees"
        icon={<FileText className="h-7 w-7 text-primary" />}
        badge={
          pendingCount > 0 ? (
            <Badge className="status-pending">
              {pendingCount} Pending
            </Badge>
          ) : undefined
        }
      />

      <BentoCard>
        <BentoCardHeader>
          <BentoCardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
              <Users className="h-4 w-4 text-amber-400" />
            </div>
            Pending Settlements
          </BentoCardTitle>
        </BentoCardHeader>
        <BentoCardContent>
          {employees.length === 0 ? (
            <EmptyState
              icon={<DollarSign className="h-10 w-10" />}
              title="No inactive employees"
              description="There are no resigned or terminated employees pending settlement"
            />
          ) : (
            <Table className="premium-table">
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Exit Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Settlement Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map(emp => {
                  const settlement = settlements.find(s => s.employeeId === emp.id);
                  return (
                    <TableRow key={emp.id} className="border-border/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 font-semibold text-sm">
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
                      <TableCell className="text-muted-foreground">{emp.exitDate || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="status-inactive">{emp.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={settlement?.status === 'finalized' ? 'status-active' : 'status-pending'}
                        >
                          {settlement?.status === 'finalized' ? 'Completed' : 'Pending'}
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
    </PageContainer>
  );
}
