import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole, Department } from '../types';
import { dataService } from '../data';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  selectedDepartment: Department | null;
  isSuperAdmin: boolean;
  isDeptHead: boolean;
  canEvaluate: boolean;
  canEdit: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  selectDepartment: (dept: Department) => void;
  clearDepartment: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('nawaloka_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Default light for clinical healthcare cleanliness
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('nawaloka_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Restore session
  const refreshUser = useCallback(async () => {
    try {
      const current = await dataService.getCurrentUser();
      if (current) {
        setUser(current.profile);
        setRole(current.role);

        // Restore selected department
        const savedDeptId = localStorage.getItem('nawaloka_selected_dept_id');
        if (savedDeptId) {
          const dept = await dataService.getDepartment(savedDeptId);
          if (dept) setSelectedDepartment(dept);
        } else if (current.profile.departmentId && current.profile.departmentId !== 'ALL') {
          const dept = await dataService.getDepartment(current.profile.departmentId);
          if (dept) {
            setSelectedDepartment(dept);
            localStorage.setItem('nawaloka_selected_dept_id', dept.id);
          }
        }
      } else {
        setUser(null);
        setRole(null);
      }
    } catch (err) {
      console.warn('Session refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const selectDepartment = (dept: Department) => {
    setSelectedDepartment(dept);
    localStorage.setItem('nawaloka_selected_dept_id', dept.id);
  };

  const clearDepartment = () => {
    setSelectedDepartment(null);
    localStorage.removeItem('nawaloka_selected_dept_id');
  };

  const login = async (email: string, password: string) => {
    if (!selectedDepartment) {
      throw new Error('Please select a department first.');
    }
    const session = await dataService.login(email, password, selectedDepartment.id);
    setUser(session.profile);
    setRole(session.role);
  };

  const logout = async () => {
    await dataService.logout();
    setUser(null);
    setRole(null);
  };

  const isSuperAdmin = role === 'super_admin';
  const isDeptHead = isSuperAdmin || role === 'dept_head';
  const canEvaluate = isSuperAdmin || role === 'dept_head' || role === 'evaluator';
  const canEdit = isSuperAdmin || role === 'dept_head';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        selectedDepartment,
        isSuperAdmin,
        isDeptHead,
        canEvaluate,
        canEdit,
        isLoading,
        isDemoMode: dataService.isDemo,
        theme,
        toggleTheme,
        selectDepartment,
        clearDepartment,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
