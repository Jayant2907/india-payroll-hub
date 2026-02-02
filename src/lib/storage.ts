import type {
  Employee,
  CompanyConfig,
  SalaryComponent,
  SalaryStructure,
  PFSettings,
  PTSlab,
  TaxSettings,
  PayrollRun,
  Settlement,
  ThemeConfig,
  User,
} from '@/types/payroll';

// Storage keys
export const STORAGE_KEYS = {
  USER: 'app_current_user',
  EMPLOYEES: 'app_employees_data',
  COMPANY_CONFIG: 'app_company_config',
  THEME: 'app-theme',
  MASTER_COMPONENTS: 'app_master_components',
  SALARY_STRUCTURES: 'app_salary_structures',
  TAX_SETTINGS: 'app_tax_settings',
  PT_SLABS: 'app_pt_slabs',
  PF_SETTINGS: 'app_pf_settings',
  PAYROLL_RUNS: 'processedPayrolls',
  SETTLEMENTS: 'app_settlements',
  INCENTIVE_RULES: 'app_incentive_rules',
  INCENTIVE_ALLOCATIONS: 'app_incentive_allocations',
  INCENTIVE_LOGS: 'app_incentive_logs',
} as const;

import { getItem, setItem } from './storage-fallback';


// User
export const getCurrentUser = (): User | null => getItem<User | null>(STORAGE_KEYS.USER, null);
export const setCurrentUser = (user: User | null): void => setItem(STORAGE_KEYS.USER, user);

// Employees
export const getEmployees = (): Employee[] => getItem<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
export const setEmployees = (employees: Employee[]): void => setItem(STORAGE_KEYS.EMPLOYEES, employees);

export const addEmployee = (employee: Employee): void => {
  const employees = getEmployees();
  employees.push(employee);
  setEmployees(employees);
};

export const updateEmployee = (id: string, updates: Partial<Employee>): void => {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === id);
  if (index !== -1) {
    employees[index] = { ...employees[index], ...updates, updatedAt: new Date().toISOString() };
    setEmployees(employees);
  }
};

export const deleteEmployee = (id: string): void => {
  const employees = getEmployees();
  setEmployees(employees.filter(e => e.id !== id));
};

// Company Config
export const getCompanyConfig = (): CompanyConfig => getItem<CompanyConfig>(STORAGE_KEYS.COMPANY_CONFIG, {
  legalName: 'Acme Technologies Pvt. Ltd.',
  tradeName: 'Acme Tech',
  address: '123 Tech Park, Electronic City',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560100',
  cin: 'U72200KA2020PTC123456',
  pan: 'AABCA1234A',
  tan: 'BLRA12345A',
  epfCode: 'KABLR0012345',
  esiNumber: 'KABLR1234567',
  ptState: 'Karnataka',
  lwfState: 'Karnataka',
  payCycle: 'monthly',
  payDay: 1,
});
export const setCompanyConfig = (config: CompanyConfig): void => setItem(STORAGE_KEYS.COMPANY_CONFIG, config);

// Theme
export const getThemeConfig = (): ThemeConfig => getItem<ThemeConfig>(STORAGE_KEYS.THEME, {
  mode: 'dark',
  primaryColor: 'hsl(262, 80%, 60%)',
  sidebarColor: 'hsl(240, 10%, 8%)',
  backgroundColor: 'hsl(240, 10%, 6%)',
  chartColors: ['hsl(262, 80%, 65%)', 'hsl(173, 80%, 50%)', 'hsl(47, 96%, 58%)', 'hsl(340, 75%, 60%)', 'hsl(24, 95%, 58%)'],
});
export const setThemeConfig = (config: ThemeConfig): void => setItem(STORAGE_KEYS.THEME, config);

// Master Components
export const getMasterComponents = (): SalaryComponent[] => getItem<SalaryComponent[]>(STORAGE_KEYS.MASTER_COMPONENTS, getDefaultMasterComponents());
export const setMasterComponents = (components: SalaryComponent[]): void => setItem(STORAGE_KEYS.MASTER_COMPONENTS, components);

// Salary Structures
export const getSalaryStructures = (): SalaryStructure[] => getItem<SalaryStructure[]>(STORAGE_KEYS.SALARY_STRUCTURES, []);
export const setSalaryStructures = (structures: SalaryStructure[]): void => setItem(STORAGE_KEYS.SALARY_STRUCTURES, structures);

// PF Settings
export const getPFSettings = (): PFSettings => getItem<PFSettings>(STORAGE_KEYS.PF_SETTINGS, {
  enabled: true,
  employeeContribution: 12,
  employerContribution: 12,
  wageCeiling: 15000,
});
export const setPFSettings = (settings: PFSettings): void => setItem(STORAGE_KEYS.PF_SETTINGS, settings);

// PT Slabs
export const getPTSlabs = (): PTSlab[] => getItem<PTSlab[]>(STORAGE_KEYS.PT_SLABS, getDefaultPTSlabs());
export const setPTSlabs = (slabs: PTSlab[]): void => setItem(STORAGE_KEYS.PT_SLABS, slabs);

// Tax Settings
export const getTaxSettings = (): TaxSettings => getItem<TaxSettings>(STORAGE_KEYS.TAX_SETTINGS, getDefaultTaxSettings());
export const setTaxSettings = (settings: TaxSettings): void => setItem(STORAGE_KEYS.TAX_SETTINGS, settings);

// Payroll Runs
export const getPayrollRuns = (): PayrollRun[] => getItem<PayrollRun[]>(STORAGE_KEYS.PAYROLL_RUNS, []);
export const setPayrollRuns = (runs: PayrollRun[]): void => setItem(STORAGE_KEYS.PAYROLL_RUNS, runs);

// Settlements
export const getSettlements = (): Settlement[] => getItem<Settlement[]>(STORAGE_KEYS.SETTLEMENTS, []);
export const setSettlements = (settlements: Settlement[]): void => setItem(STORAGE_KEYS.SETTLEMENTS, settlements);

// Incentives
export const getIncentiveRules = (): IncentiveRule[] => getItem<IncentiveRule[]>(STORAGE_KEYS.INCENTIVE_RULES, []);
export const setIncentiveRules = (rules: IncentiveRule[]): void => setItem(STORAGE_KEYS.INCENTIVE_RULES, rules);

export const getIncentiveAllocations = (): IncentiveAllocation[] => getItem<IncentiveAllocation[]>(STORAGE_KEYS.INCENTIVE_ALLOCATIONS, []);
export const setIncentiveAllocations = (allocations: IncentiveAllocation[]): void => setItem(STORAGE_KEYS.INCENTIVE_ALLOCATIONS, allocations);

export const getIncentiveLogs = (): IncentiveApprovalLog[] => getItem<IncentiveApprovalLog[]>(STORAGE_KEYS.INCENTIVE_LOGS, []);
export const setIncentiveLogs = (logs: IncentiveApprovalLog[]): void => setItem(STORAGE_KEYS.INCENTIVE_LOGS, logs);

export const resetIncentiveData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.INCENTIVE_ALLOCATIONS);
  localStorage.removeItem(STORAGE_KEYS.INCENTIVE_LOGS);
};

export const updateIncentiveStatus = (allocationId: string, newStatus: IncentiveStatus, user: string, comments?: string): void => {
  const allocations = getIncentiveAllocations();
  const logs = getIncentiveLogs();
  const index = allocations.findIndex(a => a.id === allocationId);

  if (index !== -1) {
    const statusBefore = allocations[index].status;
    allocations[index] = { ...allocations[index], status: newStatus, updatedAt: new Date().toISOString() };

    // Add audit log
    const log: IncentiveApprovalLog = {
      id: `log-${Date.now()}`,
      allocationId,
      approvedBy: user,
      approvedAt: new Date().toISOString(),
      statusBefore,
      statusAfter: newStatus,
      comments
    };

    logs.push(log);
    setIncentiveAllocations(allocations);
    setIncentiveLogs(logs);

    // If approved, lock the associated rule
    if (newStatus === 'Approved') {
      const rules = getIncentiveRules();
      const ruleIndex = rules.findIndex(r => r.id === allocations[index].ruleId);
      if (ruleIndex !== -1 && !rules[ruleIndex].isLocked) {
        rules[ruleIndex].isLocked = true;
        setIncentiveRules(rules);
      }
    }
  }
};

// Default Data Generators
function getDefaultMasterComponents(): SalaryComponent[] {
  return [
    {
      id: 'comp-1',
      name: 'Basic Salary',
      code: 'BASIC',
      type: 'earning',
      calculationType: 'percentage_of_ctc',
      value: 40,
      isTaxable: true,
      includeInGross: true,
      includeInPF: true,
      includeInESI: true,
      includeInPT: true,
      includeInLWF: true,
      isActive: true,
    },
    {
      id: 'comp-2',
      name: 'House Rent Allowance',
      code: 'HRA',
      type: 'earning',
      calculationType: 'percentage_of_basic',
      value: 50,
      isTaxable: true,
      includeInGross: true,
      includeInPF: false,
      includeInESI: true,
      includeInPT: true,
      includeInLWF: false,
      isActive: true,
    },
    {
      id: 'comp-3',
      name: 'Conveyance Allowance',
      code: 'CONV',
      type: 'earning',
      calculationType: 'fixed',
      value: 1600,
      isTaxable: false,
      includeInGross: true,
      includeInPF: false,
      includeInESI: true,
      includeInPT: true,
      includeInLWF: false,
      isActive: true,
    },
    {
      id: 'comp-4',
      name: 'Medical Allowance',
      code: 'MED',
      type: 'earning',
      calculationType: 'fixed',
      value: 1250,
      isTaxable: true,
      includeInGross: true,
      includeInPF: false,
      includeInESI: true,
      includeInPT: true,
      includeInLWF: false,
      isActive: true,
    },
    {
      id: 'comp-6',
      name: 'Performance Bonus',
      code: 'BONUS',
      type: 'earning',
      calculationType: 'fixed',
      value: 0,
      isTaxable: true,
      includeInGross: true,
      includeInPF: false,
      includeInESI: false,
      includeInPT: true,
      includeInLWF: false,
      isActive: true,
    },
    {
      id: 'comp-7',
      name: 'Leave Travel Allowance',
      code: 'LTA',
      type: 'earning',
      calculationType: 'fixed',
      value: 0,
      isTaxable: true,
      includeInGross: true,
      includeInPF: false,
      includeInESI: false,
      includeInPT: true,
      includeInLWF: false,
      isActive: true,
    },
    {
      id: 'comp-8',
      name: 'Internet Reimbursement',
      code: 'INT',
      type: 'earning',
      calculationType: 'fixed',
      value: 1000,
      isTaxable: false,
      includeInGross: true,
      includeInPF: false,
      includeInESI: false,
      includeInPT: false,
      includeInLWF: false,
      isActive: true,
    },
  ];
}

function getDefaultPTSlabs(): PTSlab[] {
  return [
    { id: 'pt-1', state: 'Karnataka', minSalary: 0, maxSalary: 15000, taxAmount: 0 },
    { id: 'pt-2', state: 'Karnataka', minSalary: 15001, maxSalary: 99999999, taxAmount: 200 },
    { id: 'pt-3', state: 'Maharashtra', minSalary: 0, maxSalary: 7500, taxAmount: 0 },
    { id: 'pt-4', state: 'Maharashtra', minSalary: 7501, maxSalary: 10000, taxAmount: 175 },
    { id: 'pt-5', state: 'Maharashtra', minSalary: 10001, maxSalary: 99999999, taxAmount: 200 },
  ];
}

function getDefaultTaxSettings(): TaxSettings {
  return {
    fiscalYear: '2024-25',
    standardDeduction: 50000,
    section80CLimit: 150000,
    hraExemptionLimit: 100000,
    slabs: [
      // New Regime
      { id: 'tax-1', regime: 'new', fiscalYear: '2024-25', minIncome: 0, maxIncome: 300000, taxRate: 0 },
      { id: 'tax-2', regime: 'new', fiscalYear: '2024-25', minIncome: 300001, maxIncome: 600000, taxRate: 5 },
      { id: 'tax-3', regime: 'new', fiscalYear: '2024-25', minIncome: 600001, maxIncome: 900000, taxRate: 10 },
      { id: 'tax-4', regime: 'new', fiscalYear: '2024-25', minIncome: 900001, maxIncome: 1200000, taxRate: 15 },
      { id: 'tax-5', regime: 'new', fiscalYear: '2024-25', minIncome: 1200001, maxIncome: 1500000, taxRate: 20 },
      { id: 'tax-6', regime: 'new', fiscalYear: '2024-25', minIncome: 1500001, maxIncome: 99999999, taxRate: 30 },
      // Old Regime
      { id: 'tax-7', regime: 'old', fiscalYear: '2024-25', minIncome: 0, maxIncome: 250000, taxRate: 0 },
      { id: 'tax-8', regime: 'old', fiscalYear: '2024-25', minIncome: 250001, maxIncome: 500000, taxRate: 5 },
      { id: 'tax-9', regime: 'old', fiscalYear: '2024-25', minIncome: 500001, maxIncome: 1000000, taxRate: 20 },
      { id: 'tax-10', regime: 'old', fiscalYear: '2024-25', minIncome: 1000001, maxIncome: 99999999, taxRate: 30 },
    ],
  };
}

// Initialize demo data
export const initializeDemoData = (): void => {
  // Only initialize if no employees exist
  if (getEmployees().length === 0) {
    const demoEmployees: Employee[] = [
      {
        id: 'emp-1',
        firstName: 'Rahul',
        lastName: 'Sharma',
        dateOfBirth: '1990-05-15',
        gender: 'male',
        maritalStatus: 'married',
        email: 'rahul.sharma@acmetech.com',
        phone: '9876543210',
        address: '42, MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        employeeCode: 'ACM001',
        role: 'Senior Developer',
        department: 'Engineering',
        status: 'active',
        joiningDate: '2022-03-01',
        annualCTC: 1800000,
        salaryStructureId: 'struct-1',
        pan: 'ABCPS1234A',
        aadhaar: '123456789012',
        uan: '100123456789',
        bankName: 'HDFC Bank',
        bankAccountNumber: '50100123456789',
        bankIfsc: 'HDFC0001234',
        taxRegime: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp-2',
        firstName: 'Priya',
        lastName: 'Patel',
        dateOfBirth: '1992-08-22',
        gender: 'female',
        maritalStatus: 'single',
        email: 'priya.patel@acmetech.com',
        phone: '9876543211',
        address: '15, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        employeeCode: 'ACM002',
        role: 'Product Manager',
        department: 'Product',
        status: 'active',
        joiningDate: '2021-06-15',
        annualCTC: 2400000,
        salaryStructureId: 'struct-2',
        pan: 'DEFPP4567B',
        aadhaar: '234567890123',
        uan: '100234567890',
        bankName: 'ICICI Bank',
        bankAccountNumber: '001234567890',
        bankIfsc: 'ICIC0001234',
        taxRegime: 'old',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp-3',
        firstName: 'Amit',
        lastName: 'Kumar',
        dateOfBirth: '1988-12-10',
        gender: 'male',
        maritalStatus: 'married',
        email: 'amit.kumar@acmetech.com',
        phone: '9876543212',
        address: '78, HSR Layout',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560102',
        employeeCode: 'ACM003',
        role: 'Finance Lead',
        department: 'Finance',
        status: 'active',
        joiningDate: '2020-01-10',
        annualCTC: 2100000,
        salaryStructureId: 'struct-2',
        pan: 'GHIAK7890C',
        aadhaar: '345678901234',
        uan: '100345678901',
        bankName: 'SBI',
        bankAccountNumber: '32123456789',
        bankIfsc: 'SBIN0001234',
        taxRegime: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp-4',
        firstName: 'Sneha',
        lastName: 'Reddy',
        dateOfBirth: '1995-03-28',
        gender: 'female',
        maritalStatus: 'single',
        email: 'sneha.reddy@acmetech.com',
        phone: '9876543213',
        address: '25, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560034',
        employeeCode: 'ACM004',
        role: 'Junior Developer',
        department: 'Engineering',
        status: 'active',
        joiningDate: '2023-09-01',
        annualCTC: 850000,
        salaryStructureId: 'struct-1',
        pan: 'JKLSR2345D',
        aadhaar: '456789012345',
        uan: '100456789012',
        bankName: 'Axis Bank',
        bankAccountNumber: '917020012345678',
        bankIfsc: 'UTIB0001234',
        taxRegime: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp-5',
        firstName: 'Vikram',
        lastName: 'Singh',
        dateOfBirth: '1985-07-19',
        gender: 'male',
        maritalStatus: 'married',
        email: 'vikram.singh@acmetech.com',
        phone: '9876543214',
        address: '56, Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560066',
        employeeCode: 'ACM005',
        role: 'HR Manager',
        department: 'Human Resources',
        status: 'inactive',
        joiningDate: '2019-04-01',
        exitDate: '2024-12-31',
        annualCTC: 1500000,
        salaryStructureId: 'struct-2',
        pan: 'MNOVS6789E',
        aadhaar: '567890123456',
        uan: '100567890123',
        bankName: 'Kotak Bank',
        bankAccountNumber: '1234567890123',
        bankIfsc: 'KKBK0001234',
        taxRegime: 'old',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp-6',
        firstName: 'Anjali',
        lastName: 'Mehta',
        dateOfBirth: '1991-11-05',
        gender: 'female',
        maritalStatus: 'married',
        email: 'anjali.mehta@acmetech.com',
        phone: '9876543215',
        address: '12, Jayanagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560011',
        employeeCode: 'ACM006',
        role: 'Senior UI/UX Designer',
        department: 'Design',
        status: 'inactive',
        joiningDate: '2020-05-15',
        exitDate: '2025-01-15',
        annualCTC: 1650000,
        salaryStructureId: 'struct-1',
        pan: 'PQRAN1234F',
        aadhaar: '678901234567',
        uan: '100678901234',
        bankName: 'Yes Bank',
        bankAccountNumber: '9876543210',
        bankIfsc: 'YESB0001234',
        taxRegime: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp-7',
        firstName: 'Karthik',
        lastName: 'Rao',
        dateOfBirth: '1987-09-30',
        gender: 'male',
        maritalStatus: 'married',
        email: 'karthik.rao@acmetech.com',
        phone: '9876543216',
        address: '88, Malleshwaram',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560003',
        employeeCode: 'ACM007',
        role: 'VP Sales',
        department: 'Sales',
        status: 'inactive',
        joiningDate: '2018-02-01',
        exitDate: '2025-01-30',
        annualCTC: 4500000,
        salaryStructureId: 'struct-3',
        pan: 'STUKV5678G',
        aadhaar: '789012345678',
        uan: '100789012345',
        bankName: 'Standard Chartered',
        bankAccountNumber: '34567890',
        bankIfsc: 'SCBL0036083',
        taxRegime: 'old',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp-8',
        firstName: 'Meera',
        lastName: 'Nair',
        dateOfBirth: '1994-01-12',
        gender: 'female',
        maritalStatus: 'single',
        email: 'meera.nair@acmetech.com',
        phone: '9876543217',
        address: '3, Ulsoor Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560042',
        employeeCode: 'ACM008',
        role: 'Marketing Executive',
        department: 'Marketing',
        status: 'inactive',
        joiningDate: '2023-01-10',
        exitDate: '2025-01-25',
        annualCTC: 720000,
        salaryStructureId: 'struct-1',
        pan: 'VWXMN9012H',
        aadhaar: '890123456789',
        uan: '100890123456',
        bankName: 'IDFC First',
        bankAccountNumber: '1002345678',
        bankIfsc: 'IDFB0001234',
        taxRegime: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp-9',
        firstName: 'Priya',
        lastName: 'Patel',
        dateOfBirth: '1992-05-22',
        gender: 'female',
        maritalStatus: 'married',
        email: 'priya.patel@acmetech.com',
        phone: '9876543218',
        address: '12, Brigade Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        employeeCode: 'ACM009',
        role: 'Senior Product Manager',
        department: 'Product',
        status: 'active',
        joiningDate: '2021-06-15',
        annualCTC: 2800000,
        salaryStructureId: 'struct-2',
        pan: 'ABCDE1234F',
        aadhaar: '123456789012',
        uan: '100123456789',
        bankName: 'HDFC Bank',
        bankAccountNumber: '501002345678',
        bankIfsc: 'HDFC0000123',
        taxRegime: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp-10',
        firstName: 'Arjun',
        lastName: 'Reddy',
        dateOfBirth: '1990-11-05',
        gender: 'male',
        maritalStatus: 'single',
        email: 'arjun.reddy@acmetech.com',
        phone: '9876543219',
        address: '45, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        employeeCode: 'ACM010',
        role: 'Lead Architect',
        department: 'Engineering',
        status: 'active',
        joiningDate: '2019-03-20',
        annualCTC: 4200000,
        salaryStructureId: 'struct-3',
        pan: 'FGHIJ5678K',
        aadhaar: '234567890123',
        uan: '100234567890',
        bankName: 'ICICI Bank',
        bankAccountNumber: '000234567890',
        bankIfsc: 'ICIC0000001',
        taxRegime: 'old',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp-11',
        firstName: 'Siddharth',
        lastName: 'Malhotra',
        dateOfBirth: '1995-07-18',
        gender: 'male',
        maritalStatus: 'single',
        email: 'sid.m@acmetech.com',
        phone: '9876543220',
        address: '22, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560034',
        employeeCode: 'ACM011',
        role: 'Frontend Developer',
        department: 'Engineering',
        status: 'active',
        joiningDate: '2022-01-05',
        annualCTC: 1450000,
        salaryStructureId: 'struct-1',
        pan: 'LMNOP1234Q',
        aadhaar: '345678901234',
        uan: '100345678901',
        bankName: 'Axis Bank',
        bankAccountNumber: '912345678901',
        bankIfsc: 'UTIB0000123',
        taxRegime: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    setEmployees(demoEmployees);
  }

  // Initialize salary structures if empty
  if (getSalaryStructures().length === 0) {
    const defaultStructures: SalaryStructure[] = [
      {
        id: 'struct-1',
        name: 'Developer Structure',
        description: 'Standard salary structure for engineering roles',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
          { componentId: 'comp-1', componentName: 'Basic Salary', componentCode: 'BASIC', type: 'earning', calculationType: 'percentage_of_ctc', value: 40, isTaxable: true },
          { componentId: 'comp-2', componentName: 'House Rent Allowance', componentCode: 'HRA', type: 'earning', calculationType: 'percentage_of_basic', value: 50, isTaxable: true },
          { componentId: 'comp-3', componentName: 'Conveyance Allowance', componentCode: 'CONV', type: 'earning', calculationType: 'fixed', value: 1600, isTaxable: false },
          { componentId: 'comp-5', componentName: 'Special Allowance', componentCode: 'SPAL', type: 'earning', calculationType: 'percentage_of_ctc', value: 20, isTaxable: true },
        ],
      },
      {
        id: 'struct-2',
        name: 'Manager Structure',
        description: 'Salary structure for management roles',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
          { componentId: 'comp-1', componentName: 'Basic Salary', componentCode: 'BASIC', type: 'earning', calculationType: 'percentage_of_ctc', value: 45, isTaxable: true },
          { componentId: 'comp-2', componentName: 'House Rent Allowance', componentCode: 'HRA', type: 'earning', calculationType: 'percentage_of_basic', value: 50, isTaxable: true },
          { componentId: 'comp-3', componentName: 'Conveyance Allowance', componentCode: 'CONV', type: 'earning', calculationType: 'fixed', value: 2000, isTaxable: false },
          { componentId: 'comp-4', componentName: 'Medical Allowance', componentCode: 'MED', type: 'earning', calculationType: 'fixed', value: 1500, isTaxable: true },
          { componentId: 'comp-5', componentName: 'Special Allowance', componentCode: 'SPAL', type: 'earning', calculationType: 'percentage_of_ctc', value: 15, isTaxable: true },
        ],
      },
      {
        id: 'struct-3',
        name: 'Executive Leadership',
        description: 'Comprehensive structure for senior leadership',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
          { componentId: 'comp-1', componentName: 'Basic Salary', componentCode: 'BASIC', type: 'earning', calculationType: 'percentage_of_ctc', value: 50, isTaxable: true },
          { componentId: 'comp-2', componentName: 'House Rent Allowance', componentCode: 'HRA', type: 'earning', calculationType: 'percentage_of_basic', value: 50, isTaxable: true },
          { componentId: 'comp-3', componentName: 'Conveyance Allowance', componentCode: 'CONV', type: 'earning', calculationType: 'fixed', value: 5000, isTaxable: false },
          { componentId: 'comp-4', componentName: 'Medical Allowance', componentCode: 'MED', type: 'earning', calculationType: 'fixed', value: 5000, isTaxable: true },
          { componentId: 'comp-5', componentName: 'Special Allowance', componentCode: 'SPAL', type: 'earning', calculationType: 'percentage_of_ctc', value: 25, isTaxable: true },
        ],
      },
    ];
    setSalaryStructures(defaultStructures);
  }

  // Initialize Incentive Rules if empty
  if (getIncentiveRules().length === 0) {
    const demoRules: IncentiveRule[] = [
      {
        id: 'rule-sales-1',
        name: 'Standard Sales Commission',
        category: 'Sales',
        formulaExpression: 'monthlyBasic * 0.15',
        baseComponent: 'Basic',
        recurrenceType: 'Monthly',
        recurrenceCount: 12,
        taxTreatmentType: 'FullyTaxable',
        pfApplicable: false,
        esiApplicable: false,
        effectiveFrom: new Date().toISOString(),
        version: 1,
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
        isLocked: true,
      },
      {
        id: 'rule-perf-1',
        name: 'Quarterly Performance Bonus',
        category: 'Performance',
        formulaExpression: 'monthlyCTC * 0.05',
        baseComponent: 'CTC',
        recurrenceType: 'OneTime',
        recurrenceCount: 1,
        taxTreatmentType: 'FullyTaxable',
        pfApplicable: false,
        esiApplicable: false,
        effectiveFrom: new Date().toISOString(),
        version: 1,
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
        isLocked: false,
      }
    ];
    setIncentiveRules(demoRules);

    // Add a demo approved allocation for Rahul Sharma (emp-1)
    const rahul = getEmployees().find(e => e.id === 'emp-1');
    if (rahul) {
      const allocation: IncentiveAllocation = {
        id: 'demo-alloc-1',
        ruleId: 'rule-sales-1',
        employeeId: 'emp-1',
        departmentId: 'Engineering',
        calculatedAmount: (rahul.annualCTC * 0.4 / 12) * 0.15,
        payrollMonth: new Date().getMonth() + 1,
        payrollYear: new Date().getFullYear(),
        status: 'Approved',
        isRecovery: false,
        sourceRuleVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setIncentiveAllocations([allocation]);
    }
  }

  // Pre-seed Investment Declaration for testing HR flow
  const declarationsKey = 'app_inv_proof_declarations';
  if (!localStorage.getItem(declarationsKey)) {
    const demoDeclarations = [{
      id: 'decl-demo-1',
      employeeId: 'emp-2', // Priya Patel
      fiscalYear: '2024-25',
      regime: 'old',
      isRegimeLocked: true,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      sections: {
        '80C': {
          type: '80C',
          declaredAmount: 45000,
          approvedAmount: 0,
          items: [{
            id: 'item-demo-1',
            description: 'HDFC Life Insurance',
            declaredAmount: 25000,
            approvedAmount: 0,
            proofIds: ['proof-1'],
            status: 'Pending'
          }, {
            id: 'item-demo-2',
            description: 'PPF Contribution',
            declaredAmount: 20000,
            approvedAmount: 0,
            proofIds: ['proof-2'],
            status: 'Pending'
          }]
        },
        '80D': { type: '80D', declaredAmount: 0, approvedAmount: 0, items: [] },
        'HRA': { type: 'HRA', declaredAmount: 0, approvedAmount: 0, items: [] },
        'NPS': { type: 'NPS', declaredAmount: 0, approvedAmount: 0, items: [] },
        'LTA': { type: 'LTA', declaredAmount: 0, approvedAmount: 0, items: [] },
        'Other': { type: 'Other', declaredAmount: 0, approvedAmount: 0, items: [] },
      }
    }];
    localStorage.setItem(declarationsKey, JSON.stringify(demoDeclarations));
  }
};

export const forceResetDemoData = (): void => {
  localStorage.clear();
  initializeDemoData();
  window.location.reload();
};
