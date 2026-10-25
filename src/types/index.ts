export type DepartmentType = 'clinical' | 'non_clinical';

export type UserRole = 'super_admin' | 'dept_head' | 'evaluator' | 'viewer';

export type BSCCategory = 
  | 'financial' 
  | 'customer' 
  | 'internal_process' 
  | 'learning_growth' 
  | 'individual_performance';

export type EvaluationPeriodType = 'monthly' | 'quarterly' | 'annual';

export type EvaluationStatus = 'draft' | 'submitted' | 'approved' | 'reopened';

export interface Department {
  id: string; // e.g., 'cd1', 'ncd02'
  code: string; // e.g., 'CD1', 'NCD02'
  name: string;
  type: DepartmentType;
  colour: string; // Hex color
  icon: string; // Lucide icon key
  active: boolean;
  order: number;
}

export interface DepartmentObjective {
  id: string;
  departmentId: string;
  text: string;
  bscCategory: BSCCategory;
  order: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  departmentId: string; // 'ALL' for super_admin or specific dept id
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface UserRoleRecord {
  uid: string;
  role: UserRole;
}

export interface Employee {
  employeeId: string; // e.g. NH-CD5-001
  name: string;
  designation: string;
  departmentId: string;
  email: string;
  joinDate: string; // YYYY-MM-DD
  active: boolean;
  avatarUrl?: string;
}

export interface KPITemplate {
  id: string;
  departmentId: string;
  bscCategory: BSCCategory;
  kpiName: string;
  target: string;
  unit: string;
  order: number;
}

export interface EvaluationItem {
  id: string;
  bscCategory: BSCCategory;
  kpiName: string;
  target: string;
  actual: string;
  rating: number; // 1 to 5
  comment?: string;
}

export interface CategoryScore {
  category: BSCCategory;
  weight: number; // e.g. 20, 25, 15
  avgRating: number; // 1 to 5
  score: number; // calculated category score
}

export interface Evaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  departmentId: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: UserRole;
  periodType: EvaluationPeriodType;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  status: EvaluationStatus;
  items: EvaluationItem[];
  categoryScores: Record<BSCCategory, CategoryScore>;
  finalScore: number; // 0 - 100
  grade: string; // e.g. 'Outstanding'
  strengths: string;
  improvements: string;
  comments: string;
  approvedBy?: string;
  approvedAt?: string;
  reopenedBy?: string;
  reopenedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GradeBand {
  id: string;
  name: string;
  minScore: number;
  maxScore: number;
  colour: string;
  badgeClass: string;
  description: string;
}

export interface AuditLogEntry {
  id: string;
  action: 'create' | 'update' | 'submit' | 'approve' | 'reopen' | 'delete' | 'user_role_change' | 'login';
  entity: 'evaluation' | 'employee' | 'user' | 'department' | 'kpi_template' | 'settings';
  entityId: string;
  userId: string;
  userName: string;
  departmentId: string;
  details: string;
  before?: any;
  after?: any;
  timestamp: string;
}

export interface BSCMeta {
  key: BSCCategory;
  label: string;
  weight: number;
  focus: string;
  colour: string; // Primary hex
  lightBg: string;
  borderColour: string;
  badgeClass: string;
}
