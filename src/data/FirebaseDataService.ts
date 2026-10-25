import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
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
import { firebaseConfig } from '../firebase/config';
import {
  SEED_DEPARTMENTS,
  SEED_OBJECTIVES,
  SEED_KPI_TEMPLATES,
  SEED_EMPLOYEES,
  generateSeedEvaluations,
} from './seed';
import { DEFAULT_GRADE_BANDS } from '../lib/scoring';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  auth: Auth
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export class FirebaseDataService implements DataService {
  readonly isDemo = false;
  private app: FirebaseApp;
  private db: Firestore;
  private auth: Auth;

  constructor() {
    this.app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    this.db = firebaseConfig.firestoreDatabaseId
      ? getFirestore(this.app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(this.app);
    this.auth = getAuth(this.app);
  }

  // --- Auth & Session ---
  async getCurrentUser(): Promise<{ profile: UserProfile; role: UserRole } | null> {
    const user = this.auth.currentUser;
    if (!user) return null;

    try {
      const profileSnap = await getDoc(doc(this.db, 'users', user.uid));
      if (!profileSnap.exists()) return null;
      const profile = profileSnap.data() as UserProfile;

      const roleSnap = await getDoc(doc(this.db, 'userRoles', user.uid));
      const role = (roleSnap.exists() ? (roleSnap.data() as UserRoleRecord).role : 'viewer') as UserRole;

      return { profile, role };
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `users/${user.uid}`, this.auth);
    }
  }

  async login(
    email: string,
    password: string,
    selectedDeptId: string
  ): Promise<{ profile: UserProfile; role: UserRole }> {
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      const uid = cred.user.uid;

      const profileSnap = await getDoc(doc(this.db, 'users', uid));
      if (!profileSnap.exists()) {
        await signOut(this.auth);
        throw new Error('User profile record not found. Please contact administration.');
      }
      const profile = profileSnap.data() as UserProfile;

      if (!profile.active) {
        await signOut(this.auth);
        throw new Error('Your account has been deactivated. Please contact the administrator.');
      }

      const roleSnap = await getDoc(doc(this.db, 'userRoles', uid));
      const role = (roleSnap.exists() ? (roleSnap.data() as UserRoleRecord).role : 'viewer') as UserRole;

      // Department verification: super_admin can enter any department
      if (role !== 'super_admin' && profile.departmentId !== selectedDeptId) {
        await signOut(this.auth);
        throw new Error(
          `Access Denied: Your assigned department does not match the selected department. Please return to the portal and select your department.`
        );
      }

      // Update last login
      await updateDoc(doc(this.db, 'users', uid), {
        lastLogin: new Date().toISOString(),
      });

      await this.logAudit({
        action: 'login',
        entity: 'user',
        entityId: uid,
        userId: uid,
        userName: profile.name,
        departmentId: selectedDeptId,
        details: `User logged in to department ${selectedDeptId}.`,
      });

      return { profile, role };
    } catch (err: any) {
      if (err.message && err.message.startsWith('{')) {
        throw err;
      }
      throw new Error(err.message || 'Login failed.');
    }
  }

  async logout(): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      await this.logAudit({
        action: 'login',
        entity: 'user',
        entityId: user.uid,
        userId: user.uid,
        userName: user.email || 'User',
        departmentId: 'ALL',
        details: 'User signed out.',
      });
    }
    await signOut(this.auth);
  }

  async checkSuperAdminExists(): Promise<boolean> {
    try {
      const q = query(collection(this.db, 'userRoles'), where('role', '==', 'super_admin'));
      const snap = await getDocs(q);
      return !snap.empty;
    } catch {
      return false;
    }
  }

  async createFirstSuperAdmin(
    name: string,
    email: string,
    password: string
  ): Promise<{ profile: UserProfile; role: UserRole }> {
    const exists = await this.checkSuperAdminExists();
    if (exists) {
      throw new Error('Super Admin already exists.');
    }

    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    const uid = cred.user.uid;

    const profile: UserProfile = {
      uid,
      name,
      email,
      departmentId: 'ALL',
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    await setDoc(doc(this.db, 'users', uid), profile);
    await setDoc(doc(this.db, 'userRoles', uid), { uid, role: 'super_admin' });

    await this.logAudit({
      action: 'create',
      entity: 'user',
      entityId: uid,
      userId: uid,
      userName: name,
      departmentId: 'ALL',
      details: 'First Super Admin account provisioned in Firebase.',
    });

    return { profile, role: 'super_admin' };
  }

  // --- Departments ---
  async getDepartments(): Promise<Department[]> {
    try {
      const snap = await getDocs(collection(this.db, 'departments'));
      if (snap.empty) {
        return SEED_DEPARTMENTS;
      }
      return snap.docs
        .map((d) => d.data() as Department)
        .sort((a, b) => a.order - b.order);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'departments', this.auth);
    }
  }

  async getDepartment(id: string): Promise<Department | null> {
    try {
      const snap = await getDoc(doc(this.db, 'departments', id));
      return snap.exists() ? (snap.data() as Department) : null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `departments/${id}`, this.auth);
    }
  }

  async saveDepartment(dept: Department): Promise<void> {
    try {
      await setDoc(doc(this.db, 'departments', dept.id), dept);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `departments/${dept.id}`, this.auth);
    }
  }

  // --- Objectives ---
  async getObjectives(deptId?: string): Promise<DepartmentObjective[]> {
    try {
      let q = collection(this.db, 'departmentObjectives') as any;
      if (deptId && deptId !== 'ALL') {
        q = query(collection(this.db, 'departmentObjectives'), where('departmentId', '==', deptId));
      }
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => d.data() as DepartmentObjective)
        .sort((a, b) => a.order - b.order);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'departmentObjectives', this.auth);
    }
  }

  async saveObjective(obj: DepartmentObjective): Promise<void> {
    try {
      await setDoc(doc(this.db, 'departmentObjectives', obj.id), obj);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `departmentObjectives/${obj.id}`, this.auth);
    }
  }

  async deleteObjective(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, 'departmentObjectives', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `departmentObjectives/${id}`, this.auth);
    }
  }

  // --- KPI Templates ---
  async getKPITemplates(deptId: string): Promise<KPITemplate[]> {
    try {
      const q = query(collection(this.db, 'kpiTemplates'), where('departmentId', '==', deptId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs
          .map((d) => d.data() as KPITemplate)
          .sort((a, b) => a.order - b.order);
      }
      // fallback generic templates
      return SEED_KPI_TEMPLATES.filter((t) => t.departmentId === 'default').map((g) => ({
        ...g,
        departmentId: deptId,
        id: `${g.id}-${deptId}`,
      }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'kpiTemplates', this.auth);
    }
  }

  async saveKPITemplate(template: KPITemplate): Promise<void> {
    try {
      await setDoc(doc(this.db, 'kpiTemplates', template.id), template);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `kpiTemplates/${template.id}`, this.auth);
    }
  }

  async deleteKPITemplate(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, 'kpiTemplates', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `kpiTemplates/${id}`, this.auth);
    }
  }

  // --- Employees ---
  async getEmployees(deptId?: string): Promise<Employee[]> {
    try {
      let q = collection(this.db, 'employees') as any;
      if (deptId && deptId !== 'ALL') {
        q = query(collection(this.db, 'employees'), where('departmentId', '==', deptId));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as Employee);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'employees', this.auth);
    }
  }

  async getEmployee(employeeId: string): Promise<Employee | null> {
    try {
      const snap = await getDoc(doc(this.db, 'employees', employeeId.trim().toUpperCase()));
      return snap.exists() ? (snap.data() as Employee) : null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `employees/${employeeId}`, this.auth);
    }
  }

  async saveEmployee(emp: Employee): Promise<void> {
    const cleanId = emp.employeeId.trim().toUpperCase();
    try {
      await setDoc(doc(this.db, 'employees', cleanId), { ...emp, employeeId: cleanId });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `employees/${cleanId}`, this.auth);
    }
  }

  async deactivateEmployee(employeeId: string): Promise<void> {
    const cleanId = employeeId.trim().toUpperCase();
    try {
      const emp = await this.getEmployee(cleanId);
      if (emp) {
        await updateDoc(doc(this.db, 'employees', cleanId), {
          active: !emp.active,
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `employees/${cleanId}`, this.auth);
    }
  }

  async bulkImportEmployees(
    incoming: Employee[]
  ): Promise<{ added: number; updated: number; errors: string[] }> {
    let added = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const item of incoming) {
      try {
        const cleanId = item.employeeId.trim().toUpperCase();
        const existing = await this.getEmployee(cleanId);
        await setDoc(doc(this.db, 'employees', cleanId), { ...item, employeeId: cleanId });
        if (existing) updated++;
        else added++;
      } catch (err: any) {
        errors.push(`Error importing ${item.employeeId}: ${err.message}`);
      }
    }
    return { added, updated, errors };
  }

  // --- Evaluations ---
  async getEvaluations(deptId?: string): Promise<Evaluation[]> {
    try {
      let q = collection(this.db, 'evaluations') as any;
      if (deptId && deptId !== 'ALL') {
        q = query(collection(this.db, 'evaluations'), where('departmentId', '==', deptId));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as Evaluation);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'evaluations', this.auth);
    }
  }

  async getEvaluation(id: string): Promise<Evaluation | null> {
    try {
      const snap = await getDoc(doc(this.db, 'evaluations', id));
      return snap.exists() ? (snap.data() as Evaluation) : null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `evaluations/${id}`, this.auth);
    }
  }

  async saveEvaluation(evaluation: Evaluation): Promise<void> {
    try {
      await setDoc(doc(this.db, 'evaluations', evaluation.id), evaluation);
      await this.logAudit({
        action: evaluation.status === 'submitted' ? 'submit' : 'update',
        entity: 'evaluation',
        entityId: evaluation.id,
        userId: this.auth.currentUser?.uid || 'user',
        userName: this.auth.currentUser?.displayName || 'Evaluator',
        departmentId: evaluation.departmentId,
        details: `Saved evaluation for ${evaluation.employeeName} (${evaluation.employeeId}) as ${evaluation.status}.`,
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `evaluations/${evaluation.id}`, this.auth);
    }
  }

  async approveEvaluation(id: string, approverName: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'evaluations', id), {
        status: 'approved',
        approvedBy: approverName,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `evaluations/${id}`, this.auth);
    }
  }

  async reopenEvaluation(id: string, adminName: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'evaluations', id), {
        status: 'reopened',
        reopenedBy: adminName,
        reopenedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `evaluations/${id}`, this.auth);
    }
  }

  async deleteEvaluation(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, 'evaluations', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `evaluations/${id}`, this.auth);
    }
  }

  // --- Users & Roles ---
  async getUsers(): Promise<{ profile: UserProfile; role: UserRole }[]> {
    try {
      const snapUsers = await getDocs(collection(this.db, 'users'));
      const snapRoles = await getDocs(collection(this.db, 'userRoles'));

      const rolesMap = new Map<string, UserRole>();
      snapRoles.docs.forEach((d) => {
        const data = d.data() as UserRoleRecord;
        rolesMap.set(data.uid, data.role);
      });

      return snapUsers.docs.map((d) => {
        const profile = d.data() as UserProfile;
        return {
          profile,
          role: rolesMap.get(profile.uid) || 'viewer',
        };
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'users', this.auth);
    }
  }

  async createUser(
    name: string,
    email: string,
    password: string,
    departmentId: string,
    role: UserRole
  ): Promise<void> {
    // Secondary Firebase App to avoid signing out current Super Admin!
    const secondaryApp = initializeApp(firebaseConfig, 'SecondaryAuth_' + Date.now());
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const uid = cred.user.uid;

      const profile: UserProfile = {
        uid,
        name,
        email,
        departmentId,
        active: true,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(this.db, 'users', uid), profile);
      await setDoc(doc(this.db, 'userRoles', uid), { uid, role });

      await signOut(secondaryAuth);
    } catch (err: any) {
      throw new Error(`Failed to create user in Firebase: ${err.message}`);
    }
  }

  async toggleUserActive(uid: string, active: boolean): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'users', uid), { active });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`, this.auth);
    }
  }

  async updateUserRoleAndDept(
    uid: string,
    role: UserRole,
    departmentId: string
  ): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'users', uid), { departmentId });
      await setDoc(doc(this.db, 'userRoles', uid), { uid, role });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `userRoles/${uid}`, this.auth);
    }
  }

  // --- Grade Bands ---
  async getGradeBands(): Promise<GradeBand[]> {
    try {
      const snap = await getDoc(doc(this.db, 'settings', 'gradeBands'));
      if (snap.exists() && snap.data().bands) {
        return snap.data().bands as GradeBand[];
      }
      return DEFAULT_GRADE_BANDS;
    } catch {
      return DEFAULT_GRADE_BANDS;
    }
  }

  async saveGradeBands(bands: GradeBand[]): Promise<void> {
    try {
      await setDoc(doc(this.db, 'settings', 'gradeBands'), { bands });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/gradeBands', this.auth);
    }
  }

  // --- Audit Log ---
  async getAuditLogs(deptId?: string): Promise<AuditLogEntry[]> {
    try {
      let q = collection(this.db, 'auditLog') as any;
      if (deptId && deptId !== 'ALL') {
        q = query(collection(this.db, 'auditLog'), where('departmentId', '==', deptId));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as AuditLogEntry).reverse();
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'auditLog', this.auth);
    }
  }

  async logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const id = 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const docData: AuditLogEntry = {
        ...entry,
        id,
        timestamp: new Date().toISOString(),
      };
      await setDoc(doc(this.db, 'auditLog', id), docData);
    } catch (e) {
      console.warn('Could not write audit log:', e);
    }
  }

  // --- Seed Data into Firestore ---
  async seedData(): Promise<void> {
    for (const d of SEED_DEPARTMENTS) {
      await setDoc(doc(this.db, 'departments', d.id), d);
    }
    for (const o of SEED_OBJECTIVES) {
      await setDoc(doc(this.db, 'departmentObjectives', o.id), o);
    }
    for (const k of SEED_KPI_TEMPLATES) {
      await setDoc(doc(this.db, 'kpiTemplates', k.id), k);
    }
    for (const e of SEED_EMPLOYEES) {
      await setDoc(doc(this.db, 'employees', e.employeeId), e);
    }
    for (const ev of generateSeedEvaluations()) {
      await setDoc(doc(this.db, 'evaluations', ev.id), ev);
    }
    await setDoc(doc(this.db, 'settings', 'gradeBands'), { bands: DEFAULT_GRADE_BANDS });
  }
}
