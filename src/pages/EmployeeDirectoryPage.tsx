import React, { useState, useEffect } from 'react';
import { Department, Employee, Evaluation } from '../types';
import { dataService } from '../data';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Sheet } from '../components/ui/Sheet';
import { useToast } from '../components/ui/Toast';
import {
  Search,
  UserPlus,
  User,
  Mail,
  Calendar,
  Briefcase,
  FileCheck2,
  CheckCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface EmployeeDirectoryPageProps {
  department: Department;
  onSelectEmployeeForEval: (employee: Employee) => void;
  onViewEvaluation: (evaluationId: string) => void;
  onGoToEmployeeManagement: () => void;
}

export const EmployeeDirectoryPage: React.FC<EmployeeDirectoryPageProps> = ({
  department,
  onSelectEmployeeForEval,
  onViewEvaluation,
  onGoToEmployeeManagement,
}) => {
  const { canEdit, canEvaluate, isSuperAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [emps, evals] = await Promise.all([
        dataService.getEmployees(isSuperAdmin ? 'ALL' : department.id),
        dataService.getEvaluations(isSuperAdmin ? 'ALL' : department.id),
      ]);
      setEmployees(emps);
      setEvaluations(evals);
    } catch (err: any) {
      toastError(err.message || 'Error loading employee records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [department.id, isSuperAdmin]);

  // Live filter / autocomplete by ID or name
  const filteredEmployees = employees.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      e.employeeId.toLowerCase().includes(q) ||
      e.name.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q)
    );
  });

  const getEmployeeEvaluations = (empId: string) => {
    return evaluations.filter(
      (ev) => ev.employeeId.toUpperCase() === empId.toUpperCase()
    );
  };

  const handleOpenProfile = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsProfileOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Employee Directory
            </h1>
            <Badge variant="teal" size="sm">
              {employees.length} Staff
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search staff by unique Employee ID or name, review historic evaluations, and launch new BSC assessments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button onClick={onGoToEmployeeManagement} variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-1" />
              <span>Manage & Import Staff</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search Input with Autocomplete hints */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Employee ID (e.g. NH-CD5-001) or staff name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1A9BB0]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Employee List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const empEvals = getEmployeeEvaluations(emp.employeeId);
          const latestEval = empEvals[empEvals.length - 1];

          return (
            <div
              key={emp.employeeId}
              onClick={() => handleOpenProfile(emp)}
              className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-300/50 dark:border-slate-700">
                      {emp.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate max-w-[170px] mt-0.5">
                        {emp.designation}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {emp.employeeId}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>Joined: {emp.joinDate}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Evaluation Status Tag */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                {latestEval ? (
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#1F3A6E] dark:text-teal-400 font-mono">
                      {latestEval.finalScore} / 100
                    </span>
                    <Badge variant="teal" size="sm">
                      {latestEval.grade}
                    </Badge>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No evaluations yet</span>
                )}

                <span className="text-teal-600 dark:text-teal-400 font-medium text-[11px] flex items-center gap-0.5">
                  View Profile <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}

        {filteredEmployees.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
            <User className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No employees found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No staff records match "{searchQuery}".
            </p>
          </div>
        )}
      </div>

      {/* Employee Profile Slide-over / Sheet */}
      <Sheet
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        title="Employee Performance Profile"
        description="Comprehensive Balanced Scorecard review history"
      >
        {selectedEmployee && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1F3A6E] text-white font-extrabold text-lg shadow-sm">
                {selectedEmployee.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                    {selectedEmployee.employeeId}
                  </span>
                  <Badge variant={selectedEmployee.active ? 'success' : 'danger'} size="sm">
                    {selectedEmployee.active ? 'Active' : 'Deactivated'}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate mt-0.5">
                  {selectedEmployee.name}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {selectedEmployee.designation}
                </p>
              </div>
            </div>

            {/* Quick Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Department
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200 uppercase font-mono mt-0.5 block">
                  {selectedEmployee.departmentId}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Joined Nawaloka
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {selectedEmployee.joinDate}
                </span>
              </div>
            </div>

            {/* CTA: Evaluate This Employee */}
            {canEvaluate && (
              <Button
                onClick={() => {
                  setIsProfileOpen(false);
                  onSelectEmployeeForEval(selectedEmployee);
                }}
                variant="teal"
                className="w-full h-10 shadow-sm"
              >
                <FileCheck2 className="h-4 w-4 mr-1.5" />
                <span>Evaluate {selectedEmployee.name.split(' ')[0]}</span>
              </Button>
            )}

            {/* Evaluation History Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider">
                  Evaluation History ({getEmployeeEvaluations(selectedEmployee.employeeId).length})
                </h4>
              </div>

              {getEmployeeEvaluations(selectedEmployee.employeeId).length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl dark:border-slate-800">
                  No evaluations recorded yet for this staff member.
                </div>
              ) : (
                <div className="space-y-3">
                  {getEmployeeEvaluations(selectedEmployee.employeeId).map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => {
                        setIsProfileOpen(false);
                        onViewEvaluation(ev.id);
                      }}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/50 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                            {ev.periodType} ({ev.periodStart.slice(0, 7)})
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-medium capitalize bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {ev.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400">
                          <span>{ev.finalScore}/100</span>
                          <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Evaluator: {ev.evaluatorName}</span>
                        <Badge variant="teal" size="sm">
                          {ev.grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
};
