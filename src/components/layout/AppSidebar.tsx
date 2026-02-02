import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Wallet,
  Calculator,
  FileText,
  Settings,
  Receipt,
  UserCircle,
  TrendingUp,
  LogOut,
  Moon,
  Sun,
  Trophy,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/payroll';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'accountant'] },
  { title: 'Employees', href: '/employees', icon: Users, roles: ['admin'] },
  { title: 'Company', href: '/company', icon: Building2, roles: ['admin'] },
  { title: 'Salary Structures', href: '/salary-structures', icon: Wallet, roles: ['admin'] },
  { title: 'Statutory', href: '/statutory', icon: Calculator, roles: ['admin'] },
  { title: 'Run Payroll', href: '/payroll', icon: Receipt, roles: ['admin'] },
  { title: 'Incentives', href: '/payroll/incentives', icon: Trophy, roles: ['admin', 'accountant'] },
  { title: 'Proof Verification', href: '/payroll/verification', icon: FileCheck, roles: ['admin', 'accountant'] },
  { title: 'Tax Optimizer', href: '/payroll/optimizer', icon: TrendingUp, roles: ['admin', 'accountant'] },
  { title: 'Settlements', href: '/settlements', icon: FileText, roles: ['admin'] },
  { title: 'My Profile', href: '/my-profile', icon: UserCircle, roles: ['employee'] },
  { title: 'Tax Proofs', href: '/investments', icon: ShieldCheck, roles: ['employee'] },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  if (!user) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <Sidebar
      className={cn(
        'border-r border-sidebar-border bg-sidebar-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">PayrollPro</span>
              <span className="text-xs text-sidebar-foreground/60">Indian Payroll</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <NavLink
                      to={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex flex-col gap-2">
          {!collapsed && (
            <div className="mb-2 flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-sidebar-foreground">{user.name}</span>
                <span className="text-xs capitalize text-sidebar-foreground/60">{user.role}</span>
              </div>
            </div>
          )}
          <div className={cn('flex gap-2', collapsed ? 'flex-col' : 'flex-row')}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-9 w-9 text-sidebar-foreground/60 hover:bg-destructive/20 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
