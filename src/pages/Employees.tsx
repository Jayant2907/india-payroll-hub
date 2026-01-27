import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Pencil, 
  Trash2,
  UserPlus,
  Users,
  Filter
} from 'lucide-react';
import { 
  BentoCard, 
  BentoCardHeader, 
  BentoCardTitle, 
  BentoCardContent 
} from '@/components/ui/bento-card';
import { PageHeader, PageContainer, EmptyState } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getEmployees, setEmployees, getSalaryStructures } from '@/lib/storage';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import type { Employee } from '@/types/payroll';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export default function Employees() {
  const [employees, setEmployeesState] = useState<Employee[]>(getEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const salaryStructures = useMemo(() => getSalaryStructures(), []);

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department));
    return Array.from(depts);
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employees, searchQuery, statusFilter, departmentFilter]);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDeleteEmployee = (id: string) => {
    const updatedEmployees = employees.filter(e => e.id !== id);
    setEmployeesState(updatedEmployees);
    setEmployees(updatedEmployees);
    toast({
      title: 'Employee Deleted',
      description: 'The employee has been removed from the system.',
    });
  };

  const handleSaveEmployee = (employee: Employee) => {
    let updatedEmployees: Employee[];
    
    if (editingEmployee) {
      updatedEmployees = employees.map(e => 
        e.id === employee.id ? employee : e
      );
      toast({
        title: 'Employee Updated',
        description: `${employee.firstName} ${employee.lastName}'s information has been updated.`,
      });
    } else {
      updatedEmployees = [...employees, employee];
      toast({
        title: 'Employee Added',
        description: `${employee.firstName} ${employee.lastName} has been added to the system.`,
      });
    }

    setEmployeesState(updatedEmployees);
    setEmployees(updatedEmployees);
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const handleExportExcel = () => {
    const exportData = employees.map(e => ({
      'Employee Code': e.employeeCode,
      'First Name': e.firstName,
      'Last Name': e.lastName,
      'Email': e.email,
      'Phone': e.phone,
      'Department': e.department,
      'Role': e.role,
      'Status': e.status,
      'Joining Date': e.joiningDate,
      'Annual CTC': e.annualCTC,
      'PAN': e.pan,
      'Aadhaar': e.aadhaar,
      'Tax Regime': e.taxRegime,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, 'employees.xlsx');
    
    toast({
      title: 'Export Successful',
      description: 'Employee data has been exported to Excel.',
    });
  };

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const importedEmployees: Employee[] = jsonData.map((row: any, index: number) => ({
          id: `emp-import-${Date.now()}-${index}`,
          firstName: row['First Name'] || '',
          lastName: row['Last Name'] || '',
          dateOfBirth: row['Date of Birth'] || '',
          gender: row['Gender']?.toLowerCase() || 'male',
          maritalStatus: row['Marital Status']?.toLowerCase() || 'single',
          email: row['Email'] || '',
          phone: row['Phone'] || '',
          address: row['Address'] || '',
          city: row['City'] || '',
          state: row['State'] || '',
          pincode: row['Pincode'] || '',
          employeeCode: row['Employee Code'] || `EMP${Date.now()}${index}`,
          role: row['Role'] || '',
          department: row['Department'] || '',
          status: row['Status']?.toLowerCase() || 'active',
          joiningDate: row['Joining Date'] || new Date().toISOString().split('T')[0],
          annualCTC: Number(row['Annual CTC']) || 0,
          pan: row['PAN'] || '',
          aadhaar: row['Aadhaar'] || '',
          uan: row['UAN'] || '',
          bankName: row['Bank Name'] || '',
          bankAccountNumber: row['Account Number'] || '',
          bankIfsc: row['IFSC'] || '',
          taxRegime: row['Tax Regime']?.toLowerCase() || 'new',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        const updatedEmployees = [...employees, ...importedEmployees];
        setEmployeesState(updatedEmployees);
        setEmployees(updatedEmployees);

        toast({
          title: 'Import Successful',
          description: `${importedEmployees.length} employees imported.`,
        });
      } catch (error) {
        toast({
          title: 'Import Failed',
          description: 'Failed to parse Excel file. Please check the format.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  const getStructureName = (structureId?: string) => {
    if (!structureId) return '-';
    const structure = salaryStructures.find(s => s.id === structureId);
    return structure?.name || '-';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const activeCount = employees.filter(e => e.status === 'active').length;

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Employees"
        description="Manage your workforce and employee information"
        icon={<Users className="h-7 w-7 text-primary" />}
        badge={
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            {activeCount} Active
          </Badge>
        }
        actions={
          <Button onClick={handleAddEmployee} className="gap-2 shadow-lg shadow-primary/20">
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
        }
      />

      {/* Filters */}
      <BentoCard>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 border-border/50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-muted/30 border-border/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="resigned">Resigned</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40 bg-muted/30 border-border/50">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleExportExcel} className="bg-muted/30">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export to Excel</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <label>
                  <Button variant="outline" size="icon" asChild className="bg-muted/30">
                    <span>
                      <Upload className="h-4 w-4" />
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleImportExcel}
                    className="hidden"
                  />
                </label>
              </TooltipTrigger>
              <TooltipContent>Import from Excel</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </BentoCard>

      {/* Employee Table */}
      <BentoCard>
        <div className="overflow-x-auto">
          {filteredEmployees.length === 0 ? (
            <EmptyState
              icon={<Users className="h-10 w-10" />}
              title="No employees found"
              description={searchQuery || statusFilter !== 'all' || departmentFilter !== 'all' 
                ? "Try adjusting your search or filters" 
                : "Get started by adding your first employee"}
              action={
                employees.length === 0 ? (
                  <Button onClick={handleAddEmployee} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add First Employee
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Table className="premium-table">
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CTC</TableHead>
                  <TableHead>Structure</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee, index) => (
                  <TableRow 
                    key={employee.id} 
                    className="border-border/30 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {employee.employeeCode}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{employee.role}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-muted/50">
                        {employee.department}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          employee.status === 'active'
                            ? 'status-active'
                            : employee.status === 'inactive'
                            ? 'status-inactive'
                            : 'status-pending'
                        }
                      >
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(employee.annualCTC)}</TableCell>
                    <TableCell className="text-muted-foreground">{getStructureName(employee.salaryStructureId)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditEmployee(employee)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </BentoCard>

      {/* Employee Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
          </DialogHeader>
          <EmployeeForm
            employee={editingEmployee}
            onSave={handleSaveEmployee}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
