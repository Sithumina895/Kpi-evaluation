import React, { useState, useEffect } from 'react';
import { Department, Evaluation, GradeBand } from '../types';
import { dataService } from '../data';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Download,
  Filter,
  FileSpreadsheet,
  Award,
  TrendingUp,
  BarChart2,
  Calendar,
  Building,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ReportsPageProps {
  currentDepartment: Department;
  onViewEvaluation: (evalId: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  currentDepartment,
  onViewEvaluation,
}) => {
  const { isSuperAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [gradeBands, setGradeBands] = useState<GradeBand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(
    isSuperAdmin ? 'ALL' : currentDepartment.id
  );
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<string>('ALL');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'score' | 'name' | 'date'>('score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [depts, evals, bands] = await Promise.all([
          dataService.getDepartments(),
          dataService.getEvaluations('ALL'),
          dataService.getGradeBands(),
        ]);
        setDepartments(depts);
        setEvaluations(evals);
        setGradeBands(bands);
      } catch (err: any) {
        toastError(err.message || 'Error loading report data');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Filter evaluations
  const filteredEvals = evaluations.filter((ev) => {
    // Dept filter
    if (selectedDeptFilter !== 'ALL' && ev.departmentId !== selectedDeptFilter) {
      return false;
    }
    // Period filter
    if (selectedPeriodFilter !== 'ALL' && ev.periodType !== selectedPeriodFilter) {
      return false;
    }
    // Grade filter
    if (selectedGradeFilter !== 'ALL' && ev.grade !== selectedGradeFilter) {
      return false;
    }
    return true;
  });

  // Sort
  const sortedEvals = [...filteredEvals].sort((a, b) => {
    if (sortField === 'score') {
      return sortAsc ? a.finalScore - b.finalScore : b.finalScore - a.finalScore;
    }
    if (sortField === 'name') {
      return sortAsc
        ? a.employeeName.localeCompare(b.employeeName)
        : b.employeeName.localeCompare(a.employeeName);
    }
    return sortAsc
      ? a.createdAt.localeCompare(b.createdAt)
      : b.createdAt.localeCompare(a.createdAt);
  });

  // Department Comparison Chart Data (for Super Admin)
  const deptComparisonData = departments
    .filter((d) => d.active)
    .map((dept) => {
      const deptEvals = evaluations.filter((ev) => ev.departmentId === dept.id);
      const avg =
        deptEvals.length > 0
          ? Math.round(
              (deptEvals.reduce((acc, curr) => acc + curr.finalScore, 0) / deptEvals.length) * 10
            ) / 10
          : 0;
      return {
        code: dept.code,
        name: dept.name,
        avgScore: avg,
        evalCount: deptEvals.length,
        colour: dept.colour,
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore);

  // CSV Export
  const handleExportCSV = () => {
    if (sortedEvals.length === 0) {
      toastError('No data to export.');
      return;
    }

    const csvData = sortedEvals.map((ev, index) => ({
      Rank: index + 1,
      'Employee ID': ev.employeeId,
      'Employee Name': ev.employeeName,
      Designation: ev.designation,
      Department: ev.departmentId.toUpperCase(),
      Period: `${ev.periodType} (${ev.periodStart} - ${ev.periodEnd})`,
      'Final Score / 100': ev.finalScore,
      Grade: ev.grade,
      Status: ev.status,
      Evaluator: ev.evaluatorName,
      'Financial Score': ev.categoryScores?.financial?.score || 0,
      'Customer Score': ev.categoryScores?.customer?.score || 0,
      'Internal Process Score': ev.categoryScores?.internal_process?.score || 0,
      'Learning & Growth Score': ev.categoryScores?.learning_growth?.score || 0,
      'Individual Score': ev.categoryScores?.individual_performance?.score || 0,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Nawaloka_KPI_Rankings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('CSV report downloaded successfully');
  };

  // PDF Export
  const handleExportPDF = () => {
    if (sortedEvals.length === 0) {
      toastError('No data to export.');
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(31, 58, 110);
    doc.text('NAWALOKA HOSPITALS PLC - KPI EVALUATION RANKINGS REPORT', 14, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} · Filter: ${
        selectedDeptFilter === 'ALL' ? 'Hospital-Wide' : selectedDeptFilter.toUpperCase()
      }`,
      14,
      22
    );

    const tableRows = sortedEvals.map((ev, i) => [
      i + 1,
      ev.employeeId,
      ev.employeeName,
      ev.designation,
      ev.departmentId.toUpperCase(),
      `${ev.periodType}`,
      `${ev.finalScore}/100`,
      ev.grade,
      ev.status.toUpperCase(),
    ]);

    autoTable(doc, {
      head: [['Rank', 'ID', 'Name', 'Designation', 'Dept', 'Period', 'Score', 'Grade', 'Status']],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [31, 58, 110], textColor: 255 },
      styles: { fontSize: 8 },
    });

    doc.save(`Nawaloka_KPI_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    success('PDF report exported');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Performance Reports & Rankings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comparative performance analytics and Balanced Scorecard ranking tables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <FileSpreadsheet className="h-4 w-4 mr-1 text-emerald-600" />
            <span>Export CSV</span>
          </Button>

          <Button onClick={handleExportPDF} variant="primary" size="sm">
            <Download className="h-4 w-4 mr-1" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Super Admin: Hospital-Wide Department Comparison Chart */}
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-teal-600" />
              <span>Department Composite Score Comparison</span>
            </CardTitle>
            <CardDescription>
              Average Balanced Scorecard scores across hospital clinical & non-clinical departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="code"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis domain={[50, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <RechartsTooltip
                    formatter={(val: any, _name, item: any) => [
                      `${val} / 100 (${item.payload.evalCount} evals)`,
                      item.payload.name,
                    ]}
                  />
                  <Bar dataKey="avgScore" radius={[6, 6, 0, 0]}>
                    {deptComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.colour} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 items-end">
          {/* Department Filter (super admin can see all; dept head sees own) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Department
            </label>
            <select
              disabled={!isSuperAdmin}
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              {isSuperAdmin && <option value="ALL">All Departments (Hospital-Wide)</option>}
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Period Type
            </label>
            <select
              value={selectedPeriodFilter}
              onChange={(e) => setSelectedPeriodFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Periods</option>
              <option value="quarterly">Quarterly</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          {/* Grade Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Performance Grade
            </label>
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Grades</option>
              <option value="Outstanding">Outstanding (90–100)</option>
              <option value="Exceeds Expectations">Exceeds Expectations (80–89)</option>
              <option value="Meets Expectations">Meets Expectations (70–79)</option>
              <option value="Needs Improvement">Needs Improvement (60–69)</option>
              <option value="Unsatisfactory">Unsatisfactory (&lt;60)</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (sortField === 'score') setSortAsc(!sortAsc);
                else {
                  setSortField('score');
                  setSortAsc(false);
                }
              }}
              className="w-full text-xs"
            >
              <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
              <span>Sort by Score {sortField === 'score' ? (sortAsc ? '↑' : '↓') : ''}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Rankings Table */}
      <Card>
        <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Employee Performance Rankings</CardTitle>
            <CardDescription className="text-xs">
              Showing {sortedEvals.length} evaluated staff records
            </CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-3 text-center">Rank</th>
                <th className="p-3">Employee</th>
                <th className="p-3">Dept</th>
                <th className="p-3">Period</th>
                <th className="p-3 text-center">Score</th>
                <th className="p-3 text-center">Grade</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedEvals.map((ev, index) => {
                const isTopThree = index < 3;
                return (
                  <tr
                    key={ev.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3 text-center font-bold">
                      {isTopThree ? (
                        <span
                          className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-extrabold ${
                            index === 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : index === 1
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {index + 1}
                        </span>
                      ) : (
                        <span className="font-mono text-slate-400">{index + 1}</span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {ev.employeeName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {ev.designation} · <span className="font-mono">{ev.employeeId}</span>
                      </div>
                    </td>

                    <td className="p-3 font-mono font-semibold uppercase text-slate-700 dark:text-slate-300">
                      {ev.departmentId}
                    </td>

                    <td className="p-3 capitalize text-slate-600 dark:text-slate-400">
                      {ev.periodType}
                    </td>

                    <td className="p-3 text-center font-mono text-sm font-extrabold text-[#1F3A6E] dark:text-teal-400">
                      {ev.finalScore}
                    </td>

                    <td className="p-3 text-center">
                      <Badge variant="teal" size="sm">
                        {ev.grade}
                      </Badge>
                    </td>

                    <td className="p-3 capitalize">
                      <Badge
                        variant={
                          ev.status === 'approved'
                            ? 'success'
                            : ev.status === 'submitted'
                            ? 'teal'
                            : 'secondary'
                        }
                        size="sm"
                      >
                        {ev.status}
                      </Badge>
                    </td>

                    <td className="p-3 text-right">
                      <Button
                        onClick={() => onViewEvaluation(ev.id)}
                        variant="ghost"
                        size="sm"
                        className="text-teal-600 hover:text-teal-700"
                      >
                        View Report
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {sortedEvals.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No evaluations match the current filter selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
