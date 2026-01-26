import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getSalaryStructures } from '@/lib/storage';
import type { Employee, Gender, MaritalStatus, TaxRegime, EmployeeStatus, SalaryStructure } from '@/types/payroll';

interface EmployeeFormProps {
  employee: Employee | null;
  onSave: (employee: Employee) => void;
  onCancel: () => void;
}

const initialEmployee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'male',
  maritalStatus: 'single',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  employeeCode: '',
  role: '',
  department: '',
  status: 'active',
  joiningDate: '',
  annualCTC: 0,
  salaryStructureId: undefined,
  pan: '',
  aadhaar: '',
  uan: '',
  bankName: '',
  bankAccountNumber: '',
  bankIfsc: '',
  taxRegime: 'new',
};

export function EmployeeForm({ employee, onSave, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>>(
    employee
      ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          dateOfBirth: employee.dateOfBirth,
          gender: employee.gender,
          maritalStatus: employee.maritalStatus,
          email: employee.email,
          phone: employee.phone,
          address: employee.address,
          city: employee.city,
          state: employee.state,
          pincode: employee.pincode,
          employeeCode: employee.employeeCode,
          role: employee.role,
          department: employee.department,
          status: employee.status,
          joiningDate: employee.joiningDate,
          exitDate: employee.exitDate,
          annualCTC: employee.annualCTC,
          salaryStructureId: employee.salaryStructureId,
          pan: employee.pan,
          aadhaar: employee.aadhaar,
          uan: employee.uan,
          bankName: employee.bankName,
          bankAccountNumber: employee.bankAccountNumber,
          bankIfsc: employee.bankIfsc,
          taxRegime: employee.taxRegime,
        }
      : initialEmployee
  );

  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([]);

  useEffect(() => {
    setSalaryStructures(getSalaryStructures());
  }, []);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const savedEmployee: Employee = {
      ...formData,
      id: employee?.id || `emp-${Date.now()}`,
      createdAt: employee?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(savedEmployee);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="official">Official</TabsTrigger>
          <TabsTrigger value="statutory">Statutory & Bank</TabsTrigger>
        </TabsList>

        {/* Personal Tab */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleChange('gender', value as Gender)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select
              value={formData.maritalStatus}
              onValueChange={(value) => handleChange('maritalStatus', value as MaritalStatus)}
            >
              <SelectTrigger className="w-1/2">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Official Tab */}
        <TabsContent value="official" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeCode">Employee Code *</Label>
              <Input
                id="employeeCode"
                value={formData.employeeCode}
                onChange={(e) => handleChange('employeeCode', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role/Designation *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value as EmployeeStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="resigned">Resigned</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="joiningDate">Joining Date *</Label>
              <Input
                id="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={(e) => handleChange('joiningDate', e.target.value)}
                required
              />
            </div>
            {(formData.status === 'inactive' || formData.status === 'resigned' || formData.status === 'terminated') && (
              <div className="space-y-2">
                <Label htmlFor="exitDate">Exit Date</Label>
                <Input
                  id="exitDate"
                  type="date"
                  value={formData.exitDate || ''}
                  onChange={(e) => handleChange('exitDate', e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annualCTC">Annual CTC (₹) *</Label>
              <Input
                id="annualCTC"
                type="number"
                value={formData.annualCTC}
                onChange={(e) => handleChange('annualCTC', Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryStructure">Salary Structure</Label>
              <Select
                value={formData.salaryStructureId || ''}
                onValueChange={(value) => handleChange('salaryStructureId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select structure" />
                </SelectTrigger>
                <SelectContent>
                  {salaryStructures.map((structure) => (
                    <SelectItem key={structure.id} value={structure.id}>
                      {structure.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Statutory & Bank Tab */}
        <TabsContent value="statutory" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pan">PAN</Label>
              <Input
                id="pan"
                value={formData.pan}
                onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aadhaar">Aadhaar</Label>
              <Input
                id="aadhaar"
                value={formData.aadhaar}
                onChange={(e) => handleChange('aadhaar', e.target.value)}
                maxLength={12}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="uan">UAN (PF)</Label>
              <Input
                id="uan"
                value={formData.uan}
                onChange={(e) => handleChange('uan', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRegime">Tax Regime</Label>
              <Select
                value={formData.taxRegime}
                onValueChange={(value) => handleChange('taxRegime', value as TaxRegime)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select regime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Regime</SelectItem>
                  <SelectItem value="old">Old Regime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-4">Bank Details</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankIfsc">IFSC Code</Label>
                <Input
                  id="bankIfsc"
                  value={formData.bankIfsc}
                  onChange={(e) => handleChange('bankIfsc', e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {employee ? 'Update Employee' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
}
