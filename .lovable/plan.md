
# Indian Payroll Management System - Implementation Plan

## Overview
A comprehensive client-side payroll application tailored for Indian statutory requirements, featuring a stunning Glassmorphism-inspired Bento-Grid UI with an Onyx Dark theme. Role-based access control enables Admin, Accountant, and Employee views with all data persisted in localStorage.

---

## Phase 1: Foundation & Authentication

### 1.1 Theme & Design System
- Implement **Onyx Dark** theme with glassmorphism effects (frosted glass cards, subtle glows, backdrop blur)
- Configure dual-theme support (Onyx Black / Paper White) with smooth transitions
- Create reusable Bento-Card components with glass styling

### 1.2 Role-Based Authentication (Simulated)
- **Login Page** with role selector (Admin/Accountant/Employee)
- Pre-filled demo credentials for easy testing
- Session management via localStorage
- Protected route wrappers per role

### 1.3 Navigation Architecture
- **Left sidebar rail** with icon-based navigation
- Dynamic menu items based on logged-in role
- Active state indicators and smooth transitions
- Mobile-responsive drawer variant

---

## Phase 2: Admin Command Center (Dashboard)

### 2.1 Active Payroll Tab
- **Workforce Strength** widget showing employee counts
- **Monthly Payroll Estimate** card with key figures
- **Department Distribution** bar chart
- **Headcount by Organization** donut chart

### 2.2 Compliance Calendar Widget
- Live statutory deadlines display (TDS, PF, ESI, PT)
- Status indicators: Overdue (red), Due Today (amber), Upcoming (green)
- Date-aware logic based on Indian tax calendar

### 2.3 Past Payrolls Tab
- Dropdown to select historical payroll periods
- Stats: Gross Payroll, Deductions, Income Tax, Net Payout
- Earnings/Deductions breakdown charts

### 2.4 Comparative Analytics Tab
- Cost vs Headcount trend lines
- Growth metrics visualization
- Efficiency metrics over time

---

## Phase 3: Employee Management

### 3.1 Employee List View
- Searchable, filterable data table
- Columns: Name, Role, Department, Status, Salary Structure, Actions
- Filters by Status (Active/Inactive) and Department

### 3.2 Add/Edit Employee Modal (4-Tab Form)
- **Personal Tab**: Name, DOB, Gender, Marital Status
- **Contact Tab**: Email, Phone, Addresses
- **Official Tab**: Role, Department, Status, Joining Date, CTC, Salary Structure assignment
- **Statutory & Bank Tab**: PAN, Aadhaar, UAN, Bank Details, Tax Regime (New/Old)

### 3.3 Employee Actions
- Edit, Delete (soft delete), View details
- Bulk download/upload via Excel templates

---

## Phase 4: Company & Payroll Configuration

### 4.1 Organization Details Tab
- Legal Name, Trade Name, Address, CIN configuration

### 4.2 Statutory Registrations Tab
- PAN, TAN, EPF Code, ESI Number, PT State, LWF State

### 4.3 Payroll Settings Tab
- Pay Cycle (Monthly), Pay Day configuration

### 4.4 Theme & Appearance Tab
- Color pickers for Primary, Sidebar, Background, Charts
- Reset to Default option
- Live preview of changes

---

## Phase 5: Salary Structure Management

### 5.1 Master Component Library
- Define salary heads (Basic, HRA, Bonus, etc.)
- Configuration per head: Type (Earning/Deduction), Calculation method (Fixed/% of Basic/% of CTC)
- Flags: Taxable, Include in Gross/PF/ESI/PT/LWF

### 5.2 Salary Structure Templates
- Create named templates (e.g., "Developer L1", "Manager")
- Structure Builder: Add components from Master Library or create ad-hoc ones
- Excel bulk operations for structure management

---

## Phase 6: Statutory Compliance Configuration

### 6.1 Professional Tax (PT)
- State-specific slab configuration
- Fields: Min Salary, Max Salary, Tax Amount

### 6.2 Provident Fund (PF)
- Enable/Disable toggle
- Employee/Employer contribution rates (%)
- Statutory Wage Ceiling (₹15,000 default)

### 6.3 Income Tax Configuration
- Tax Regime management (New/Old)
- Slab configuration: Min Income, Max Income, Tax Rate %
- 80C, Standard Deduction, HRA limits
- Fiscal Year cloning for new financial years

### 6.4 Other Components
- Custom statutory heads (LWF, etc.)
- Calculation basis configuration

---

## Phase 7: Payroll Processing Engine (4-Step Wizard)

### Step 1: Select Employees
- Checkbox selection of active employees
- Health check display (Status, Department validation)

### Step 2: Leave & Attendance
- Input LWP (Leave Without Pay) days per employee
- Paid Leave tracking (CL/PL/SL)
- Automatic earnings reduction calculation

### Step 3: Variable Pay
- Add ad-hoc Earnings (Bonus, Arrears)
- Add Deductions (Fines, Recovery)
- Dynamic row management per employee

### Step 4: Review & Freeze
- **Calculation Engine**:
  - Gross Earnings = Base + Allowances - LWP + Variable Earnings
  - Deductions = PF + PT + Income Tax + Variable Deductions
  - Net Pay = Gross - Total Deductions
- Lock & Freeze functionality (saves snapshot, prevents editing)
- Payslip generation per employee

### Audit View
- Access locked historical payrolls
- Read-only payslip details

---

## Phase 8: Full & Final Settlement

- Target inactive/resigned employees
- Components: Salary pro-rata, Leave Encashment, Notice Period Recovery, Gratuity
- Real-time Net Payable calculation
- Save Draft / Finalize workflow
- Individual settlement Excel download

---

## Phase 9: Accountant & Employee Views

### 9.1 Accountant Dashboard
- KPI Cards: Total Employees, Total Annual Payroll, Average Monthly Salary
- Payroll Register table (read-only)
- Financial overview charts

### 9.2 Employee Self-Service Portal
- Personal Information (read-only)
- Employment Details (Role, Department, Joining Date)
- Salary View (Annual CTC, Monthly Gross)
- Payslip download for processed months

---

## Data Architecture (localStorage)

| Key | Purpose |
|-----|---------|
| `app_employees_data` | Employee records array |
| `app_company_config` | Organization settings |
| `app-theme` | Visual theme preferences |
| `app_master_components` | Salary component library |
| `app_salary_structures` | Salary templates |
| `app_tax_settings` | Income tax configuration |
| `app_pt_slabs` | Professional Tax slabs |
| `app_pf_settings` | PF configuration |
| `processedPayrolls` | Finalized monthly payroll snapshots |
| `app_settlements` | FnF settlement records |

---

## Key Features Summary

✅ **Glassmorphism Bento-Grid UI** with Onyx Dark theme  
✅ **Role-Based Access** (Admin, Accountant, Employee)  
✅ **Complete Employee Lifecycle** management  
✅ **Indian Statutory Compliance** (PF, PT, ESI, Income Tax)  
✅ **4-Step Payroll Processing Wizard**  
✅ **Full & Final Settlement** module  
✅ **Excel Bulk Operations** throughout  
✅ **Compliance Calendar** with deadline tracking  
✅ **Historical Payroll Analytics**  
✅ **Theme Customization** engine

