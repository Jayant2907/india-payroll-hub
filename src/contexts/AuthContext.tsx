import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '@/types/payroll';
import { getCurrentUser, setCurrentUser, initializeDemoData } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for each role
const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: 'user-admin',
    email: 'admin@acmetech.com',
    name: 'Admin User',
    role: 'admin',
  },
  accountant: {
    id: 'user-accountant',
    email: 'accountant@acmetech.com',
    name: 'Finance User',
    role: 'accountant',
  },
  employee: {
    id: 'user-employee',
    email: 'rahul.sharma@acmetech.com',
    name: 'Rahul Sharma',
    role: 'employee',
    employeeId: 'emp-1',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize demo data on first load
    initializeDemoData();
    
    // Check for existing session
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const login = useCallback((role: UserRole) => {
    const demoUser = DEMO_USERS[role];
    setUser(demoUser);
    setCurrentUser(demoUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
