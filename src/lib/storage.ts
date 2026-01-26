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
} as const;

// Generic storage functions
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage: ${key}`, error);
  }
}

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
      id: 'comp-5',
      name: 'Special Allowance',
      code: 'SPAL',
      type: 'earning',
      calculationType: 'percentage_of_ctc',
      value: 20,
      isTaxable: true,
      includeInGross: true,
      includeInPF: false,
      includeInESI: true,
      includeInPT: true,
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
        annualCTC: 900000,
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
    ];
    setSalaryStructures(defaultStructures);
  }
};
