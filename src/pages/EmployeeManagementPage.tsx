import React, { useState, useEffect } from 'react';
import { Department, Employee } from '../types';
import { dataService } from '../data';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import Papa from 'papaparse';
import {
  UserPlus,
  Upload,
  Download,
  Trash2,
  Edit2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  X,
  FileCheck,
} from 'lucide-react';

interface EmployeeManagementPageProps {
  currentDepartment: Department;
  onBack: () => void;
}

export const EmployeeManagementPage: React.FC<EmployeeManagementPageProps> = ({
  currentDepartment,
  onBack,
}) => {
  const { isSuperAdmin } = useAuth();
  const { success, error: toastError, warning } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [departmentId, setDepartmentId] = useState(currentDepartment.id);
  const [email, setEmail] = useState('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().slice(0, 10));

  // CSV Bulk Import State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedEmployees, setParsedEmployees] = useState<Employee[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [depts, emps] = await Promise.all([
        dataService.getDepartments(),
        dataService.getEmployees(isSuperAdmin ? 'ALL' : currentDepartment.id),
      ]);
      setDepartments(depts);
      setEmployees(emps);
    } catch (err: any) {
      toastError(err.message || 'Error loading employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentDepartment.id, isSuperAdmin]);

  // Handle Save Single Employee
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanId = employeeId.trim().toUpperCase();
    if (!cleanId || !name.trim() || !designation.trim() || !email.trim()) {
      toastError('All fields are required.');
      return;
    }

    // Check unique Employee ID when adding new
    if (!isEditing) {
      const exists = employees.some(
        (emp) => emp.employeeId.toUpperCase() === cleanId
      );
      if (exists) {
        toastError(`Employee ID "${cleanId}" already exists! IDs must be unique.`);
        return;
      }
    }

    try {
      const empData: Employee = {
        employeeId: cleanId,
        name: name.trim(),
        designation: designation.trim(),
        departmentId,
        email: email.trim().toLowerCase(),
        joinDate,
        active: true,
      };

      await dataService.saveEmployee(empData);
      success(isEditing ? 'Employee updated' : 'Employee added successfully');
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to save employee');
    }
  };

  // Toggle Active
  const handleToggleActive = async (emp: Employee) => {
    try {
      await dataService.deactivateEmployee(emp.employeeId);
      success(`Toggled active status for ${emp.name}`);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to update employee status');
    }
  };

  const resetForm = () => {
    setEmployeeId('');
    setName('');
    setDesignation('');
    setDepartmentId(currentDepartment.id);
    setEmail('');
    setJoinDate(new Date().toISOString().slice(0, 10));
    setIsEditing(false);
  };

  // CSV File Upload & Parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvErrors([]);
    setParsedEmployees([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: any[] = results.data;
        const validRows: Employee[] = [];
        const errs: string[] = [];
        const seenIds = new Set<string>();

        rows.forEach((row, idx) => {
          const rowNum = idx + 2; // header is row 1
          const rawId = (row['Employee ID'] || row['employeeId'] || row['ID'] || '').trim().toUpperCase();
          const rawName = (row['Name'] || row['name'] || '').trim();
          const rawDesig = (row['Designation'] || row['designation'] || '').trim();
          const rawDept = (row['Department'] || row['departmentId'] || row['department'] || currentDepartment.id).trim().toLowerCase();
          const rawEmail = (row['Email'] || row['email'] || '').trim().toLowerCase();
          const rawDate = (row['Join Date'] || row['joinDate'] || new Date().toISOString().slice(0, 10)).trim();

          if (!rawId) {
            errs.push(`Row ${rowNum}: Missing Employee ID`);
            return;
          }
          if (!rawName) {
            errs.push(`Row ${rowNum} (${rawId}): Missing Name`);
            return;
          }
          if (seenIds.has(rawId)) {
            errs.push(`Row ${rowNum}: Duplicate ID "${rawId}" found within CSV`);
            return;
          }

          seenIds.add(rawId);
          validRows.push({
            employeeId: rawId,
            name: rawName,
            designation: rawDesig || 'Staff',
            departmentId: rawDept,
            email: rawEmail || `${rawId.toLowerCase()}@nawaloka.lk`,
            joinDate: rawDate,
            active: true,
          });
        });

        setParsedEmployees(validRows);
        setCsvErrors(errs);
      },
      error: (err) => {
        setCsvErrors([`Failed to parse CSV: ${err.message}`]);
      },
    });
  };

  // Execute Bulk Import
  const handleExecuteImport = async () => {
    if (parsedEmployees.length === 0) return;
    setIsImporting(true);

    try {
      const res = await dataService.bulkImportEmployees(parsedEmployees);
      success(`Imported ${res.added} new employees and updated ${res.updated} existing records.`);
      setIsCsvModalOpen(false);
      setParsedEmployees([]);
      setCsvFile(null);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        'Employee ID': 'NH-CD5-006',
        Name: 'Sithum Perera',
        Designation: 'Junior Pharmacist',
        Department: 'cd5',
        Email: 'sithum.p@nawaloka.lk',
        'Join Date': '2024-01-15',
      },
      {
        'Employee ID': 'NH-CD5-007',
        Name: 'Anuki Jayasuriya',
        Designation: 'Pharmacy Technician',
        Department: 'cd5',
        Email: 'anuki.j@nawaloka.lk',
        'Join Date': '2024-03-01',
      },
    ];
    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Nawaloka_Employee_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Employee Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Maintain unique Employee IDs, department assignments, and bulk CSV roster imports.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCsvModalOpen(true)}
            variant="outline"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-1 text-teal-600" />
            <span>Bulk CSV Import</span>
          </Button>

          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            variant="teal"
            size="sm"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            <span>Add Single Staff</span>
          </Button>
        </div>
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Staff Records</CardTitle>
            <CardDescription className="text-xs">
              Showing {employees.length} employees
            </CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-3">Employee ID</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Designation</th>
                <th className="p-3">Department</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Join Date</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map((emp) => (
                <tr
                  key={emp.employeeId}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                    {emp.employeeId}
                  </td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    {emp.name}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {emp.designation}
                  </td>
                  <td className="p-3 font-mono uppercase text-slate-500">
                    {emp.departmentId}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    {emp.email}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    {emp.joinDate}
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant={emp.active ? 'success' : 'danger'} size="sm">
                      {emp.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEmployeeId(emp.employeeId);
                        setName(emp.name);
                        setDesignation(emp.designation);
                        setDepartmentId(emp.departmentId);
                        setEmail(emp.email);
                        setJoinDate(emp.joinDate);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                      title="Edit Employee"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(emp)}
                      className={`p-1.5 rounded text-xs font-semibold ${
                        emp.active
                          ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          : 'text-emerald-500 hover:bg-emerald-50'
                      }`}
                      title={emp.active ? 'Deactivate Employee' : 'Activate Employee'}
                    >
                      {emp.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Add/Edit Single Employee */}
      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={isEditing ? 'Edit Employee Record' : 'Register New Employee'}
        description="Employee ID serves as the unique primary key in the hospital database"
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4 pt-2">
          <Input
            label="Employee ID (Unique Primary Key)"
            disabled={isEditing}
            required
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="e.g. NH-CD5-006"
            helperText={isEditing ? 'Employee IDs are immutable once registered.' : undefined}
          />

          <Input
            label="Staff Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dr. Kanishka Wickramasinghe"
          />

          <Input
            label="Designation / Clinical Role"
            required
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="e.g. Senior Pharmacist"
          />

          {isSuperAdmin && (
            <Select
              label="Assigned Department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              options={departments.map((d) => ({
                value: d.id,
                label: `${d.code} - ${d.name}`,
              }))}
            />
          )}

          <Input
            label="Official Hospital Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@nawaloka.lk"
          />

          <Input
            label="Join Date"
            type="date"
            required
            value={joinDate}
            onChange={(e) => setJoinDate(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal">
              {isEditing ? 'Update Record' : 'Save Employee'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Bulk CSV Import with Preview & Error Report */}
      <Dialog
        open={isCsvModalOpen}
        onOpenChange={setIsCsvModalOpen}
        title="Bulk CSV Staff Import"
        description="Upload a CSV file containing employee rosters with live validation"
        maxWidth="2xl"
      >
        <div className="space-y-4 pt-2">
          {/* Instructions and Download Template */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Required CSV Column Headers:
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                Employee ID, Name, Designation, Department, Email, Join Date
              </span>
            </div>
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              size="sm"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              <span>Sample CSV</span>
            </Button>
          </div>

          {/* File Input */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-teal-500 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <label
              htmlFor="csv-file-input"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {csvFile ? csvFile.name : 'Click to select CSV file from your computer'}
              </span>
              <span className="text-[11px] text-slate-400">
                Comma-separated .csv format only
              </span>
            </label>
          </div>

          {/* Error Report if any */}
          {csvErrors.length > 0 && (
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="h-4 w-4" />
                <span>CSV Validation Issues Found ({csvErrors.length}):</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {csvErrors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {csvErrors.length > 5 && <li>...and {csvErrors.length - 5} more errors</li>}
              </ul>
            </div>
          )}

          {/* Live Preview of Parsed Rows */}
          {parsedEmployees.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Ready to Import ({parsedEmployees.length} Valid Records):
                </span>
                <span className="text-teal-600 font-medium">Validated</span>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 text-[11px] text-slate-500 font-semibold">
                    <tr>
                      <th className="p-2">ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Designation</th>
                      <th className="p-2">Dept</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedEmployees.map((p) => (
                      <tr key={p.employeeId}>
                        <td className="p-2 font-mono font-bold text-teal-600">{p.employeeId}</td>
                        <td className="p-2 font-semibold text-slate-800 dark:text-slate-200">{p.name}</td>
                        <td className="p-2 text-slate-500">{p.designation}</td>
                        <td className="p-2 font-mono uppercase text-slate-500">{p.departmentId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCsvModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="teal"
              disabled={parsedEmployees.length === 0}
              isLoading={isImporting}
              onClick={handleExecuteImport}
            >
              Confirm Import ({parsedEmployees.length} Staff)
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
