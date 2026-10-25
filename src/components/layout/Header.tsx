import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DepartmentIcon } from '../common/DepartmentIcon';
import { Sun, Moon, LogOut, Shield, User, Building, Database } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, role, selectedDepartment, logout, theme, toggleTheme, isDemoMode, clearDepartment, isSuperAdmin } =
    useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="flex items-center gap-3">
        {user && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Hospital Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1F3A6E] to-[#162A50] text-white shadow-md shadow-blue-900/20">
            <span className="font-extrabold text-base tracking-wider text-teal-400">NH</span>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-[#1F3A6E] dark:text-white tracking-tight">
                NAWALOKA HOSPITALS PLC
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                · Colombo, Sri Lanka
              </span>
            </div>
            <p className="text-xs font-semibold text-[#1A9BB0] dark:text-teal-400 uppercase tracking-wider">
              Balanced Scorecard KPI Evaluation System
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Demo Mode Badge */}
        {isDemoMode && (
          <div
            title="Running in Demo Mode with local browser storage. Configured in src/firebase/config.ts"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60"
          >
            <Database className="h-3 w-3 animate-pulse text-amber-600" />
            <span>Demo Mode (Local Data)</span>
          </div>
        )}

        {/* Current Department Badge */}
        {selectedDepartment && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-xs"
            style={{
              borderColor: `${selectedDepartment.colour}40`,
              backgroundColor: `${selectedDepartment.colour}15`,
              color: selectedDepartment.colour,
            }}
          >
            <DepartmentIcon name={selectedDepartment.icon} className="h-3.5 w-3.5" />
            <span className="font-mono">{selectedDepartment.code}</span>
            <span className="hidden lg:inline truncate max-w-[140px]">{selectedDepartment.name}</span>
            {isSuperAdmin && (
              <button
                onClick={clearDepartment}
                title="Switch department"
                className="ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline text-[10px]"
              >
                Switch
              </button>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User info / Logout */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F3A6E] text-white text-xs font-bold">
              {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[130px]">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                {role === 'super_admin' ? 'Super Admin' : role?.replace('_', ' ')}
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
