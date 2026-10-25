import React, { useState, useEffect } from 'react';
import {
  Department,
  Employee,
  Evaluation,
  EvaluationItem,
  EvaluationPeriodType,
  BSCCategory,
} from '../types';
import { dataService } from '../data';
import { useAuth } from '../context/AuthContext';
import { calculateEvaluationScore, BSC_CATEGORY_CONFIG } from '../lib/scoring';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { useToast } from '../components/ui/Toast';
import {
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  Lock,
  Unlock,
  User,
  Calendar,
  Layers,
  ArrowLeft,
} from 'lucide-react';

interface EvaluationFormPageProps {
  department: Department;
  initialEmployee?: Employee | null;
  existingEvaluationId?: string | null;
  onBack: () => void;
  onEvaluationSaved: (evaluationId: string) => void;
}

export const EvaluationFormPage: React.FC<EvaluationFormPageProps> = ({
  department,
  initialEmployee,
  existingEvaluationId,
  onBack,
  onEvaluationSaved,
}) => {
  const { user, role, isSuperAdmin, isDeptHead } = useAuth();
  const { success, error: toastError, warning } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    initialEmployee?.employeeId || ''
  );
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    initialEmployee || null
  );

  // Period settings
  const [periodType, setPeriodType] = useState<EvaluationPeriodType>('quarterly');
  const [periodStart, setPeriodStart] = useState('2026-07-01');
  const [periodEnd, setPeriodEnd] = useState('2026-09-30');

  // Active Tab
  const [activeTab, setActiveTab] = useState<BSCCategory>('financial');

  // Items per category
  const [items, setItems] = useState<EvaluationItem[]>([]);
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [comments, setComments] = useState('');

  // Status & Lock
  const [status, setStatus] = useState<'draft' | 'submitted' | 'approved' | 'reopened'>('draft');
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  // Custom KPI Modal
  const [isAddCustomKpiOpen, setIsAddCustomKpiOpen] = useState(false);
  const [customKpiName, setCustomKpiName] = useState('');
  const [customKpiTarget, setCustomKpiTarget] = useState('');

  // Load employees and initial rubric
  useEffect(() => {
    async function loadInitial() {
      try {
        const emps = await dataService.getEmployees(isSuperAdmin ? 'ALL' : department.id);
        setEmployees(emps);

        if (existingEvaluationId) {
          const existing = await dataService.getEvaluation(existingEvaluationId);
          if (existing) {
            setSelectedEmployeeId(existing.employeeId);
            const emp = emps.find((e) => e.employeeId === existing.employeeId);
            if (emp) setSelectedEmployee(emp);
            setPeriodType(existing.periodType);
            setPeriodStart(existing.periodStart);
            setPeriodEnd(existing.periodEnd);
            setItems(existing.items);
            setStrengths(existing.strengths || '');
            setImprovements(existing.improvements || '');
            setComments(existing.comments || '');
            setStatus(existing.status);

            // Check if locked
            if ((existing.status === 'submitted' || existing.status === 'approved') && !isSuperAdmin) {
              setIsLocked(true);
            }
            return;
          }
        }

        // Build default items from department KPI Templates + Individual Performance
        const kpiTemplates = await dataService.getKPITemplates(department.id);
        const initialItems: EvaluationItem[] = [];

        // 1. Templates for Financial, Customer, Internal Process, Learning & Growth
        kpiTemplates.forEach((t) => {
          initialItems.push({
            id: 'item-' + Math.random().toString(36).substring(2, 7),
            bscCategory: t.bscCategory,
            kpiName: t.kpiName,
            target: `${t.target} ${t.unit}`,
            actual: '',
            rating: 3, // neutral baseline
            comment: '',
          });
        });

        // 2. Individual Performance Standard 4 Pillars
        const individualMetrics = [
          'Attendance & punctuality (reporting on time, low unplanned absenteeism)',
          'Competency & skills (clinical/operational mastery, error minimization)',
          'Behaviour & teamwork (patient care empathy, multidisciplinary collaboration)',
          'Initiative & self-development (CME attendance, continuous learning, problem solving)',
        ];

        individualMetrics.forEach((metric) => {
          initialItems.push({
            id: 'ind-' + Math.random().toString(36).substring(2, 7),
            bscCategory: 'individual_performance',
            kpiName: metric,
            target: 'Exemplary conduct (Rating 5 standard)',
            actual: '',
            rating: 4,
            comment: '',
          });
        });

        setItems(initialItems);
      } catch (err: any) {
        toastError(err.message || 'Error loading evaluation rubric');
      }
    }
    loadInitial();
  }, [department.id, existingEvaluationId, isSuperAdmin]);

  // When selectedEmployeeId changes
  const handleEmployeeChange = (empId: string) => {
    setSelectedEmployeeId(empId);
    const emp = employees.find((e) => e.employeeId === empId) || null;
    setSelectedEmployee(emp);
  };

  // Live Score Calculation
  const scoreResult = calculateEvaluationScore(items);

  // Update item field
  const handleUpdateItem = (
    id: string,
    field: 'actual' | 'rating' | 'comment',
    value: string | number
  ) => {
    if (isLocked) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Add custom KPI to current category
  const handleAddCustomKpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKpiName.trim()) return;

    const newItem: EvaluationItem = {
      id: 'custom-' + Date.now(),
      bscCategory: activeTab,
      kpiName: customKpiName.trim(),
      target: customKpiTarget.trim() || 'Standard target',
      actual: '',
      rating: 3,
      comment: '',
    };

    setItems((prev) => [...prev, newItem]);
    setIsAddCustomKpiOpen(false);
    setCustomKpiName('');
    setCustomKpiTarget('');
    success(`Added KPI to ${BSC_CATEGORY_CONFIG[activeTab].label}`);
  };

  const handleRemoveItem = (id: string) => {
    if (isLocked) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Save as Draft
  const handleSaveDraft = async () => {
    if (!selectedEmployee) {
      toastError('Please select an employee first.');
      return;
    }
    setIsSubmitting(true);
    try {
      const evalId = existingEvaluationId || `eval-${selectedEmployee.employeeId}-${Date.now()}`;
      const payload: Evaluation = {
        id: evalId,
        employeeId: selectedEmployee.employeeId,
        employeeName: selectedEmployee.name,
        designation: selectedEmployee.designation,
        departmentId: selectedEmployee.departmentId,
        evaluatorId: user?.uid || 'evaluator',
        evaluatorName: user?.name || 'Evaluator',
        evaluatorRole: role || 'evaluator',
        periodType,
        periodStart,
        periodEnd,
        status: 'draft',
        items,
        categoryScores: scoreResult.categoryScores,
        finalScore: scoreResult.finalScore,
        grade: scoreResult.grade,
        strengths,
        improvements,
        comments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dataService.saveEvaluation(payload);
      success('Evaluation saved as Draft');
      onEvaluationSaved(evalId);
    } catch (err: any) {
      toastError(err.message || 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Evaluation
  const handleSubmitFinal = async () => {
    if (!selectedEmployee) {
      toastError('Please select an employee first.');
      return;
    }

    // Validation: Ensure all items have a rating
    const hasUnrated = items.some((item) => !item.rating || item.rating < 1 || item.rating > 5);
    if (hasUnrated) {
      toastError('All KPI items must have a rating between 1 and 5 before submission.');
      setConfirmSubmitOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const evalId = existingEvaluationId || `eval-${selectedEmployee.employeeId}-${Date.now()}`;
      const payload: Evaluation = {
        id: evalId,
        employeeId: selectedEmployee.employeeId,
        employeeName: selectedEmployee.name,
        designation: selectedEmployee.designation,
        departmentId: selectedEmployee.departmentId,
        evaluatorId: user?.uid || 'evaluator',
        evaluatorName: user?.name || 'Evaluator',
        evaluatorRole: role || 'evaluator',
        periodType,
        periodStart,
        periodEnd,
        status: 'submitted',
        items,
        categoryScores: scoreResult.categoryScores,
        finalScore: scoreResult.finalScore,
        grade: scoreResult.grade,
        strengths,
        improvements,
        comments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dataService.saveEvaluation(payload);
      success(`Evaluation submitted successfully! Final Score: ${scoreResult.finalScore}/100`);
      setConfirmSubmitOpen(false);
      onEvaluationSaved(evalId);
    } catch (err: any) {
      toastError(err.message || 'Failed to submit evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reopen by Super Admin
  const handleReopen = async () => {
    if (!existingEvaluationId) return;
    try {
      await dataService.reopenEvaluation(existingEvaluationId, user?.name || 'Super Admin');
      setStatus('reopened');
      setIsLocked(false);
      success('Evaluation unlocked and reopened for revision.');
    } catch (err: any) {
      toastError(err.message || 'Failed to reopen evaluation');
    }
  };

  const bscTabs: BSCCategory[] = [
    'financial',
    'customer',
    'internal_process',
    'learning_growth',
    'individual_performance',
  ];

  const currentCategoryConfig = BSC_CATEGORY_CONFIG[activeTab];
  const currentCategoryItems = items.filter((i) => i.bscCategory === activeTab);

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Employee BSC Evaluation
              </h1>
              <Badge
                variant={
                  status === 'approved'
                    ? 'success'
                    : status === 'submitted'
                    ? 'teal'
                    : status === 'reopened'
                    ? 'warning'
                    : 'secondary'
                }
                size="sm"
              >
                {status.toUpperCase()}
              </Badge>
              {isLocked && (
                <span className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Department: {department.name} ({department.code}) · Evaluator: {user?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLocked && isSuperAdmin && (
            <Button onClick={handleReopen} variant="outline" size="sm">
              <Unlock className="h-4 w-4 mr-1 text-amber-600" />
              <span>Reopen Evaluation</span>
            </Button>
          )}

          {!isLocked && (
            <>
              <Button
                onClick={handleSaveDraft}
                variant="outline"
                size="sm"
                isLoading={isSubmitting}
              >
                <Save className="h-4 w-4 mr-1" />
                <span>Save Draft</span>
              </Button>
              <Button
                onClick={() => setConfirmSubmitOpen(true)}
                variant="teal"
                size="sm"
                isLoading={isSubmitting}
              >
                <Send className="h-4 w-4 mr-1" />
                <span>Submit Evaluation</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Employee & Period Selection Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Employee Select */}
        <div className="md:col-span-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Target Employee
          </label>
          <select
            disabled={isLocked || !!initialEmployee}
            value={selectedEmployeeId}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1A9BB0]"
          >
            <option value="">-- Choose Staff Member --</option>
            {employees.map((emp) => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.employeeId} - {emp.name} ({emp.designation})
              </option>
            ))}
          </select>

          {selectedEmployee && (
            <div className="pt-2 text-xs text-slate-500 space-y-0.5">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {selectedEmployee.name}
              </div>
              <div>{selectedEmployee.designation}</div>
              <div className="font-mono text-[11px] text-teal-600 dark:text-teal-400">
                {selectedEmployee.email}
              </div>
            </div>
          )}
        </div>

        {/* Period Type */}
        <div className="md:col-span-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Evaluation Period
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(['monthly', 'quarterly', 'annual'] as EvaluationPeriodType[]).map((p) => (
              <button
                key={p}
                type="button"
                disabled={isLocked}
                onClick={() => setPeriodType(p)}
                className={`py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                  periodType === p
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div>
              <span className="text-[10px] text-slate-400">Start Date</span>
              <input
                type="date"
                disabled={isLocked}
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full rounded border border-slate-200 dark:border-slate-700 p-1 text-xs bg-transparent"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">End Date</span>
              <input
                type="date"
                disabled={isLocked}
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full rounded border border-slate-200 dark:border-slate-700 p-1 text-xs bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Live Score Quick Overview */}
        <div className="md:col-span-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Composite Running Score
            </span>
            <Badge
              variant="outline"
              className={scoreResult.gradeBand.badgeClass}
              size="sm"
            >
              {scoreResult.grade}
            </Badge>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#1F3A6E] dark:text-white tabular-nums">
              {scoreResult.finalScore}
            </span>
            <span className="text-sm font-bold text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {scoreResult.gradeBand.description}
          </p>
        </div>
      </div>

      {/* Main Scoring Workspace: 5 BSC Tabs + Sticky Live Summary Calculator Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: 5 Tabs and Items (3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tab Navigation Buttons in BSC Brand Colors */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto no-scrollbar">
            {bscTabs.map((catKey) => {
              const conf = BSC_CATEGORY_CONFIG[catKey];
              const isActive = activeTab === catKey;
              const catScore = scoreResult.categoryScores[catKey];

              return (
                <button
                  key={catKey}
                  onClick={() => setActiveTab(catKey)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  style={{
                    color: isActive ? conf.colour : undefined,
                    borderBottom: isActive ? `3px solid ${conf.colour}` : '3px solid transparent',
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: conf.colour }}
                  />
                  <span>{conf.label}</span>
                  <span className="text-[10px] opacity-75 font-mono">
                    ({conf.weight}%)
                  </span>
                  {catScore && (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                      {catScore.score} pts
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Category Header Card */}
          <div
            className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            style={{
              backgroundColor: currentCategoryConfig.lightBg,
              borderColor: `${currentCategoryConfig.colour}40`,
            }}
          >
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className="font-bold text-base"
                  style={{ color: currentCategoryConfig.colour }}
                >
                  {currentCategoryConfig.label} Parameter
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200">
                  Weight: {currentCategoryConfig.weight}% of Total Score
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Focus Area: {currentCategoryConfig.focus}
              </p>
            </div>

            {!isLocked && activeTab !== 'individual_performance' && (
              <Button
                onClick={() => setIsAddCustomKpiOpen(true)}
                variant="outline"
                size="sm"
                className="bg-white/80 dark:bg-slate-900/80"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Add Custom KPI</span>
              </Button>
            )}
          </div>

          {/* KPI Items List for Active Tab */}
          <div className="space-y-3">
            {currentCategoryItems.map((item, index) => (
              <Card key={item.id} className="p-4 space-y-3 border-slate-200 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{index + 1}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {item.kpiName}
                      </h4>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      Target: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.target}</span>
                    </div>
                  </div>

                  {!isLocked && activeTab !== 'individual_performance' && (
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove KPI from evaluation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Rating 1-5 Selectors + Actual Achievement Field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {/* Actual Achievement Input */}
                  <Input
                    label="Actual Performance Achieved"
                    disabled={isLocked}
                    value={item.actual}
                    onChange={(e) => handleUpdateItem(item.id, 'actual', e.target.value)}
                    placeholder="e.g. 16.5% reduction, 99.8% on-time"
                  />

                  {/* 1 to 5 Rating Radio / Buttons */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Performance Rating (1 – 5)
                      </label>
                      <span className="text-xs font-bold" style={{ color: currentCategoryConfig.colour }}>
                        Rating: {item.rating} / 5
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => {
                        const isSelected = item.rating === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            disabled={isLocked}
                            onClick={() => handleUpdateItem(item.id, 'rating', val)}
                            className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'text-white shadow-xs scale-105'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                            style={{
                              backgroundColor: isSelected ? currentCategoryConfig.colour : undefined,
                            }}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Evaluator Notes / Evidence Comment */}
                <div className="pt-1">
                  <input
                    type="text"
                    disabled={isLocked}
                    value={item.comment || ''}
                    onChange={(e) => handleUpdateItem(item.id, 'comment', e.target.value)}
                    placeholder="Optional evaluator observation or evidence reference..."
                    className="w-full text-xs text-slate-600 dark:text-slate-400 placeholder:text-slate-400 bg-transparent border-b border-dashed border-slate-200 dark:border-slate-800 pb-1 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </Card>
            ))}

            {currentCategoryItems.length === 0 && (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                <p className="text-xs text-slate-500">
                  No KPI metrics in this category. Click "Add Custom KPI" to add one.
                </p>
              </div>
            )}
          </div>

          {/* Qualitative Notes: Strengths, Improvements, Comments */}
          <Card className="mt-6 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Qualitative Assessment & Feedback</CardTitle>
              <CardDescription>
                Detailed observations for employee growth and appraisal records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Key Strengths & Notable Contributions
                </label>
                <textarea
                  rows={2}
                  disabled={isLocked}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="e.g. Demonstrated exceptional clinical accuracy and leadership during night ward audits..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1A9BB0] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Targeted Areas for Improvement & Development
                </label>
                <textarea
                  rows={2}
                  disabled={isLocked}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="e.g. Recommended to complete remaining CPD hours and streamline morning rush dispensing..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1A9BB0] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Overall Evaluator Closing Remarks
                </label>
                <textarea
                  rows={2}
                  disabled={isLocked}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Final evaluation remarks, merit increments, or promotion recommendation notes..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1A9BB0] focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Sticky Summary Calculator Panel (1 column) */}
        <div className="lg:col-span-1 sticky top-20 space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm">Live Scorecard Calculator</CardTitle>
              <CardDescription className="text-xs">
                Score = (Avg Rating ÷ 5) × Weight
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5">
              {/* Category Breakdown list */}
              {bscTabs.map((catKey) => {
                const conf = BSC_CATEGORY_CONFIG[catKey];
                const catScore = scoreResult.categoryScores[catKey];

                return (
                  <div key={catKey} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: conf.colour }}
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {conf.label}
                        </span>
                      </div>
                      <div className="font-mono text-right shrink-0">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {catScore.score}
                        </span>
                        <span className="text-[10px] text-slate-400">/{conf.weight}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(catScore.score / conf.weight) * 100}%`,
                          backgroundColor: conf.colour,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Total Final Score Big Gauge */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Total Final Score
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-extrabold text-[#1F3A6E] dark:text-teal-400 tabular-nums">
                    {scoreResult.finalScore}
                  </span>
                  <span className="text-base font-bold text-slate-400">/ 100</span>
                </div>

                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${scoreResult.gradeBand.badgeClass}`}
                >
                  {scoreResult.grade}
                </div>
              </div>

              {/* Submit Buttons in sticky panel */}
              {!isLocked && (
                <div className="pt-2 space-y-2">
                  <Button
                    onClick={() => setConfirmSubmitOpen(true)}
                    variant="teal"
                    className="w-full h-10 font-semibold"
                  >
                    <Send className="h-4 w-4 mr-1.5" />
                    <span>Submit Evaluation</span>
                  </Button>

                  <Button
                    onClick={handleSaveDraft}
                    variant="outline"
                    className="w-full text-xs"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    <span>Save as Draft</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Submit Dialog */}
      <Dialog
        open={confirmSubmitOpen}
        onOpenChange={setConfirmSubmitOpen}
        title="Confirm Evaluation Submission"
        description="Verify performance score before locking"
      >
        <div className="space-y-4 pt-2 text-sm text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Employee:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedEmployee?.name} ({selectedEmployee?.employeeId})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Calculated Final Score:</span>
              <span className="font-extrabold text-[#1F3A6E] dark:text-teal-400">
                {scoreResult.finalScore} / 100 ({scoreResult.grade})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Period:</span>
              <span className="capitalize">
                {periodType} ({periodStart} to {periodEnd})
              </span>
            </div>
          </div>

          <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-900">
            Note: Once submitted, evaluations are locked from editing by evaluators and must be reviewed/approved by the Department Head.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmSubmitOpen(false)}
            >
              Back to Edit
            </Button>
            <Button
              type="button"
              variant="teal"
              isLoading={isSubmitting}
              onClick={handleSubmitFinal}
            >
              Confirm & Submit
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Custom KPI Dialog */}
      <Dialog
        open={isAddCustomKpiOpen}
        onOpenChange={setIsAddCustomKpiOpen}
        title={`Add Custom KPI to ${currentCategoryConfig.label}`}
        description="Add a specific target metric for this evaluation"
      >
        <form onSubmit={handleAddCustomKpi} className="space-y-4 pt-2">
          <Input
            label="KPI Name / Description"
            required
            value={customKpiName}
            onChange={(e) => setCustomKpiName(e.target.value)}
            placeholder="e.g. Specialized ICU protocol adherence"
          />
          <Input
            label="Target Goal"
            value={customKpiTarget}
            onChange={(e) => setCustomKpiTarget(e.target.value)}
            placeholder="e.g. 100% adherence, zero deviations"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddCustomKpiOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal">
              Add KPI
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
