import React, { useState, useEffect } from 'react';
import { Department, DepartmentObjective, KPITemplate, BSCCategory } from '../types';
import { dataService } from '../data';
import { useAuth } from '../context/AuthContext';
import { BSC_CATEGORY_CONFIG } from '../lib/scoring';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Dialog } from '../components/ui/Dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { useToast } from '../components/ui/Toast';
import {
  Plus,
  Trash2,
  Edit2,
  Target,
  FileText,
  Sparkles,
  Layers,
  CheckCircle,
} from 'lucide-react';

interface ObjectivesPageProps {
  department: Department;
}

export const ObjectivesPage: React.FC<ObjectivesPageProps> = ({ department }) => {
  const { canEdit, isSuperAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'objectives' | 'kpis'>('objectives');
  const [objectives, setObjectives] = useState<DepartmentObjective[]>([]);
  const [kpiTemplates, setKpiTemplates] = useState<KPITemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Objective Modal State
  const [isObjModalOpen, setIsObjModalOpen] = useState(false);
  const [editingObj, setEditingObj] = useState<DepartmentObjective | null>(null);
  const [objText, setObjText] = useState('');
  const [objCategory, setObjCategory] = useState<BSCCategory>('financial');

  // KPI Template Modal State
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KPITemplate | null>(null);
  const [kpiName, setKpiName] = useState('');
  const [kpiTarget, setKpiTarget] = useState('');
  const [kpiUnit, setKpiUnit] = useState('');
  const [kpiCategory, setKpiCategory] = useState<BSCCategory>('financial');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [objs, kpis] = await Promise.all([
        dataService.getObjectives(department.id),
        dataService.getKPITemplates(department.id),
      ]);
      setObjectives(objs);
      setKpiTemplates(kpis);
    } catch (err: any) {
      toastError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [department.id]);

  // Handle Objective Save
  const handleSaveObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objText.trim()) return;

    try {
      const newObj: DepartmentObjective = {
        id: editingObj ? editingObj.id : 'obj-' + Date.now(),
        departmentId: department.id,
        text: objText.trim(),
        bscCategory: objCategory,
        order: editingObj ? editingObj.order : objectives.length + 1,
      };

      await dataService.saveObjective(newObj);
      success(editingObj ? 'Objective updated successfully' : 'Objective added successfully');
      setIsObjModalOpen(false);
      setEditingObj(null);
      setObjText('');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to save objective');
    }
  };

  const handleDeleteObjective = async (id: string) => {
    if (!confirm('Are you sure you want to remove this strategic objective?')) return;
    try {
      await dataService.deleteObjective(id);
      success('Objective deleted');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete objective');
    }
  };

  // Handle KPI Template Save
  const handleSaveKpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kpiName.trim() || !kpiTarget.trim()) return;

    try {
      const newKpi: KPITemplate = {
        id: editingKpi ? editingKpi.id : 'kpi-' + Date.now(),
        departmentId: department.id,
        bscCategory: kpiCategory,
        kpiName: kpiName.trim(),
        target: kpiTarget.trim(),
        unit: kpiUnit.trim() || 'standard',
        order: editingKpi ? editingKpi.order : kpiTemplates.length + 1,
      };

      await dataService.saveKPITemplate(newKpi);
      success(editingKpi ? 'KPI template updated' : 'KPI template added');
      setIsKpiModalOpen(false);
      setEditingKpi(null);
      setKpiName('');
      setKpiTarget('');
      setKpiUnit('');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to save KPI template');
    }
  };

  const handleDeleteKpi = async (id: string) => {
    if (!confirm('Are you sure you want to remove this KPI template?')) return;
    try {
      await dataService.deleteKPITemplate(id);
      success('KPI template deleted');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete KPI template');
    }
  };

  const bscCategoriesList: BSCCategory[] = [
    'financial',
    'customer',
    'internal_process',
    'learning_growth',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Strategic Objectives & KPI Templates
            </h1>
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${department.colour}15`,
                color: department.colour,
              }}
            >
              {department.code}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Define strategic priorities that directly populate employee Balanced Scorecard evaluation rubrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'objectives' && canEdit && (
            <Button
              onClick={() => {
                setEditingObj(null);
                setObjText('');
                setObjCategory('financial');
                setIsObjModalOpen(true);
              }}
              variant="teal"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span>Add Objective</span>
            </Button>
          )}

          {activeTab === 'kpis' && canEdit && (
            <Button
              onClick={() => {
                setEditingKpi(null);
                setKpiName('');
                setKpiTarget('');
                setKpiUnit('');
                setKpiCategory('financial');
                setIsKpiModalOpen(true);
              }}
              variant="teal"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span>Add KPI Template</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            id: 'objectives',
            label: `Strategic Objectives (${objectives.length})`,
            icon: <Target className="h-4 w-4" />,
          },
          {
            id: 'kpis',
            label: `Department KPI Rubric (${kpiTemplates.length})`,
            icon: <Layers className="h-4 w-4" />,
          },
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as any)}
      />

      {/* Tab 1: Strategic Objectives */}
      {activeTab === 'objectives' && (
        <div className="space-y-6">
          {bscCategoriesList.map((catKey) => {
            const conf = BSC_CATEGORY_CONFIG[catKey];
            const catObjs = objectives.filter((o) => o.bscCategory === catKey);

            return (
              <Card key={catKey} className="overflow-hidden">
                <CardHeader
                  className="py-3 px-5 border-b"
                  style={{
                    backgroundColor: `${conf.colour}08`,
                    borderLeft: `4px solid ${conf.colour}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ color: conf.colour }}>
                        {conf.label} Objectives
                      </span>
                      <span className="text-xs text-slate-500 font-mono font-medium">
                        ({conf.weight}% Scorecard Weight)
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 italic hidden sm:inline">
                      Focus: {conf.focus}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {catObjs.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No objectives mapped to {conf.label} yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {catObjs.map((obj, i) => (
                        <div
                          key={obj.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-start gap-3 flex-1 pr-4">
                            <span className="font-mono text-xs font-bold text-slate-400 mt-0.5">
                              {i + 1}.
                            </span>
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {obj.text}
                            </span>
                          </div>

                          {canEdit && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingObj(obj);
                                  setObjText(obj.text);
                                  setObjCategory(obj.bscCategory);
                                  setIsObjModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Edit Objective"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteObjective(obj.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Delete Objective"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tab 2: KPI Templates Rubric */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
              <span>
                These KPI items automatically populate when starting a new evaluation for employees in {department.name}.
              </span>
            </div>
            <span className="font-semibold">{kpiTemplates.length} configured</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bscCategoriesList.map((catKey) => {
              const conf = BSC_CATEGORY_CONFIG[catKey];
              const kpis = kpiTemplates.filter((k) => k.bscCategory === catKey);

              return (
                <Card key={catKey}>
                  <CardHeader
                    className="py-3 px-4 border-b flex flex-row items-center justify-between"
                    style={{
                      backgroundColor: `${conf.colour}08`,
                      borderLeft: `4px solid ${conf.colour}`,
                    }}
                  >
                    <div>
                      <CardTitle className="text-sm" style={{ color: conf.colour }}>
                        {conf.label} ({conf.weight}%)
                      </CardTitle>
                      <span className="text-[11px] text-slate-400">{conf.focus}</span>
                    </div>
                    <Badge variant="outline" size="sm">
                      {kpis.length} KPIs
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-4 space-y-2.5">
                    {kpis.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No templates defined for this category.
                      </div>
                    ) : (
                      kpis.map((kpi, idx) => (
                        <div
                          key={kpi.id}
                          className="p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-start justify-between gap-2"
                        >
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                              {kpi.kpiName}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                              <span>Target: {kpi.target} {kpi.unit}</span>
                            </div>
                          </div>

                          {canEdit && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingKpi(kpi);
                                  setKpiName(kpi.kpiName);
                                  setKpiTarget(kpi.target);
                                  setKpiUnit(kpi.unit);
                                  setKpiCategory(kpi.bscCategory);
                                  setIsKpiModalOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteKpi(kpi.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Objective */}
      <Dialog
        open={isObjModalOpen}
        onOpenChange={setIsObjModalOpen}
        title={editingObj ? 'Edit Strategic Objective' : 'New Strategic Objective'}
        description={`Set an objective for ${department.name}`}
      >
        <form onSubmit={handleSaveObjective} className="space-y-4 pt-2">
          <Select
            label="Balanced Scorecard Category"
            value={objCategory}
            onChange={(e) => setObjCategory(e.target.value as BSCCategory)}
            options={[
              { value: 'financial', label: 'Financial (20% Weight - H3 Carbon & Cost)' },
              { value: 'customer', label: 'Customer (20% Weight - Patient & Client Experience)' },
              { value: 'internal_process', label: 'Internal Process (25% Weight - H1 ESG & H2 Digital)' },
              { value: 'learning_growth', label: 'Learning & Growth (15% Weight - People & Capability)' },
            ]}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Objective Description
            </label>
            <textarea
              required
              rows={3}
              value={objText}
              onChange={(e) => setObjText(e.target.value)}
              placeholder="e.g. Achieve 99.9% critical medication availability across inpatient counters"
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A9BB0] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsObjModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal">
              Save Objective
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Add/Edit KPI Template */}
      <Dialog
        open={isKpiModalOpen}
        onOpenChange={setIsKpiModalOpen}
        title={editingKpi ? 'Edit KPI Template' : 'Add KPI Template'}
        description={`Standard rubric item for ${department.name}`}
      >
        <form onSubmit={handleSaveKpi} className="space-y-4 pt-2">
          <Select
            label="BSC Category"
            value={kpiCategory}
            onChange={(e) => setKpiCategory(e.target.value as BSCCategory)}
            options={[
              { value: 'financial', label: 'Financial (20%)' },
              { value: 'customer', label: 'Customer (20%)' },
              { value: 'internal_process', label: 'Internal Process (25%)' },
              { value: 'learning_growth', label: 'Learning & Growth (15%)' },
            ]}
          />

          <Input
            label="KPI Name / Description"
            required
            value={kpiName}
            onChange={(e) => setKpiName(e.target.value)}
            placeholder="e.g. Pharmaceutical waste reduction via FEFO"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Goal"
              required
              value={kpiTarget}
              onChange={(e) => setKpiTarget(e.target.value)}
              placeholder="e.g. 15 or 99.9"
            />
            <Input
              label="Unit / Scale"
              value={kpiUnit}
              onChange={(e) => setKpiUnit(e.target.value)}
              placeholder="e.g. %, hours, LKR M"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsKpiModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal">
              Save Template
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
