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
  UserRoleRecord,
} from '../types';
import { DataService } from './DataService';
import {
  SEED_DEPARTMENTS,
  SEED_OBJECTIVES,
  SEED_KPI_TEMPLATES,
  SEED_EMPLOYEES,
  SEED_USERS,
  SEED_ROLES,
  generateSeedEvaluations,
} from './seed';
import { DEFAULT_GRADE_BANDS } from '../lib/scoring';

const STORAGE_KEYS = {
  CURRENT_USER: 'nawaloka_current_user',
  DEPARTMENTS: 'nawaloka_departments',
  OBJECTIVES: 'nawaloka_objectives',
  KPI_TEMPLATES: 'nawaloka_kpi_templates',
  EMPLOYEES: 'nawaloka_employees',
  EVALUATIONS: 'nawaloka_evaluations',
  USERS: 'nawaloka_users',
  ROLES: 'nawaloka_roles',
  GRADE_BANDS: 'nawaloka_grade_bands',
  AUDIT_LOGS: 'nawaloka_audit_logs',
  SEEDED: 'nawaloka_initialized_flag_v1',
};

export class LocalDemoDataService implements DataService {
  readonly isDemo = true;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') return;
    const isSeeded = localStorage.getItem(STORAGE_KEYS.SEEDED);
    if (!isSeeded) {
      this.resetToSeed();
    }
  }

  public resetToSeed() {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(SEED_DEPARTMENTS));
    localStorage.setItem(STORAGE_KEYS.OBJECTIVES, JSON.stringify(SEED_OBJECTIVES));
    localStorage.setItem(STORAGE_KEYS.KPI_TEMPLATES, JSON.stringify(SEED_KPI_TEMPLATES));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(SEED_EMPLOYEES));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(SEED_ROLES));
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(generateSeedEvaluations()));
    localStorage.setItem(STORAGE_KEYS.GRADE_BANDS, JSON.stringify(DEFAULT_GRADE_BANDS));
    
    const initialAudit: AuditLogEntry[] = [
      {
        id: 'audit-init-1',
        action: 'create',
        entity: 'settings',
        entityId: 'system_init',
        userId: 'system',
        userName: 'System Bootstrapper',
        departmentId: 'ALL',
        details: 'System initialized with Nawaloka Hospital strategic BSC templates and 17 departments.',
        timestamp: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAudit));
    localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
  }

  private getStored<T>(key: string, fallback: T): T {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  }

  private setStored<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // --- Auth & Profile ---
  async getCurrentUser(): Promise<{ profile: UserProfile; role: UserRole } | null> {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async login(
    email: string,
    password: string,
    selectedDeptId: string
  ): Promise<{ profile: UserProfile; role: UserRole }> {
    const users = this.getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
    const roles = this.getStored<UserRoleRecord[]>(STORAGE_KEYS.ROLES, []);

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    if (!user.active) {
      throw new Error('Your user account has been deactivated. Please contact the Hospital Super Administrator.');
    }

    const roleRecord = roles.find((r) => r.uid === user.uid);
    const role: UserRole = roleRecord ? roleRecord.role : 'viewer';

    // Verify department access: Super Admin can access any department.
    // Department users must match the selected department!
    if (role !== 'super_admin' && user.departmentId !== selectedDeptId) {
      const depts = await this.getDepartments();
      const userDept = depts.find((d) => d.id === user.departmentId);
      const selDept = depts.find((d) => d.id === selectedDeptId);
      throw new Error(
        `Access Denied: You belong to "${userDept?.name || user.departmentId}", but attempted to access "${selDept?.name || selectedDeptId}". Please select your assigned department.`
      );
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.setStored(STORAGE_KEYS.USERS, users);

    const session = { profile: user, role };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));

    await this.logAudit({
      action: 'login',
      entity: 'user',
      entityId: user.uid,
      userId: user.uid,
      userName: user.name,
      departmentId: user.departmentId,
      details: `User signed in successfully to department ${selectedDeptId}.`,
    });

    return session;
  }

  async logout(): Promise<void> {
    const session = await this.getCurrentUser();
    if (session) {
      await this.logAudit({
        action: 'login',
        entity: 'user',
        entityId: session.profile.uid,
        userId: session.profile.uid,
        userName: session.profile.name,
        departmentId: session.profile.departmentId,
        details: 'User logged out of the session.',
      });
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  async checkSuperAdminExists(): Promise<boolean> {
    const roles = this.getStored<UserRoleRecord[]>(STORAGE_KEYS.ROLES, []);
    return roles.some((r) => r.role === 'super_admin');
  }

  async createFirstSuperAdmin(
    name: string,
    email: string,
    _password: string
  ): Promise<{ profile: UserProfile; role: UserRole }> {
    const exists = await this.checkSuperAdminExists();
    if (exists) {
      throw new Error('A Super Admin already exists in this system.');
    }

    const uid = 'admin-' + Math.random().toString(36).substring(2, 9);
    const profile: UserProfile = {
      uid,
      name,
      email,
      departmentId: 'ALL',
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const users = this.getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
    const roles = this.getStored<UserRoleRecord[]>(STORAGE_KEYS.ROLES, []);

    users.push(profile);
    roles.push({ uid, role: 'super_admin' });

    this.setStored(STORAGE_KEYS.USERS, users);
    this.setStored(STORAGE_KEYS.ROLES, roles);

    const session = { profile, role: 'super_admin' as const };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));

    await this.logAudit({
      action: 'create',
      entity: 'user',
      entityId: uid,
      userId: uid,
      userName: name,
      departmentId: 'ALL',
      details: 'First Super Admin account provisioned.',
    });

    return session;
  }

  // --- Departments ---
  async getDepartments(): Promise<Department[]> {
    return this.getStored<Department[]>(STORAGE_KEYS.DEPARTMENTS, SEED_DEPARTMENTS).sort(
      (a, b) => a.order - b.order
    );
  }

  async getDepartment(id: string): Promise<Department | null> {
    const list = await this.getDepartments();
    return list.find((d) => d.id === id) || null;
  }

  async saveDepartment(dept: Department): Promise<void> {
    const list = await this.getDepartments();
    const index = list.findIndex((d) => d.id === dept.id);
    if (index >= 0) {
      list[index] = dept;
    } else {
      list.push(dept);
    }
    this.setStored(STORAGE_KEYS.DEPARTMENTS, list);
  }

  // --- Objectives ---
  async getObjectives(deptId?: string): Promise<DepartmentObjective[]> {
    const list = this.getStored<DepartmentObjective[]>(STORAGE_KEYS.OBJECTIVES, SEED_OBJECTIVES);
    if (!deptId || deptId === 'ALL') return list;
    return list.filter((o) => o.departmentId === deptId).sort((a, b) => a.order - b.order);
  }

  async saveObjective(obj: DepartmentObjective): Promise<void> {
    const list = this.getStored<DepartmentObjective[]>(STORAGE_KEYS.OBJECTIVES, []);
    const index = list.findIndex((o) => o.id === obj.id);
    if (index >= 0) {
      list[index] = obj;
    } else {
      list.push(obj);
    }
    this.setStored(STORAGE_KEYS.OBJECTIVES, list);
  }

  async deleteObjective(id: string): Promise<void> {
    const list = this.getStored<DepartmentObjective[]>(STORAGE_KEYS.OBJECTIVES, []);
    this.setStored(
      STORAGE_KEYS.OBJECTIVES,
      list.filter((o) => o.id !== id)
    );
  }

  // --- KPI Templates ---
  async getKPITemplates(deptId: string): Promise<KPITemplate[]> {
    const list = this.getStored<KPITemplate[]>(STORAGE_KEYS.KPI_TEMPLATES, SEED_KPI_TEMPLATES);
    const deptTemplates = list.filter((t) => t.departmentId === deptId);
    if (deptTemplates.length > 0) {
      return deptTemplates.sort((a, b) => a.order - b.order);
    }
    // Return default generic templates mapped for this department
    const generic = list.filter((t) => t.departmentId === 'default');
    return generic.map((g) => ({
      ...g,
      departmentId: deptId,
      id: `${g.id}-${deptId}`,
    }));
  }

  async saveKPITemplate(template: KPITemplate): Promise<void> {
    const list = this.getStored<KPITemplate[]>(STORAGE_KEYS.KPI_TEMPLATES, []);
    const index = list.findIndex((t) => t.id === template.id);
    if (index >= 0) {
      list[index] = template;
    } else {
      list.push(template);
    }
    this.setStored(STORAGE_KEYS.KPI_TEMPLATES, list);
  }

  async deleteKPITemplate(id: string): Promise<void> {
    const list = this.getStored<KPITemplate[]>(STORAGE_KEYS.KPI_TEMPLATES, []);
    this.setStored(
      STORAGE_KEYS.KPI_TEMPLATES,
      list.filter((t) => t.id !== id)
    );
  }

  // --- Employees ---
  async getEmployees(deptId?: string): Promise<Employee[]> {
    const list = this.getStored<Employee[]>(STORAGE_KEYS.EMPLOYEES, SEED_EMPLOYEES);
    if (!deptId || deptId === 'ALL') return list;
    return list.filter((e) => e.departmentId === deptId);
  }

  async getEmployee(employeeId: string): Promise<Employee | null> {
    const list = this.getStored<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
    return (
      list.find((e) => e.employeeId.trim().toUpperCase() === employeeId.trim().toUpperCase()) ||
      null
    );
  }

  async saveEmployee(emp: Employee): Promise<void> {
    const list = this.getStored<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
    const cleanId = emp.employeeId.trim().toUpperCase();
    const index = list.findIndex((e) => e.employeeId.trim().toUpperCase() === cleanId);

    const currentUser = await this.getCurrentUser();

    if (index >= 0) {
      const before = list[index];
      list[index] = { ...emp, employeeId: cleanId };
      this.setStored(STORAGE_KEYS.EMPLOYEES, list);
      await this.logAudit({
        action: 'update',
        entity: 'employee',
        entityId: cleanId,
        userId: currentUser?.profile.uid || 'admin',
        userName: currentUser?.profile.name || 'System',
        departmentId: emp.departmentId,
        details: `Updated details for employee ${emp.name} (${cleanId}).`,
        before,
        after: emp,
      });
    } else {
      list.push({ ...emp, employeeId: cleanId });
      this.setStored(STORAGE_KEYS.EMPLOYEES, list);
      await this.logAudit({
        action: 'create',
        entity: 'employee',
        entityId: cleanId,
        userId: currentUser?.profile.uid || 'admin',
        userName: currentUser?.profile.name || 'System',
        departmentId: emp.departmentId,
        details: `Added new employee ${emp.name} (${cleanId}).`,
        after: emp,
      });
    }
  }

  async deactivateEmployee(employeeId: string): Promise<void> {
    const list = this.getStored<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
    const cleanId = employeeId.trim().toUpperCase();
    const emp = list.find((e) => e.employeeId.trim().toUpperCase() === cleanId);
    if (emp) {
      emp.active = !emp.active;
      this.setStored(STORAGE_KEYS.EMPLOYEES, list);
      const currentUser = await this.getCurrentUser();
      await this.logAudit({
        action: 'update',
        entity: 'employee',
        entityId: cleanId,
        userId: currentUser?.profile.uid || 'admin',
        userName: currentUser?.profile.name || 'System',
        departmentId: emp.departmentId,
        details: `Toggled active status of employee ${emp.name} (${cleanId}) to ${emp.active}.`,
      });
    }
  }

  async bulkImportEmployees(
    incoming: Employee[]
  ): Promise<{ added: number; updated: number; errors: string[] }> {
    const list = this.getStored<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
    let added = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const item of incoming) {
      if (!item.employeeId || !item.name || !item.departmentId) {
        errors.push(`Row missing ID, Name or Department: ${JSON.stringify(item)}`);
        continue;
      }
      const cleanId = item.employeeId.trim().toUpperCase();
      const existingIdx = list.findIndex(
        (e) => e.employeeId.trim().toUpperCase() === cleanId
      );
      if (existingIdx >= 0) {
        list[existingIdx] = { ...item, employeeId: cleanId };
        updated++;
      } else {
        list.push({ ...item, employeeId: cleanId });
        added++;
      }
    }

    this.setStored(STORAGE_KEYS.EMPLOYEES, list);
    return { added, updated, errors };
  }

  // --- Evaluations ---
  async getEvaluations(deptId?: string): Promise<Evaluation[]> {
    const list = this.getStored<Evaluation[]>(STORAGE_KEYS.EVALUATIONS, []);
    if (!deptId || deptId === 'ALL') return list;
    return list.filter((ev) => ev.departmentId === deptId);
  }

  async getEvaluation(id: string): Promise<Evaluation | null> {
    const list = this.getStored<Evaluation[]>(STORAGE_KEYS.EVALUATIONS, []);
    return list.find((ev) => ev.id === id) || null;
  }

  async saveEvaluation(evaluation: Evaluation): Promise<void> {
    const list = this.getStored<Evaluation[]>(STORAGE_KEYS.EVALUATIONS, []);
    const index = list.findIndex((ev) => ev.id === evaluation.id);
    const currentUser = await this.getCurrentUser();

    if (index >= 0) {
      const existing = list[index];
      // Check immutability if submitted/approved and not super admin
      if (
        (existing.status === 'submitted' || existing.status === 'approved') &&
        currentUser?.role !== 'super_admin' &&
        evaluation.status !== 'reopened'
      ) {
        throw new Error('Evaluation is locked and cannot be edited without Super Admin reopen approval.');
      }
      list[index] = evaluation;
    } else {
      list.push(evaluation);
    }

    this.setStored(STORAGE_KEYS.EVALUATIONS, list);

    await this.logAudit({
      action: evaluation.status === 'submitted' ? 'submit' : 'update',
      entity: 'evaluation',
      entityId: evaluation.id,
      userId: currentUser?.profile.uid || 'evaluator',
      userName: currentUser?.profile.name || 'Evaluator',
      departmentId: evaluation.departmentId,
      details: `Evaluation for ${evaluation.employeeName} (${evaluation.employeeId}) saved as ${evaluation.status} (Score: ${evaluation.finalScore}).`,
    });
  }

  async approveEvaluation(id: string, approverName: string): Promise<void> {
    const list = this.getStored<Evaluation[]>(STORAGE_KEYS.EVALUATIONS, []);
    const ev = list.find((e) => e.id === id);
    if (!ev) throw new Error('Evaluation not found.');

    ev.status = 'approved';
    ev.approvedBy = approverName;
    ev.approvedAt = new Date().toISOString();
    ev.updatedAt = new Date().toISOString();

    this.setStored(STORAGE_KEYS.EVALUATIONS, list);

    const currentUser = await this.getCurrentUser();
    await this.logAudit({
      action: 'approve',
      entity: 'evaluation',
      entityId: ev.id,
      userId: currentUser?.profile.uid || 'dept_head',
      userName: approverName,
      departmentId: ev.departmentId,
      details: `Evaluation for ${ev.employeeName} approved with final score ${ev.finalScore} (${ev.grade}).`,
    });
  }

  async reopenEvaluation(id: string, adminName: string): Promise<void> {
    const list = this.getStored<Evaluation[]>(STORAGE_KEYS.EVALUATIONS, []);
    const ev = list.find((e) => e.id === id);
    if (!ev) throw new Error('Evaluation not found.');

    ev.status = 'reopened';
    ev.reopenedBy = adminName;
    ev.reopenedAt = new Date().toISOString();
    ev.updatedAt = new Date().toISOString();

    this.setStored(STORAGE_KEYS.EVALUATIONS, list);

    const currentUser = await this.getCurrentUser();
    await this.logAudit({
      action: 'reopen',
      entity: 'evaluation',
      entityId: ev.id,
      userId: currentUser?.profile.uid || 'super_admin',
      userName: adminName,
      departmentId: ev.departmentId,
      details: `Evaluation for ${ev.employeeName} unlocked and reopened by Super Admin.`,
    });
  }

  async deleteEvaluation(id: string): Promise<void> {
    const list = this.getStored<Evaluation[]>(STORAGE_KEYS.EVALUATIONS, []);
    const ev = list.find((e) => e.id === id);
    if (!ev) return;

    this.setStored(
      STORAGE_KEYS.EVALUATIONS,
      list.filter((e) => e.id !== id)
    );

    const currentUser = await this.getCurrentUser();
    await this.logAudit({
      action: 'delete',
      entity: 'evaluation',
      entityId: id,
      userId: currentUser?.profile.uid || 'admin',
      userName: currentUser?.profile.name || 'Admin',
      departmentId: ev.departmentId,
      details: `Deleted draft evaluation for ${ev.employeeName}.`,
    });
  }

  // --- Users & Roles ---
  async getUsers(): Promise<{ profile: UserProfile; role: UserRole }[]> {
    const profiles = this.getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
    const roles = this.getStored<UserRoleRecord[]>(STORAGE_KEYS.ROLES, []);

    return profiles.map((p) => {
      const r = roles.find((role) => role.uid === p.uid);
      return {
        profile: p,
        role: r ? r.role : 'viewer',
      };
    });
  }

  async createUser(
    name: string,
    email: string,
    _password: string,
    departmentId: string,
    role: UserRole
  ): Promise<void> {
    const users = this.getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
    const roles = this.getStored<UserRoleRecord[]>(STORAGE_KEYS.ROLES, []);

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error(`A user with email ${email} already exists.`);
    }

    const uid = 'usr-' + Math.random().toString(36).substring(2, 9);
    const profile: UserProfile = {
      uid,
      name,
      email,
      departmentId,
      active: true,
      createdAt: new Date().toISOString(),
    };

    users.push(profile);
    roles.push({ uid, role });

    this.setStored(STORAGE_KEYS.USERS, users);
    this.setStored(STORAGE_KEYS.ROLES, roles);

    const currentUser = await this.getCurrentUser();
    await this.logAudit({
      action: 'create',
      entity: 'user',
      entityId: uid,
      userId: currentUser?.profile.uid || 'admin',
      userName: currentUser?.profile.name || 'Admin',
      departmentId,
      details: `Created new user account for ${name} (${email}) with role ${role} in department ${departmentId}.`,
    });
  }

  async toggleUserActive(uid: string, active: boolean): Promise<void> {
    const users = this.getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
    const u = users.find((item) => item.uid === uid);
    if (u) {
      u.active = active;
      this.setStored(STORAGE_KEYS.USERS, users);
      const currentUser = await this.getCurrentUser();
      await this.logAudit({
        action: 'user_role_change',
        entity: 'user',
        entityId: uid,
        userId: currentUser?.profile.uid || 'admin',
        userName: currentUser?.profile.name || 'Admin',
        departmentId: u.departmentId,
        details: `Updated active status of user ${u.name} to ${active}.`,
      });
    }
  }

  async updateUserRoleAndDept(
    uid: string,
    role: UserRole,
    departmentId: string
  ): Promise<void> {
    const users = this.getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
    const roles = this.getStored<UserRoleRecord[]>(STORAGE_KEYS.ROLES, []);

    const user = users.find((u) => u.uid === uid);
    if (user) {
      user.departmentId = departmentId;
      this.setStored(STORAGE_KEYS.USERS, users);
    }

    const roleIdx = roles.findIndex((r) => r.uid === uid);
    if (roleIdx >= 0) {
      roles[roleIdx].role = role;
    } else {
      roles.push({ uid, role });
    }
    this.setStored(STORAGE_KEYS.ROLES, roles);

    const currentUser = await this.getCurrentUser();
    await this.logAudit({
      action: 'user_role_change',
      entity: 'user',
      entityId: uid,
      userId: currentUser?.profile.uid || 'admin',
      userName: currentUser?.profile.name || 'Admin',
      departmentId,
      details: `Changed role to ${role} and department to ${departmentId} for user ${user?.name || uid}.`,
    });
  }

  // --- Grade Bands ---
  async getGradeBands(): Promise<GradeBand[]> {
    return this.getStored<GradeBand[]>(STORAGE_KEYS.GRADE_BANDS, DEFAULT_GRADE_BANDS);
  }

  async saveGradeBands(bands: GradeBand[]): Promise<void> {
    this.setStored(STORAGE_KEYS.GRADE_BANDS, bands);
    const currentUser = await this.getCurrentUser();
    await this.logAudit({
      action: 'update',
      entity: 'settings',
      entityId: 'gradeBands',
      userId: currentUser?.profile.uid || 'admin',
      userName: currentUser?.profile.name || 'Admin',
      departmentId: 'ALL',
      details: 'Updated hospital performance grade bands configuration.',
    });
  }

  // --- Audit Log ---
  async getAuditLogs(deptId?: string): Promise<AuditLogEntry[]> {
    const list = this.getStored<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    if (!deptId || deptId === 'ALL') return list.slice().reverse();
    return list.filter((l) => l.departmentId === deptId || l.departmentId === 'ALL').reverse();
  }

  async logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const list = this.getStored<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    const newEntry: AuditLogEntry = {
      ...entry,
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
    };
    list.push(newEntry);
    this.setStored(STORAGE_KEYS.AUDIT_LOGS, list);
  }

  async seedData(): Promise<void> {
    this.resetToSeed();
  }
}
