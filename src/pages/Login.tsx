import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Calculator, User, Wallet, ArrowRight, IndianRupee, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserRole } from '@/types/payroll';
import { cn } from '@/lib/utils';
import loginBg from '@/assets/login-bg.jpg';

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  email: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const roleOptions: RoleOption[] = [
  {
    role: 'admin',
    title: 'Admin',
    description: 'Full access to all modules and configuration',
    email: 'admin@acmetech.com',
    icon: Shield,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    role: 'accountant',
    title: 'Accountant',
    description: 'Financial reports and payroll registers',
    email: 'accountant@acmetech.com',
    icon: Calculator,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    role: 'employee',
    title: 'Employee',
    description: 'Personal profile and salary details',
    email: 'rahul.sharma@acmetech.com',
    icon: User,
    gradient: 'from-amber-500 to-orange-600',
  },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    login(selectedRole);
    
    if (selectedRole === 'employee') {
      navigate('/my-profile');
    } else {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="relative flex min-h-screen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-background/60" />
      </div>

      {/* Left Side - Branding */}
      <div className="relative z-10 hidden w-1/2 flex-col justify-between p-12 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/25">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">PayrollPro</span>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="mb-4 text-4xl font-bold leading-tight text-foreground lg:text-5xl">
              Simplify Your
              <span className="block bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Payroll Management
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Comprehensive Indian payroll solution with statutory compliance, 
              automated calculations, and seamless reporting.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid gap-4">
            <FeatureItem 
              icon={IndianRupee} 
              title="Indian Statutory Compliance" 
              description="PF, ESI, PT, TDS calculations built-in"
            />
            <FeatureItem 
              icon={TrendingUp} 
              title="Automated Payroll Processing" 
              description="4-step wizard for error-free payrolls"
            />
            <FeatureItem 
              icon={Users} 
              title="Employee Self-Service" 
              description="Payslips, tax declarations, and more"
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          © 2025 PayrollPro. All rights reserved.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="relative z-10 flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">PayrollPro</span>
          </div>

          {/* Glass Card */}
          <div className="rounded-2xl border border-border/50 bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold text-foreground">Welcome Back</h2>
              <p className="text-muted-foreground">Select your role to continue</p>
            </div>

            {/* Role Selection */}
            <div className="mb-6 space-y-3">
              {roleOptions.map((option) => (
                <button
                  key={option.role}
                  onClick={() => setSelectedRole(option.role)}
                  className={cn(
                    'group flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200',
                    selectedRole === option.role
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                      : 'border-border/50 bg-background/50 hover:border-primary/50 hover:bg-background/80'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-lg transition-transform group-hover:scale-105',
                      option.gradient
                    )}
                  >
                    <option.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">{option.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{option.description}</div>
                  </div>
                  <div
                    className={cn(
                      'h-4 w-4 shrink-0 rounded-full border-2 transition-colors',
                      selectedRole === option.role
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/50'
                    )}
                  >
                    {selectedRole === option.role && (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Email Display */}
            {selectedRole && (
              <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label className="text-muted-foreground">Signing in as</Label>
                <div className="mt-1.5 rounded-lg border border-border/50 bg-muted/50 px-4 py-3">
                  <code className="text-sm text-foreground">
                    {roleOptions.find(r => r.role === selectedRole)?.email}
                  </code>
                </div>
              </div>
            )}

            {/* Login Button */}
            <Button
              size="lg"
              onClick={handleLogin}
              disabled={!selectedRole || isLoading}
              className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            {/* Footer Note */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Demo mode — No password required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border/30 bg-card/40 p-4 backdrop-blur-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <div className="font-medium text-foreground">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}
