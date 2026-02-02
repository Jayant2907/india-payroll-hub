// User roles
export type UserRole = 'admin' | 'accountant' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  employeeId?: string;
}

// Employee types
export type EmployeeStatus = 'active' | 'inactive' | 'resigned' | 'terminated';
export type Gender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type TaxRegime = 'new' | 'old';

export interface Employee {
  id: string;
  // Personal
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  // Contact
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  // Official
  employeeCode: string;
  role: string;
  department: string;
  status: EmployeeStatus;
  joiningDate: string;
  exitDate?: string;
  annualCTC: number;
  salaryStructureId?: string;
  // Statutory & Bank
  pan: string;
  aadhaar: string;
  uan: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  taxRegime: TaxRegime;
  // Meta
  createdAt: string;
  updatedAt: string;
}

// Salary Components
export type ComponentType = 'earning' | 'deduction';
export type CalculationType = 'fixed' | 'percentage_of_basic' | 'percentage_of_ctc';

export interface SalaryComponent {
  id: string;
  name: string;
  code: string;
  type: ComponentType;
  calculationType: CalculationType;
  value: number;
  isTaxable: boolean;
  includeInGross: boolean;
  includeInPF: boolean;
  includeInESI: boolean;
  includeInPT: boolean;
  includeInLWF: boolean;
  isActive: boolean;
}

export interface SalaryStructure {
  id: string;
  name: string;
  description: string;
  components: SalaryStructureComponent[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryStructureComponent {
  componentId: string;
  componentName: string;
  componentCode: string;
  type: ComponentType;
  calculationType: CalculationType;
  value: number;
  isTaxable: boolean;
}

// Company Configuration
export interface CompanyConfig {
  legalName: string;
  tradeName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  cin: string;
  pan: string;
  tan: string;
  epfCode: string;
  esiNumber: string;
  ptState: string;
  lwfState: string;
  payCycle: 'monthly';
  payDay: number;
}

// Statutory Settings
export interface PFSettings {
  enabled: boolean;
  employeeContribution: number;
  employerContribution: number;
  wageCeiling: number;
}

export interface PTSlab {
  id: string;
  state: string;
  minSalary: number;
  maxSalary: number;
  taxAmount: number;
}

export interface TaxSlab {
  id: string;
  regime: TaxRegime;
  fiscalYear: string;
  minIncome: number;
  maxIncome: number;
  taxRate: number;
}


export interface YearlyTaxConfig {
  fiscalYear: string;
  standardDeduction: number;
  section80CLimit: number;
  hraExemptionLimit: number;
  section87ARebateLimit: number; // Added for scalability (7L vs 12L)
  cessRate: number; // Added for scalability (currently 4%)
  slabs: TaxSlab[];
}

export interface TaxSettings {
  activeFiscalYear: string;
  yearlyConfigs: YearlyTaxConfig[];
}

// Payroll Processing
export interface PayrollRun {
  id: string;
  month: number;
  year: number;
  status: 'draft' | 'processing' | 'locked';
  processedAt?: string;
  lockedAt?: string;
  payslips: Payslip[];
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  month: number;
  year: number;
  // Attendance
  totalDays: number;
  lwpDays: number;
  paidLeaveDays: number;
  workingDays: number;
  // Earnings
  basicSalary: number;
  hra: number;
  otherAllowances: number;
  variableEarnings: VariablePay[];
  grossEarnings: number;
  // Deductions
  pfDeduction: number;
  ptDeduction: number;
  incomeTaxDeduction: number;
  variableDeductions: VariablePay[];
  totalDeductions: number;
  // Net
  netPay: number;
  // Meta
  createdAt: string;
}

export interface VariablePay {
  id: string;
  name: string;
  type: 'earning' | 'deduction';
  amount: number;
  pfApplicable?: boolean;
  esiApplicable?: boolean;
  isTaxable?: boolean;
}

// FnF Settlement
export interface Settlement {
  id: string;
  employeeId: string;
  employeeName: string;
  settlementDate: string;
  status: 'draft' | 'finalized';
  // Components
  salaryProRata: number;
  leaveEncashment: number;
  noticePeriodRecovery: number;
  gratuity: number;
  otherEarnings: number;
  otherDeductions: number;
  // Net
  netPayable: number;
  // Meta
  createdAt: string;
  finalizedAt?: string;
}

// Theme
export interface ThemeConfig {
  mode: 'dark' | 'light';
  primaryColor: string;
  sidebarColor: string;
  backgroundColor: string;
  chartColors: string[];
}

// Variable Pay & Incentive Management
export type IncentiveCategory = 'Sales' | 'Retention' | 'Performance' | 'Adhoc';
export type RecurrenceType = 'OneTime' | 'Monthly' | 'Quarterly';
export type TaxTreatmentType = 'FullyTaxable' | 'PartiallyTaxable' | 'Exempt';
export type IncentiveStatus = 'Draft' | 'PendingApproval' | 'Approved' | 'Imported' | 'Paid' | 'Cancelled';

export interface IncentiveRule {
  id: string;
  name: string;
  category: IncentiveCategory;
  formulaExpression: string; // e.g. "monthlyBasic * 0.1"
  baseComponent: 'CTC' | 'Basic' | 'Fixed';
  capAmount?: number;
  recurrenceType: RecurrenceType;
  recurrenceCount: number;
  taxTreatmentType: TaxTreatmentType;
  pfApplicable: boolean;
  esiApplicable: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  version: number;
  createdBy: string;
  createdAt: string;
  isLocked: boolean; // Locked after first approval
}

export interface IncentiveAllocation {
  id: string;
  ruleId: string;
  employeeId: string;
  departmentId?: string;
  calculatedAmount: number;
  payrollMonth: number;
  payrollYear: number;
  status: IncentiveStatus;
  isRecovery: boolean;
  sourceRuleVersion: number;
  installmentNumber?: number;
  totalInstallments?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IncentiveApprovalLog {
  id: string;
  allocationId: string;
  approvedBy: string;
  approvedAt: string;
  statusBefore: IncentiveStatus;
  statusAfter: IncentiveStatus;
  comments?: string;
}

// Navigation
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles: UserRole[];
  children?: NavItem[];
}
