import React, { useState, useEffect } from 'react';
import { Department } from '../types';
import { dataService } from '../data';
import { useAuth } from '../context/AuthContext';
import { DepartmentIcon } from '../components/common/DepartmentIcon';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Info,
  X,
  UserCheck,
  Search,
  Building2,
  Stethoscope,
  Briefcase,
} from 'lucide-react';

interface DepartmentSelectionPageProps {
  onSelectDepartment: (dept: Department) => void;
  onGoToCreateAdmin: () => void;
  onQuickLogin?: (email: string, dept: Department) => void;
}

export const DepartmentSelectionPage: React.FC<DepartmentSelectionPageProps> = ({
  onSelectDepartment,
  onGoToCreateAdmin,
  onQuickLogin,
}) => {
  const { isDemoMode } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hasSuperAdmin, setHasSuperAdmin] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDemoCredentials, setShowDemoCredentials] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const depts = await dataService.getDepartments();
        setDepartments(depts);
        const adminExists = await dataService.checkSuperAdminExists();
        setHasSuperAdmin(adminExists);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filteredDepts = departments.filter(
    (d) =>
      d.active &&
      (d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const clinicalDepts = filteredDepts.filter((d) => d.type === 'clinical');
  const nonClinicalDepts = filteredDepts.filter((d) => d.type === 'non_clinical');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hospital Header Banner */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 text-xs font-semibold tracking-wide border border-teal-500/20">
            <span className="h-2 w-2 rounded-full bg-teal-500"></span>
            NAWALOKA HOSPITALS PLC · COLOMBO, SRI LANKA
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1F3A6E] dark:text-white leading-tight">
            Balanced Scorecard KPI Evaluation System
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Aligning healthcare excellence with organizational strategy. Select your hospital department to access the evaluation portal.
          </p>

          {/* Super Admin First Run Notice if no admin */}
          {!hasSuperAdmin && (
            <div className="max-w-xl mx-auto p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 text-left flex items-start gap-3">
              <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <h4 className="font-bold text-amber-900 dark:text-amber-200">
                  Initial Setup Required: No Super Administrator Found
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                  This system requires a master administrator before department operations can be managed.
                </p>
                <Button
                  onClick={onGoToCreateAdmin}
                  variant="primary"
                  size="sm"
                  className="mt-3 bg-amber-600 hover:bg-amber-700"
                >
                  Create Super Administrator
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Demo Mode Quick Credentials Helper Box (dismissible, hidden when real Firebase is connected) */}
        {isDemoMode && showDemoCredentials && (
          <div className="relative p-5 rounded-2xl border border-teal-200 dark:border-teal-800/60 bg-gradient-to-r from-teal-50/70 via-blue-50/50 to-amber-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 shadow-sm">
            <button
              onClick={() => setShowDemoCredentials(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              title="Dismiss helper"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-teal-600 text-white shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#1F3A6E] dark:text-white">
                    Demo Mode Active · 1-Click Fast Access Test Accounts
                  </h3>
                  <Badge variant="teal" size="sm">Pre-seeded</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Select a test account below to automatically log in and explore the complete workflow with pre-configured KPIs and sample evaluations:
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <Button
                    onClick={() => {
                      const cd5 = departments.find((d) => d.id === 'cd5');
                      if (cd5 && onQuickLogin) {
                        onQuickLogin('pharmacy.head@nawaloka.lk', cd5);
                      }
                    }}
                    variant="teal"
                    size="sm"
                    className="cursor-pointer"
                  >
                    <UserCheck className="h-3.5 w-3.5 mr-1" />
                    <span>Dept Head (CD5 Pharmacy)</span>
                  </Button>

                  <Button
                    onClick={() => {
                      // Super Admin can enter any department
                      const cd5 = departments.find((d) => d.id === 'cd5') || departments[0];
                      if (cd5 && onQuickLogin) {
                        onQuickLogin('admin@nawaloka.lk', cd5);
                      }
                    }}
                    variant="primary"
                    size="sm"
                    className="cursor-pointer"
                  >
                    <UserCheck className="h-3.5 w-3.5 mr-1" />
                    <span>Super Admin (Hospital-wide)</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search departments by code or name (e.g. CD5, Pharmacy, OT, Finance)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1A9BB0]"
            />
          </div>
        </div>

        {/* Section 1: Clinical Departments (8) in Teal (#1A9BB0) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b-2 border-teal-500/20 pb-3">
            <div className="p-2 rounded-lg bg-[#1A9BB0]/10 text-[#1A9BB0]">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1A9BB0]">
                  Clinical Departments ({clinicalDepts.length})
                </h2>
                <Badge variant="teal" size="sm">Teal Palette</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient care, diagnostics, surgical procedures, and clinical operations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {clinicalDepts.map((dept) => (
              <div
                key={dept.id}
                onClick={() => onSelectDepartment(dept)}
                className="group relative rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                style={{
                  borderTop: `4px solid ${dept.colour}`,
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-xs font-bold px-2.5 py-1 rounded-md"
                      style={{
                        backgroundColor: `${dept.colour}15`,
                        color: dept.colour,
                      }}
                    >
                      {dept.code}
                    </span>
                    <div
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: `${dept.colour}10`,
                        color: dept.colour,
                      }}
                    >
                      <DepartmentIcon name={dept.icon} className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#1A9BB0] transition-colors leading-snug">
                    {dept.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-[#1A9BB0] transition-colors">
                  <span>Enter Portal</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Non-Clinical Departments (9) in Orange (#E8821E) */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center gap-3 border-b-2 border-amber-500/20 pb-3">
            <div className="p-2 rounded-lg bg-[#E8821E]/10 text-[#E8821E]">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#E8821E]">
                  Non-Clinical Departments ({nonClinicalDepts.length})
                </h2>
                <Badge variant="orange" size="sm">Orange Palette</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Governance, corporate finance, infrastructure, information systems, and human resources
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nonClinicalDepts.map((dept) => (
              <div
                key={dept.id}
                onClick={() => onSelectDepartment(dept)}
                className="group relative rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                style={{
                  borderTop: `4px solid ${dept.colour}`,
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-xs font-bold px-2.5 py-1 rounded-md"
                      style={{
                        backgroundColor: `${dept.colour}15`,
                        color: dept.colour,
                      }}
                    >
                      {dept.code}
                    </span>
                    <div
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: `${dept.colour}10`,
                        color: dept.colour,
                      }}
                    >
                      <DepartmentIcon name={dept.icon} className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#E8821E] transition-colors leading-snug">
                    {dept.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-[#E8821E] transition-colors">
                  <span>Enter Portal</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
