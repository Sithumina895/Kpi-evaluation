import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Target,
  FileCheck2,
  Users2,
  BarChart3,
  UserCog,
  Settings,
  History,
  Building,
  ChevronRight,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';

export type NavTabId =
  | 'dashboard'
  | 'objectives'
  | 'evaluate'
  | 'employees'
  | 'reports'
  | 'users'
  | 'settings'
  | 'audit';

interface SidebarProps {
  currentTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const { role, isSuperAdmin, isDeptHead, canEvaluate, clearDepartment, selectedDepartment } = useAuth();

  const navItems: {
    id: NavTabId;
    label: string;
    icon: React.ReactNode;
    visible: boolean;
    badge?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Department Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      visible: true,
    },
    {
      id: 'objectives',
      label: 'Strategic Objectives & KPIs',
      icon: <Target className="h-4 w-4" />,
      visible: true,
    },
    {
      id: 'evaluate',
      label: 'Evaluate Employee',
      icon: <FileCheck2 className="h-4 w-4" />,
      visible: canEvaluate,
      badge: 'Action',
    },
    {
      id: 'employees',
      label: 'Employees & Staff',
      icon: <Users2 className="h-4 w-4" />,
      visible: true,
    },
    {
      id: 'reports',
      label: 'Reports & Rankings',
      icon: <BarChart3 className="h-4 w-4" />,
      visible: true,
    },
    {
      id: 'users',
      label: 'User Accounts & RBAC',
      icon: <UserCog className="h-4 w-4" />,
      visible: isSuperAdmin,
      badge: 'Admin',
    },
    {
      id: 'settings',
      label: 'System & Grade Bands',
      icon: <Settings className="h-4 w-4" />,
      visible: isSuperAdmin,
    },
    {
      id: 'audit',
      label: 'Security Audit Log',
      icon: <History className="h-4 w-4" />,
      visible: isSuperAdmin || isDeptHead,
    },
  ];

  const handleSelect = (id: NavTabId) => {
    onSelectTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Department Quick Banner */}
          {selectedDepartment && (
            <div
              className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <span>Active Department</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {selectedDepartment.code}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {selectedDepartment.name}
              </p>
              <button
                onClick={clearDepartment}
                className="mt-2 w-full text-left text-[11px] text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium flex items-center justify-between cursor-pointer"
              >
                <span>Switch Department</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems
              .filter((item) => item.visible)
              .map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#1F3A6E] text-white shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-teal-300' : 'text-slate-400 dark:text-slate-500'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span>Nawaloka Hospitals</span>
            <span className="font-mono">v2.5</span>
          </div>
          <div>Balanced Scorecard Framework</div>
        </div>
      </aside>
    </>
  );
};
