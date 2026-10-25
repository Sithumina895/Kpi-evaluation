import {
  Department,
  DepartmentObjective,
  Employee,
  KPITemplate,
  Evaluation,
  UserProfile,
  UserRole,
  GradeBand,
  AuditLogEntry,
} from '../types';

export interface DataService {
  readonly isDemo: boolean;

  // --- Auth & Profile ---
  getCurrentUser(): Promise<{ profile: UserProfile; role: UserRole } | null>;
  login(
    email: string,
    password: string,
    selectedDeptId: string
  ): Promise<{ profile: UserProfile; role: UserRole }>;
  logout(): Promise<void>;
  checkSuperAdminExists(): Promise<boolean>;
  createFirstSuperAdmin(
    name: string,
    email: string,
    password: string
  ): Promise<{ profile: UserProfile; role: UserRole }>;

  // --- Departments ---
  getDepartments(): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | null>;
  saveDepartment(dept: Department): Promise<void>;

  // --- Objectives ---
  getObjectives(deptId?: string): Promise<DepartmentObjective[]>;
  saveObjective(obj: DepartmentObjective): Promise<void>;
  deleteObjective(id: string): Promise<void>;

  // --- KPI Templates ---
  getKPITemplates(deptId: string): Promise<KPITemplate[]>;
  saveKPITemplate(template: KPITemplate): Promise<void>;
  deleteKPITemplate(id: string): Promise<void>;

  // --- Employees ---
  getEmployees(deptId?: string): Promise<Employee[]>;
  getEmployee(employeeId: string): Promise<Employee | null>;
  saveEmployee(emp: Employee): Promise<void>;
  deactivateEmployee(employeeId: string): Promise<void>;
  bulkImportEmployees(
    employees: Employee[]
  ): Promise<{ added: number; updated: number; errors: string[] }>;

  // --- Evaluations ---
  getEvaluations(deptId?: string): Promise<Evaluation[]>;
  getEvaluation(id: string): Promise<Evaluation | null>;
  saveEvaluation(evaluation: Evaluation): Promise<void>;
  approveEvaluation(id: string, approverName: string): Promise<void>;
  reopenEvaluation(id: string, adminName: string): Promise<void>;
  deleteEvaluation(id: string): Promise<void>;

  // --- Users & Roles ---
  getUsers(): Promise<{ profile: UserProfile; role: UserRole }[]>;
  createUser(
    name: string,
    email: string,
    password: string,
    departmentId: string,
    role: UserRole
  ): Promise<void>;
  toggleUserActive(uid: string, active: boolean): Promise<void>;
  updateUserRoleAndDept(
    uid: string,
    role: UserRole,
    departmentId: string
  ): Promise<void>;

  // --- Grade Bands ---
  getGradeBands(): Promise<GradeBand[]>;
  saveGradeBands(bands: GradeBand[]): Promise<void>;

  // --- Audit Log ---
  getAuditLogs(deptId?: string): Promise<AuditLogEntry[]>;
  logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void>;

  // --- Reset & Seed ---
  seedData(): Promise<void>;
}
