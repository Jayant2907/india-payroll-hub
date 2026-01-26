import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Pencil, 
  Trash2, 
  Filter,
  UserPlus,
  Users
} from 'lucide-react';
import { 
  BentoCard, 
  BentoCardHeader, 
  BentoCardTitle, 
  BentoCardContent 
} from '@/components/ui/bento-card';
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

        // Transform and validate imported data
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground">
            Manage your workforce and employee information
          </p>
        </div>
        <Button onClick={handleAddEmployee} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <BentoCard>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleExportExcel}>
              <Download className="h-4 w-4" />
            </Button>
            <label>
              <Button variant="outline" size="icon" asChild>
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
          </div>
        </div>
      </BentoCard>

      {/* Employee Table */}
      <BentoCard>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
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
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No employees found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {employee.employeeCode}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>{employee.department}</TableCell>
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
                    <TableCell>{formatCurrency(employee.annualCTC)}</TableCell>
                    <TableCell>{getStructureName(employee.salaryStructureId)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </BentoCard>

      {/* Employee Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
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
    </div>
  );
}
