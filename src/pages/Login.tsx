import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Calculator, User, Wallet, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BentoCard, BentoCardTitle, BentoCardDescription } from '@/components/ui/bento-card';
import type { UserRole } from '@/types/payroll';
import { cn } from '@/lib/utils';

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  email: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    role: 'admin',
    title: 'Admin',
    description: 'Full access to all modules, payroll processing, and configuration',
    email: 'admin@acmetech.com',
    icon: Shield,
    color: 'from-violet-500 to-purple-600',
  },
  {
    role: 'accountant',
    title: 'Accountant',
    description: 'View financial reports, payroll registers, and compliance data',
    email: 'accountant@acmetech.com',
    icon: Calculator,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    role: 'employee',
    title: 'Employee',
    description: 'Access personal profile, salary details, and download payslips',
    email: 'rahul.sharma@acmetech.com',
    icon: User,
    color: 'from-amber-500 to-orange-600',
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
    
    // Simulate a brief delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 500));
    
    login(selectedRole);
    
    // Navigate based on role
    if (selectedRole === 'employee') {
      navigate('/my-profile');
    } else {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="mb-3 text-4xl font-bold text-foreground">PayrollPro</h1>
          <p className="text-lg text-muted-foreground">
            Indian Payroll Management System
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
            Select your role to continue
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {roleOptions.map((option) => (
              <BentoCard
                key={option.role}
                hover
                className={cn(
                  'cursor-pointer transition-all duration-300',
                  selectedRole === option.role
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'hover:scale-[1.02]'
                )}
                onClick={() => setSelectedRole(option.role)}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      'mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
                      option.color
                    )}
                  >
                    <option.icon className="h-7 w-7 text-white" />
                  </div>
                  <BentoCardTitle className="mb-2">{option.title}</BentoCardTitle>
                  <BentoCardDescription className="mb-4 text-xs">
                    {option.description}
                  </BentoCardDescription>
                  <div className="rounded-lg bg-muted px-3 py-1.5">
                    <code className="text-xs text-muted-foreground">{option.email}</code>
                  </div>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>

        {/* Login Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleLogin}
            disabled={!selectedRole || isLoading}
            className="min-w-[200px] gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Signing in...
              </>
            ) : (
              <>
                Continue as {selectedRole ? roleOptions.find(r => r.role === selectedRole)?.title : '...'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Demo mode: No password required. Select a role to explore the system.
        </p>
      </div>
    </div>
  );
}
