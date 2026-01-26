import { useState, useMemo } from 'react';
import { FileText, Users } from 'lucide-react';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardContent } from '@/components/ui/bento-card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getEmployees, getSettlements } from '@/lib/storage';

export default function Settlements() {
  const employees = useMemo(() => getEmployees().filter(e => e.status !== 'active'), []);
  const settlements = useMemo(() => getSettlements(), []);

  const formatCurrency = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Full & Final Settlement</h1>
        <p className="text-muted-foreground">Process settlements for resigned or terminated employees</p>
      </div>

      <BentoCard>
        <BentoCardHeader>
          <BentoCardTitle>Pending Settlements</BentoCardTitle>
        </BentoCardHeader>
        <BentoCardContent>
          {employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No inactive employees pending settlement.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableRow key={emp.id}>
                      <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.exitDate || '-'}</TableCell>
                      <TableCell><Badge variant="outline" className="status-inactive">{emp.status}</Badge></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={settlement?.status === 'finalized' ? 'status-active' : 'status-pending'}>
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
    </div>
  );
}
