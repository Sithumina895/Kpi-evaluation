import React, { useState, useEffect, useRef } from 'react';
import { Evaluation, Department } from '../types';
import { dataService } from '../data';
import { useAuth } from '../context/AuthContext';
import { BSC_CATEGORY_CONFIG } from '../lib/scoring';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Printer,
  Download,
  ArrowLeft,
  CheckCircle,
  Clock,
  Award,
  Unlock,
  AlertCircle,
  FileCheck2,
  Building,
  User,
  Calendar,
} from 'lucide-react';

interface EvaluationResultPageProps {
  evaluationId: string;
  department: Department;
  onBack: () => void;
  onEdit?: (evalId: string) => void;
}

export const EvaluationResultPage: React.FC<EvaluationResultPageProps> = ({
  evaluationId,
  department,
  onBack,
  onEdit,
}) => {
  const { user, isSuperAdmin, isDeptHead } = useAuth();
  const { success, error: toastError } = useToast();

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const ev = await dataService.getEvaluation(evaluationId);
      setEvaluation(ev);
    } catch (err: any) {
      toastError(err.message || 'Error loading evaluation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [evaluationId]);

  // Dept Head Approval
  const handleApprove = async () => {
    if (!evaluation) return;
    try {
      await dataService.approveEvaluation(evaluation.id, user?.name || 'Department Head');
      success('Evaluation formally approved!');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to approve evaluation');
    }
  };

  // Super Admin Reopen
  const handleReopen = async () => {
    if (!evaluation) return;
    try {
      await dataService.reopenEvaluation(evaluation.id, user?.name || 'Super Admin');
      success('Evaluation unlocked and reopened for edits.');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to reopen evaluation');
    }
  };

  // PDF Export
  const handleExportPDF = async () => {
    if (!printRef.current || !evaluation) return;
    setIsExporting(true);

    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Nawaloka_KPI_${evaluation.employeeId}_${evaluation.periodStart}.pdf`);
      success('Evaluation PDF downloaded successfully');
    } catch (err: any) {
      toastError('Failed to generate PDF. You can also use Print to PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !evaluation) {
    return (
      <div className="p-12 text-center text-slate-500">
        Loading evaluation report...
      </div>
    );
  }

  // Circular gauge color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 80) return '#14B8A6';
    if (score >= 70) return '#3B82F6';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const strokeColor = getScoreColor(evaluation.finalScore);
  const strokeDashoffset = 440 - (440 * evaluation.finalScore) / 100;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Action Bar (No Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to List</span>
        </button>

        <div className="flex items-center gap-2">
          {evaluation.status === 'submitted' && isDeptHead && (
            <Button onClick={handleApprove} variant="teal" size="sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>Approve Evaluation</span>
            </Button>
          )}

          {(evaluation.status === 'approved' || evaluation.status === 'submitted') && isSuperAdmin && (
            <Button onClick={handleReopen} variant="outline" size="sm">
              <Unlock className="h-4 w-4 mr-1 text-amber-600" />
              <span>Reopen (Super Admin)</span>
            </Button>
          )}

          {(evaluation.status === 'draft' || evaluation.status === 'reopened') && onEdit && (
            <Button onClick={() => onEdit(evaluation.id)} variant="outline" size="sm">
              <span>Edit Evaluation</span>
            </Button>
          )}

          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-1" />
            <span>Print Report</span>
          </Button>

          <Button
            onClick={handleExportPDF}
            variant="primary"
            size="sm"
            isLoading={isExporting}
          >
            <Download className="h-4 w-4 mr-1" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Printable Evaluation Report Container */}
      <div
        ref={printRef}
        className="print-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-8"
      >
        {/* Hospital Document Header */}
        <div className="border-b-2 border-[#1F3A6E] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F3A6E] text-white font-extrabold text-lg">
              NH
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1F3A6E] dark:text-white tracking-tight">
                NAWALOKA HOSPITALS PLC
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Colombo, Sri Lanka · Balanced Scorecard Performance Evaluation Report
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-0.5">
            <Badge
              variant={
                evaluation.status === 'approved'
                  ? 'success'
                  : evaluation.status === 'submitted'
                  ? 'teal'
                  : 'secondary'
              }
              size="md"
            >
              STATUS: {evaluation.status.toUpperCase()}
            </Badge>
            <p className="text-[11px] text-slate-400 font-mono">
              Ref: {evaluation.id}
            </p>
          </div>
        </div>

        {/* Employee & Evaluation Details Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Staff Member
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">
              {evaluation.employeeName}
            </span>
            <span className="font-mono text-teal-600 dark:text-teal-400">
              {evaluation.employeeId}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Designation & Unit
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
              {evaluation.designation}
            </span>
            <span className="text-slate-500">Dept: {evaluation.departmentId.toUpperCase()}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Evaluation Cycle
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize mt-0.5 block">
              {evaluation.periodType} Review
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {evaluation.periodStart} ~ {evaluation.periodEnd}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Lead Evaluator
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
              {evaluation.evaluatorName}
            </span>
            <span className="text-slate-500 capitalize">{evaluation.evaluatorRole.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Big Circular Score Gauge & Grade Summary */}
        <div className="flex flex-col md:flex-row items-center justify-around gap-6 p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 dark:from-slate-850 dark:to-slate-800 border border-slate-200/80 dark:border-slate-700/80">
          {/* Circular SVG Gauge */}
          <div className="relative flex items-center justify-center">
            <svg className="w-44 h-44 -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="70"
                stroke="currentColor"
                strokeWidth="14"
                className="text-slate-200 dark:text-slate-800"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r="70"
                stroke={strokeColor}
                strokeWidth="14"
                fill="transparent"
                strokeDasharray="440"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {evaluation.finalScore}
              </span>
              <span className="text-xs font-semibold text-slate-400">OUT OF 100</span>
            </div>
          </div>

          {/* Performance Classification Card */}
          <div className="text-center md:text-left space-y-2 max-w-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assessed Performance Grade
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: strokeColor }}>
              {evaluation.grade}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Based on the 5-pillar Balanced Scorecard model: 80% departmental strategic alignment and 20% individual conduct and capability.
            </p>
            {evaluation.approvedBy && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                <CheckCircle className="h-4 w-4" />
                <span>Formally Approved by {evaluation.approvedBy}</span>
              </div>
            )}
          </div>
        </div>

        {/* BSC 5 Category Breakdown Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Balanced Scorecard Parameter Breakdown
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">BSC Pillar</th>
                  <th className="p-3">Focus Area</th>
                  <th className="p-3 text-center">Weight</th>
                  <th className="p-3 text-center">Avg Rating (1–5)</th>
                  <th className="p-3 text-right">Points Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {evaluation.categoryScores &&
                  Object.values(evaluation.categoryScores).map((cat) => {
                    const conf = BSC_CATEGORY_CONFIG[cat.category];
                    return (
                      <tr key={cat.category} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: conf.colour }}
                          />
                          <span style={{ color: conf.colour }}>{conf.label}</span>
                        </td>
                        <td className="p-3 text-slate-500">{conf.focus}</td>
                        <td className="p-3 text-center font-mono font-medium">{conf.weight}%</td>
                        <td className="p-3 text-center font-mono font-bold">{cat.avgRating} / 5.0</td>
                        <td className="p-3 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                          {cat.score} / {conf.weight}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
              <tfoot className="bg-slate-50/80 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-800">
                <tr>
                  <td colSpan={2} className="p-3 text-slate-900 dark:text-white uppercase">
                    Total Composite Score
                  </td>
                  <td className="p-3 text-center font-mono">100%</td>
                  <td className="p-3 text-center">-</td>
                  <td className="p-3 text-right font-mono text-base" style={{ color: strokeColor }}>
                    {evaluation.finalScore} / 100
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Detailed KPI Items Evaluated */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Detailed KPI Assessment Rubric
          </h3>

          <div className="space-y-2">
            {evaluation.items.map((item, idx) => {
              const conf = BSC_CATEGORY_CONFIG[item.bscCategory];
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.2 rounded"
                        style={{
                          backgroundColor: `${conf.colour}15`,
                          color: conf.colour,
                        }}
                      >
                        {conf.label}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.kpiName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Target: {item.target} {item.actual && `· Actual: ${item.actual}`}
                    </div>
                    {item.comment && (
                      <div className="text-[11px] text-slate-400 italic">
                        "{item.comment}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400">Rating:</span>
                    <span
                      className="font-mono font-extrabold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: conf.colour }}
                    >
                      {item.rating} / 5
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Qualitative Notes Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1">
            <h4 className="font-bold text-xs uppercase text-emerald-800 dark:text-emerald-300">
              Key Strengths & Achievements
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {evaluation.strengths || 'No specific strengths noted.'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-1">
            <h4 className="font-bold text-xs uppercase text-amber-800 dark:text-amber-300">
              Areas for Growth & Guidance
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {evaluation.improvements || 'No specific development areas noted.'}
            </p>
          </div>
        </div>

        {/* Overall Comments & Sign-off Box */}
        {evaluation.comments && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <h4 className="font-bold text-xs uppercase text-slate-500">
              Evaluator Closing Remarks
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 italic">
              "{evaluation.comments}"
            </p>
          </div>
        )}

        {/* Signatures Row */}
        <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          <div className="space-y-12">
            <div className="h-6"></div>
            <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                {evaluation.employeeName}
              </span>
              <span>Staff Signature</span>
            </div>
          </div>

          <div className="space-y-12">
            <div className="h-6"></div>
            <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                {evaluation.evaluatorName}
              </span>
              <span>Evaluator Signature</span>
            </div>
          </div>

          <div className="space-y-12">
            <div className="h-6"></div>
            <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                {evaluation.approvedBy || 'Department Head'}
              </span>
              <span>Hospital Authority Approval</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
