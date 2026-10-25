import React, { useState, useEffect } from 'react';
import { Department, GradeBand } from '../types';
import { dataService } from '../data';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import {
  RotateCcw,
  Sparkles,
  Sliders,
  Building,
  Save,
  CheckCircle2,
  Database,
  ShieldCheck,
  Edit2,
  Plus,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { isDemoMode } = useAuth();
  const { success, error: toastError, warning } = useToast();

  const [gradeBands, setGradeBands] = useState<GradeBand[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSavingBands, setIsSavingBands] = useState(false);

  // Department Edit Modal
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptColour, setDeptColour] = useState('');
  const [deptIcon, setDeptIcon] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bands, depts] = await Promise.all([
        dataService.getGradeBands(),
        dataService.getDepartments(),
      ]);
      setGradeBands(bands);
      setDepartments(depts);
    } catch (err: any) {
      toastError(err.message || 'Error loading settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update a Grade Band threshold
  const handleUpdateBand = (
    index: number,
    field: keyof GradeBand,
    value: string | number
  ) => {
    const updated = [...gradeBands];
    updated[index] = { ...updated[index], [field]: value };
    setGradeBands(updated);
  };

  // Save Grade Bands
  const handleSaveGradeBands = async () => {
    setIsSavingBands(true);
    try {
      await dataService.saveGradeBands(gradeBands);
      success('Grade bands configuration updated successfully!');
    } catch (err: any) {
      toastError(err.message || 'Failed to save grade bands');
    } finally {
      setIsSavingBands(false);
    }
  };

  // Seed Demo Data button
  const handleSeedData = async () => {
    if (
      !confirm(
        'Are you sure you want to seed demo data? This will populate departments, objectives, KPI templates, demo staff, and recent evaluations.'
      )
    ) {
      return;
    }

    setIsSeeding(true);
    try {
      await dataService.seedData();
      success('Demo data seeded successfully with full hospital roster and evaluations!');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to seed data');
    } finally {
      setIsSeeding(false);
    }
  };

  // Save Department Edit
  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;

    try {
      const updated: Department = {
        ...editingDept,
        code: deptCode.trim().toUpperCase(),
        name: deptName.trim(),
        colour: deptColour.trim(),
        icon: deptIcon.trim(),
      };
      await dataService.saveDepartment(updated);
      success(`Updated department ${updated.code}`);
      setIsDeptModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to save department');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Hospital System Settings & Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Super Administrator controls: customize performance grade bands, department definitions, and database seeding.
        </p>
      </div>

      {/* Demo Data Seeder Card */}
      <Card className="border-teal-200 dark:border-teal-900 bg-gradient-to-r from-teal-50/50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-teal-600 text-white shrink-0 shadow-xs">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Reset & Seed Full Hospital Demo Data
                </h3>
                <Badge variant="teal" size="sm">
                  {isDemoMode ? 'Local Storage' : 'Cloud Firestore'}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Populates 17 clinical and non-clinical departments, strategic objectives, BSC KPI rubrics, demo staff (NH-CD5-001 through NH-CD5-005, etc.), and recent evaluations for instant dashboard testing.
              </p>
            </div>
          </div>

          <Button
            onClick={handleSeedData}
            variant="teal"
            isLoading={isSeeding}
            className="shrink-0 font-semibold"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            <span>Seed Demo Data</span>
          </Button>
        </CardContent>
      </Card>

      {/* Grade Bands Configuration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Performance Grade Bands</CardTitle>
            <CardDescription className="text-xs">
              Define the score cutoffs and nomenclature for final Balanced Scorecard evaluations
            </CardDescription>
          </div>
          <Button
            onClick={handleSaveGradeBands}
            variant="primary"
            size="sm"
            isLoading={isSavingBands}
          >
            <Save className="h-4 w-4 mr-1" />
            <span>Save Grade Bands</span>
          </Button>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="space-y-3">
            {gradeBands.map((band, idx) => (
              <div
                key={band.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="h-4 w-4 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: band.colour }}
                  />
                  <div className="w-48">
                    <input
                      type="text"
                      value={band.name}
                      onChange={(e) => handleUpdateBand(idx, 'name', e.target.value)}
                      className="font-bold text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 pb-0.5 focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-slate-400">Min:</span>
                    <input
                      type="number"
                      value={band.minScore}
                      onChange={(e) =>
                        handleUpdateBand(idx, 'minScore', parseFloat(e.target.value) || 0)
                      }
                      className="w-16 rounded border border-slate-200 dark:border-slate-700 p-1 text-center font-bold bg-white dark:bg-slate-900"
                    />
                    <span className="text-slate-400">Max:</span>
                    <input
                      type="number"
                      value={band.maxScore}
                      onChange={(e) =>
                        handleUpdateBand(idx, 'maxScore', parseFloat(e.target.value) || 0)
                      }
                      className="w-16 rounded border border-slate-200 dark:border-slate-700 p-1 text-center font-bold bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={band.colour}
                      onChange={(e) => handleUpdateBand(idx, 'colour', e.target.value)}
                      className="h-7 w-7 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Registered Departments Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registered Hospital Departments</CardTitle>
          <CardDescription className="text-xs">
            Edit department codes, names, brand accent colors, and active visibility
          </CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Department Name</th>
                <th className="p-3">Classification</th>
                <th className="p-3">Colour</th>
                <th className="p-3">Icon Key</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold" style={{ color: dept.colour }}>
                    {dept.code}
                  </td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                    {dept.name}
                  </td>
                  <td className="p-3 capitalize text-slate-500">
                    {dept.type.replace('_', ' ')}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 font-mono">
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: dept.colour }}
                      />
                      <span>{dept.colour}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-500">
                    {dept.icon}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setEditingDept(dept);
                        setDeptCode(dept.code);
                        setDeptName(dept.name);
                        setDeptColour(dept.colour);
                        setDeptIcon(dept.icon);
                        setIsDeptModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded text-xs font-semibold"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Edit Department */}
      <Dialog
        open={isDeptModalOpen}
        onOpenChange={setIsDeptModalOpen}
        title="Edit Department Configuration"
        description="Modify branding and department identity"
      >
        <form onSubmit={handleSaveDept} className="space-y-4 pt-2">
          <Input
            label="Department Code"
            required
            value={deptCode}
            onChange={(e) => setDeptCode(e.target.value)}
            placeholder="e.g. CD5"
          />

          <Input
            label="Department Name"
            required
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            placeholder="e.g. Pharmacy"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Accent Colour (Hex)"
              required
              value={deptColour}
              onChange={(e) => setDeptColour(e.target.value)}
              placeholder="#1A9BB0"
            />
            <Input
              label="Lucide Icon Key"
              required
              value={deptIcon}
              onChange={(e) => setDeptIcon(e.target.value)}
              placeholder="Pill, Stethoscope, etc."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeptModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Department
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
