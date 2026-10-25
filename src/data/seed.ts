import { Department, DepartmentObjective, Employee, KPITemplate, UserProfile, UserRoleRecord, Evaluation } from '../types';
import { calculateEvaluationScore } from '../lib/scoring';

export const SEED_DEPARTMENTS: Department[] = [
  // Clinical Departments (8) - Teal Theme (#1A9BB0)
  {
    id: 'cd1',
    code: 'CD1',
    name: 'Medical Administration',
    type: 'clinical',
    colour: '#1A9BB0',
    icon: 'Stethoscope',
    active: true,
    order: 1,
  },
  {
    id: 'cd2',
    code: 'CD2',
    name: 'Nursing Services',
    type: 'clinical',
    colour: '#14B8A6',
    icon: 'HeartPulse',
    active: true,
    order: 2,
  },
  {
    id: 'cd3',
    code: 'CD3',
    name: 'Operation Theatre',
    type: 'clinical',
    colour: '#0D9488',
    icon: 'Syringe',
    active: true,
    order: 3,
  },
  {
    id: 'cd4',
    code: 'CD4',
    name: 'Heart Center',
    type: 'clinical',
    colour: '#0891B2',
    icon: 'Activity',
    active: true,
    order: 4,
  },
  {
    id: 'cd5',
    code: 'CD5',
    name: 'Pharmacy',
    type: 'clinical',
    colour: '#0284C7',
    icon: 'Pill',
    active: true,
    order: 5,
  },
  {
    id: 'cd6',
    code: 'CD6',
    name: 'Laboratory Services',
    type: 'clinical',
    colour: '#059669',
    icon: 'Microscope',
    active: true,
    order: 6,
  },
  {
    id: 'cd7',
    code: 'CD7',
    name: 'Radiology & Imaging',
    type: 'clinical',
    colour: '#2563EB',
    icon: 'Scan',
    active: true,
    order: 7,
  },
  {
    id: 'cd8',
    code: 'CD8',
    name: 'Food & Beverage / Clinical Nutrition',
    type: 'clinical',
    colour: '#0D9488',
    icon: 'Utensils',
    active: true,
    order: 8,
  },

  // Non-Clinical Departments (9) - Orange Theme (#E8821E)
  {
    id: 'ncd01',
    code: 'NCD01',
    name: 'Compliance & Governance',
    type: 'non_clinical',
    colour: '#E8821E',
    icon: 'ShieldCheck',
    active: true,
    order: 9,
  },
  {
    id: 'ncd02',
    code: 'NCD02',
    name: 'Finance & Accounts',
    type: 'non_clinical',
    colour: '#D97706',
    icon: 'DollarSign',
    active: true,
    order: 10,
  },
  {
    id: 'ncd03',
    code: 'NCD03',
    name: 'Information Technology (IT)',
    type: 'non_clinical',
    colour: '#F97316',
    icon: 'Server',
    active: true,
    order: 11,
  },
  {
    id: 'ncd04',
    code: 'NCD04',
    name: 'Human Resources (HR)',
    type: 'non_clinical',
    colour: '#EA580C',
    icon: 'Users',
    active: true,
    order: 12,
  },
  {
    id: 'ncd05',
    code: 'NCD05',
    name: 'Biomedical Engineering',
    type: 'non_clinical',
    colour: '#C2410C',
    icon: 'Cpu',
    active: true,
    order: 13,
  },
  {
    id: 'ncd06',
    code: 'NCD06',
    name: 'Facility Management',
    type: 'non_clinical',
    colour: '#B45309',
    icon: 'Building2',
    active: true,
    order: 14,
  },
  {
    id: 'ncd07',
    code: 'NCD07',
    name: 'Housekeeping & Laundry',
    type: 'non_clinical',
    colour: '#D97706',
    icon: 'Sparkles',
    active: true,
    order: 15,
  },
  {
    id: 'ncd08',
    code: 'NCD08',
    name: 'Marketing & Corporate Relations',
    type: 'non_clinical',
    colour: '#E8821E',
    icon: 'Megaphone',
    active: true,
    order: 16,
  },
  {
    id: 'ncd09',
    code: 'NCD09',
    name: 'Quality Assurance Department (QAD)',
    type: 'non_clinical',
    colour: '#F59E0B',
    icon: 'Award',
    active: true,
    order: 17,
  },
];

export const SEED_OBJECTIVES: DepartmentObjective[] = [
  // CD1 Medical Administration
  { id: 'obj-cd1-1', departmentId: 'cd1', text: 'Digital BHT & EMR implementation ≥80% across all wards by end-2026', bscCategory: 'internal_process', order: 1 },
  { id: 'obj-cd1-2', departmentId: 'cd1', text: 'Hospital-Acquired Infections (HAIs) reduction of 10% per annum', bscCategory: 'customer', order: 2 },
  { id: 'obj-cd1-3', departmentId: 'cd1', text: '100% adherence to quarterly clinical and antibiotic stewardship audits', bscCategory: 'learning_growth', order: 3 },
  { id: 'obj-cd1-4', departmentId: 'cd1', text: 'Optimize clinical supply chain and medical documentation costs', bscCategory: 'financial', order: 4 },

  // CD2 Nursing
  { id: 'obj-cd2-1', departmentId: 'cd2', text: 'Safe, accountable 24/7 patient-centered clinical care delivery', bscCategory: 'customer', order: 1 },
  { id: 'obj-cd2-2', departmentId: 'cd2', text: 'Zero preventable inpatient falls and stage 2+ pressure ulcers', bscCategory: 'internal_process', order: 2 },
  { id: 'obj-cd2-3', departmentId: 'cd2', text: 'Nursing staff morale uplift and 100% sister/charge nurse succession planning', bscCategory: 'learning_growth', order: 3 },
  { id: 'obj-cd2-4', departmentId: 'cd2', text: 'Ward energy conservation and clinical consumable waste minimization', bscCategory: 'financial', order: 4 },

  // CD3 Operation Theatre
  { id: 'obj-cd3-1', departmentId: 'cd3', text: 'Achieve and maintain international surgical safety checklist compliance', bscCategory: 'internal_process', order: 1 },
  { id: 'obj-cd3-2', departmentId: 'cd3', text: 'Medical gas emissions down 80%, OT HVAC energy consumption down 30%', bscCategory: 'financial', order: 2 },
  { id: 'obj-cd3-3', departmentId: 'cd3', text: 'Generate LKR 10M+ cost savings per year through surgical supply optimization', bscCategory: 'financial', order: 3 },
  { id: 'obj-cd3-4', departmentId: 'cd3', text: 'Maintain regional clinical leadership with specialized minimally invasive surgery', bscCategory: 'customer', order: 4 },

  // CD4 Heart Center
  { id: 'obj-cd4-1', departmentId: 'cd4', text: 'Maintain >98% success rate in elective CABG and heart valve replacements', bscCategory: 'customer', order: 1 },
  { id: 'obj-cd4-2', departmentId: 'cd4', text: 'Green catheterization lab infrastructure and specialized HVAC control', bscCategory: 'internal_process', order: 2 },
  { id: 'obj-cd4-3', departmentId: 'cd4', text: 'Digital cardiology referrals and transparent fixed-cost cardiac packages', bscCategory: 'financial', order: 3 },
  { id: 'obj-cd4-4', departmentId: 'cd4', text: 'Launch telecardiology and AI-assisted ECG/Echo interpretation protocols', bscCategory: 'learning_growth', order: 4 },

  // CD5 Pharmacy
  { id: 'obj-cd5-1', departmentId: 'cd5', text: 'Maintain 99.9% critical and emergency medication availability across all dispensaries', bscCategory: 'customer', order: 1 },
  { id: 'obj-cd5-2', departmentId: 'cd5', text: 'Near-zero dispensing and prescription errors (<0.05% incidence rate)', bscCategory: 'internal_process', order: 2 },
  { id: 'obj-cd5-3', departmentId: 'cd5', text: 'Pharmaceutical expiry and write-off waste reduction of 15% via FEFO management', bscCategory: 'financial', order: 3 },
  { id: 'obj-cd5-4', departmentId: 'cd5', text: 'Comprehensive discharge patient counselling program reaching ≥90% of outpatients', bscCategory: 'customer', order: 4 },

  // CD6 Laboratory Services
  { id: 'obj-cd6-1', departmentId: 'cd6', text: 'Conduct 10,000+ tests/day under strict ISO 15189 accreditation standards', bscCategory: 'internal_process', order: 1 },
  { id: 'obj-cd6-2', departmentId: 'cd6', text: 'Maintain >96% Proficiency Testing (PT) scores across all pathology sub-disciplines', bscCategory: 'internal_process', order: 2 },
  { id: 'obj-cd6-3', departmentId: 'cd6', text: 'Achieve 95% urgent diagnostic Turnaround Time (TAT) within 60 minutes', bscCategory: 'customer', order: 3 },
  { id: 'obj-cd6-4', departmentId: 'cd6', text: 'Diagnostic reagent cost savings of LKR 5.7M/yr, water recycling 51,840 L/mo, paper −25%', bscCategory: 'financial', order: 4 },

  // CD7 Radiology
  { id: 'obj-cd7-1', departmentId: 'cd7', text: 'Shorter report turnaround time: emergency CT/MRI under 45 minutes', bscCategory: 'customer', order: 1 },
  { id: 'obj-cd7-2', departmentId: 'cd7', text: 'Integration of AI diagnostic triage tools for chest X-ray and stroke scans', bscCategory: 'learning_growth', order: 2 },
  { id: 'obj-cd7-3', departmentId: 'cd7', text: 'Maintain 99.5% scanner uptime through comprehensive predictive maintenance', bscCategory: 'internal_process', order: 3 },
  { id: 'obj-cd7-4', departmentId: 'cd7', text: 'Exceed 92% patient satisfaction index in imaging and ultrasound suites', bscCategory: 'customer', order: 4 },

  // CD8 Food & Beverage
  { id: 'obj-cd8-1', departmentId: 'cd8', text: '100% adherence to HACCP food safety standards and dietary clinical nutrition plans', bscCategory: 'internal_process', order: 1 },
  { id: 'obj-cd8-2', departmentId: 'cd8', text: 'Kitchen and meal tray organic food waste reduction by 20%', bscCategory: 'financial', order: 2 },
  { id: 'obj-cd8-3', departmentId: 'cd8', text: 'Patient and cafeteria satisfaction ≥90% across all hospital outlets', bscCategory: 'customer', order: 3 },
  { id: 'obj-cd8-4', departmentId: 'cd8', text: 'High-margin professional banquet and corporate catering revenue growth', bscCategory: 'financial', order: 4 },

  // NCD01 Compliance & Governance
  { id: 'obj-ncd01-1', departmentId: 'ncd01', text: 'Establish hospital-wide regulatory compliance matrix with 100% audit closure rate', bscCategory: 'internal_process', order: 1 },
  { id: 'obj-ncd01-2', departmentId: 'ncd01', text: 'Zero legal penalties and 100% adherence to Ministry of Health & PHSRC guidelines', bscCategory: 'financial', order: 2 },

  // NCD02 Finance
  { id: 'obj-ncd02-1', departmentId: 'ncd02', text: '80% routine accounting and billing process automation', bscCategory: 'internal_process', order: 1 },
  { id: 'obj-ncd02-2', departmentId: 'ncd02', text: 'Billing and claim processing errors reduced by 30% per year', bscCategory: 'internal_process', order: 2 },
  { id: 'obj-ncd02-3', departmentId: 'ncd02', text: 'AI-assisted revenue and cash-flow forecasting ≥90% accurate', bscCategory: 'learning_growth', order: 3 },
  { id: 'obj-ncd02-4', departmentId: 'ncd02', text: '100% statutory tax and financial reporting compliance with zero penalties', bscCategory: 'financial', order: 4 },
  { id: 'obj-ncd02-5', departmentId: 'ncd02', text: 'Paper use reduced by 80% with 30% green supplier procurement quotas', bscCategory: 'financial', order: 5 },

  // NCD03 IT
  { id: 'obj-ncd03-1', departmentId: 'ncd03', text: 'Infrastructure security hardening and ISO 27001 data governance certification', bscCategory: 'internal_process', order: 1 },
  { id: 'obj-ncd03-2', departmentId: 'ncd03', text: 'Modern Hospital Information System (HIS) with sub-second electronic records', bscCategory: 'internal_process', order: 2 },
  { id: 'obj-ncd03-3', departmentId: 'ncd03', text: 'AI predictive analytics for operational planning, revenue cycle and HR metrics', bscCategory: 'learning_growth', order: 3 },
  { id: 'obj-ncd03-4', departmentId: 'ncd03', text: 'Green IT data center initiative, carbon tracking and 99.99% core system uptime', bscCategory: 'financial', order: 4 },

  // NCD04 HR
  { id: 'obj-ncd04-1', departmentId: 'ncd04', text: 'Lower clinical and administrative staff voluntary turnover by 15%', bscCategory: 'internal_process', order: 1 },
  { id: 'obj-ncd04-2', departmentId: 'ncd04', text: 'Reduce vacancy recruitment cycle time to <21 days for critical care roles', bscCategory: 'customer', order: 2 },
  { id: 'obj-ncd04-3', departmentId: 'ncd04', text: 'Provide minimum 24 hours of structured CPD training per employee per year', bscCategory: 'learning_growth', order: 3 },
  { id: 'obj-ncd04-4', departmentId: 'ncd04', text: 'Paperless employee lifecycle: onboarding, leave and evaluations', bscCategory: 'financial', order: 4 },

  // NCD05 Biomedical
  { id: 'obj-ncd05-1', departmentId: 'ncd05', text: '100% critical life-support equipment safety verification and preventive maintenance', bscCategory: 'internal_process', order: 1 },
  { id: 'obj-ncd05-2', departmentId: 'ncd05', text: 'Biomedical device circular economy and energy optimization strategies', bscCategory: 'financial', order: 2 },
  { id: 'obj-ncd05-3', departmentId: 'ncd05', text: 'Evaluate and deploy AI-driven medical device telemetry monitoring', bscCategory: 'learning_growth', order: 3 },

  // NCD06 Facility Management
  { id: 'obj-ncd06-1', departmentId: 'ncd06', text: 'Achieve 99% critical facility engineering uptime (power, HVAC, water) by Q2 2026', bscCategory: 'internal_process', order: 1 },
  { id: 'obj-ncd06-2', departmentId: 'ncd06', text: 'Campus-wide energy consumption reduced by 15% through smart LED and chiller VFDs', bscCategory: 'financial', order: 2 },
  { id: 'obj-ncd06-3', departmentId: 'ncd06', text: '100% adherence to scheduled preventive maintenance workflows', bscCategory: 'internal_process', order: 3 },

  // NCD07 Housekeeping & Laundry
  { id: 'obj-ncd07-1', departmentId: 'ncd07', text: 'Maintain immaculate, infection-free hospital environment with zero surface contamination', bscCategory: 'customer', order: 1 },
  { id: 'obj-ncd07-2', departmentId: 'ncd07', text: 'Guaranteed 2-hour linen turnaround for emergency care and ICU beds', bscCategory: 'internal_process', order: 2 },
  { id: 'obj-ncd07-3', departmentId: 'ncd07', text: 'Laundry water and steam energy conservation reduced by 30–40%', bscCategory: 'financial', order: 3 },

  // NCD08 Marketing
  { id: 'obj-ncd08-1', departmentId: 'ncd08', text: 'Digital-first health screening campaigns with verified patient acquisition ROI', bscCategory: 'financial', order: 1 },
  { id: 'obj-ncd08-2', departmentId: 'ncd08', text: 'Grow corporate empanelment and international patient admissions by 10%', bscCategory: 'customer', order: 2 },
  { id: 'obj-ncd08-3', departmentId: 'ncd08', text: 'Targeted preventive healthcare outreach programs across Western Province', bscCategory: 'customer', order: 3 },

  // NCD09 QAD
  { id: 'obj-ncd09-1', departmentId: 'ncd09', text: 'Maintain ISO 9001:2015 and transition all clinical units to ISO/GMP readiness', bscCategory: 'internal_process', order: 1 },
  { id: 'obj-ncd09-2', departmentId: 'ncd09', text: 'Reduce preventable clinical adverse events by 30% through root-cause analysis', bscCategory: 'customer', order: 2 },
  { id: 'obj-ncd09-3', departmentId: 'ncd09', text: 'Close 90% of Corrective and Preventive Actions (CAPA) strictly on time', bscCategory: 'internal_process', order: 3 },
  { id: 'obj-ncd09-4', departmentId: 'ncd09', text: 'Facilitate 6+ departmental Quality Improvement (QI) projects annually', bscCategory: 'learning_growth', order: 4 },
];

export const SEED_KPI_TEMPLATES: KPITemplate[] = [
  // --- CD5 PHARMACY TEMPLATES (Focus Demo Department) ---
  { id: 'kpi-cd5-1', departmentId: 'cd5', bscCategory: 'financial', kpiName: 'Pharma waste reduction (FEFO compliance)', target: '15', unit: '% reduction', order: 1 },
  { id: 'kpi-cd5-2', departmentId: 'cd5', bscCategory: 'financial', kpiName: 'Inventory turnover ratio & dead-stock control', target: '95', unit: '% optimized', order: 2 },
  { id: 'kpi-cd5-3', departmentId: 'cd5', bscCategory: 'customer', kpiName: 'Patient medication counselling coverage', target: '90', unit: '% patients', order: 1 },
  { id: 'kpi-cd5-4', departmentId: 'cd5', bscCategory: 'customer', kpiName: 'Critical medicine availability across counters', target: '99.9', unit: '% availability', order: 2 },
  { id: 'kpi-cd5-5', departmentId: 'cd5', bscCategory: 'internal_process', kpiName: 'Medication dispensing accuracy rate', target: '99.95', unit: '% error-free', order: 1 },
  { id: 'kpi-cd5-6', departmentId: 'cd5', bscCategory: 'internal_process', kpiName: 'Digital prescription integration & e-verification', target: '90', unit: '% digital', order: 2 },
  { id: 'kpi-cd5-7', departmentId: 'cd5', bscCategory: 'learning_growth', kpiName: 'Clinical pharmacology and drug interaction CPD', target: '24', unit: 'hours/staff', order: 1 },
  { id: 'kpi-cd5-8', departmentId: 'cd5', bscCategory: 'learning_growth', kpiName: 'Continuous quality improvement audit contribution', target: '100', unit: '% compliance', order: 2 },

  // --- CD1 MEDICAL ADMIN TEMPLATES ---
  { id: 'kpi-cd1-1', departmentId: 'cd1', bscCategory: 'financial', kpiName: 'Clinical documentation & billing efficiency', target: '98', unit: '% on-time', order: 1 },
  { id: 'kpi-cd1-2', departmentId: 'cd1', bscCategory: 'customer', kpiName: 'Patient clinical complaint resolution speed', target: '48', unit: 'hours', order: 1 },
  { id: 'kpi-cd1-3', departmentId: 'cd1', bscCategory: 'internal_process', kpiName: 'Digital BHT & EMR compliance rate', target: '80', unit: '% adoption', order: 1 },
  { id: 'kpi-cd1-4', departmentId: 'cd1', bscCategory: 'internal_process', kpiName: 'Hospital-Acquired Infections (HAIs) reduction', target: '10', unit: '% decrease', order: 2 },
  { id: 'kpi-cd1-5', departmentId: 'cd1', bscCategory: 'learning_growth', kpiName: 'Quarterly clinical audits completion', target: '100', unit: '% audited', order: 1 },

  // --- CD3 OPERATION THEATRE TEMPLATES ---
  { id: 'kpi-cd3-1', departmentId: 'cd3', bscCategory: 'financial', kpiName: 'Annual surgical supply & consumable savings', target: '10', unit: 'LKR Millions', order: 1 },
  { id: 'kpi-cd3-2', departmentId: 'cd3', bscCategory: 'financial', kpiName: 'OT HVAC energy and medical gas waste reduction', target: '30', unit: '% reduction', order: 2 },
  { id: 'kpi-cd3-3', departmentId: 'cd3', bscCategory: 'customer', kpiName: 'Elective surgery on-time start rate', target: '95', unit: '% on-time', order: 1 },
  { id: 'kpi-cd3-4', departmentId: 'cd3', bscCategory: 'internal_process', kpiName: 'WHO Surgical Safety Checklist compliance', target: '100', unit: '% checked', order: 1 },
  { id: 'kpi-cd3-5', departmentId: 'cd3', bscCategory: 'learning_growth', kpiName: 'Sterile processing and surgical robotics training', target: '20', unit: 'hours/staff', order: 1 },

  // --- CD6 LABORATORY TEMPLATES ---
  { id: 'kpi-cd6-1', departmentId: 'cd6', bscCategory: 'financial', kpiName: 'Annual laboratory reagent cost optimization', target: '5.7', unit: 'LKR Millions', order: 1 },
  { id: 'kpi-cd6-2', departmentId: 'cd6', bscCategory: 'financial', kpiName: 'Paperless lab results delivery rate', target: '25', unit: '% reduction', order: 2 },
  { id: 'kpi-cd6-3', departmentId: 'cd6', bscCategory: 'customer', kpiName: 'Urgent diagnostic test turnaround time (TAT)', target: '95', unit: '% within TAT', order: 1 },
  { id: 'kpi-cd6-4', departmentId: 'cd6', bscCategory: 'internal_process', kpiName: 'External Quality Assessment (PT) accuracy', target: '96', unit: '% pass rate', order: 1 },
  { id: 'kpi-cd6-5', departmentId: 'cd6', bscCategory: 'learning_growth', kpiName: 'ISO 15189 compliance & safety drills', target: '100', unit: '% complete', order: 1 },

  // --- NCD02 FINANCE TEMPLATES ---
  { id: 'kpi-ncd02-1', departmentId: 'ncd02', bscCategory: 'financial', kpiName: 'Statutory compliance & tax audit accuracy', target: '100', unit: '% compliance', order: 1 },
  { id: 'kpi-ncd02-2', departmentId: 'ncd02', bscCategory: 'financial', kpiName: 'Paper usage reduction across accounts', target: '80', unit: '% decrease', order: 2 },
  { id: 'kpi-ncd02-3', departmentId: 'ncd02', bscCategory: 'customer', kpiName: 'Insurance and credit invoice turnaround', target: '3', unit: 'working days', order: 1 },
  { id: 'kpi-ncd02-4', departmentId: 'ncd02', bscCategory: 'internal_process', kpiName: 'Routine financial process automation', target: '80', unit: '% automated', order: 1 },
  { id: 'kpi-ncd02-5', departmentId: 'ncd02', bscCategory: 'learning_growth', kpiName: 'AI revenue cycle forecasting accuracy', target: '90', unit: '% accuracy', order: 1 },

  // --- NCD03 IT TEMPLATES ---
  { id: 'kpi-ncd03-1', departmentId: 'ncd03', bscCategory: 'financial', kpiName: 'Data center green IT and power efficiency', target: '15', unit: '% savings', order: 1 },
  { id: 'kpi-ncd03-2', departmentId: 'ncd03', bscCategory: 'customer', kpiName: 'Helpdesk ticket first-contact resolution', target: '85', unit: '% resolved', order: 1 },
  { id: 'kpi-ncd03-3', departmentId: 'ncd03', bscCategory: 'internal_process', kpiName: 'HIS & Core Network infrastructure uptime', target: '99.9', unit: '% uptime', order: 1 },
  { id: 'kpi-ncd03-4', departmentId: 'ncd03', bscCategory: 'learning_growth', kpiName: 'Cybersecurity ISO 27001 training completion', target: '100', unit: '% certified', order: 1 },

  // --- NCD04 HR TEMPLATES ---
  { id: 'kpi-ncd04-1', departmentId: 'ncd04', bscCategory: 'financial', kpiName: 'Cost-per-hire optimization & paperless HR', target: '20', unit: '% savings', order: 1 },
  { id: 'kpi-ncd04-2', departmentId: 'ncd04', bscCategory: 'customer', kpiName: 'Employee satisfaction and grievance resolution', target: '90', unit: '% satisfied', order: 1 },
  { id: 'kpi-ncd04-3', departmentId: 'ncd04', bscCategory: 'internal_process', kpiName: 'Recruitment turnaround time for nurse/doctor', target: '21', unit: 'calendar days', order: 1 },
  { id: 'kpi-ncd04-4', departmentId: 'ncd04', bscCategory: 'learning_growth', kpiName: 'Average training hours completed per employee', target: '24', unit: 'hours/yr', order: 1 },

  // --- DEFAULT FALLBACK / GENERIC TEMPLATES FOR OTHER DEPTS ---
  { id: 'kpi-gen-1', departmentId: 'default', bscCategory: 'financial', kpiName: 'Departmental budget variance and cost controls', target: '95', unit: '% within budget', order: 1 },
  { id: 'kpi-gen-2', departmentId: 'default', bscCategory: 'customer', kpiName: 'Stakeholder / patient satisfaction rating', target: '90', unit: '% score', order: 1 },
  { id: 'kpi-gen-3', departmentId: 'default', bscCategory: 'internal_process', kpiName: 'SOP compliance & error-free operational output', target: '98', unit: '% accuracy', order: 1 },
  { id: 'kpi-gen-4', departmentId: 'default', bscCategory: 'learning_growth', kpiName: 'Professional development and skill enhancement', target: '20', unit: 'hours/yr', order: 1 },
];

export const SEED_EMPLOYEES: Employee[] = [
  // CD5 - Pharmacy Employees
  { employeeId: 'NH-CD5-001', name: 'Dr. Kanishka Wickramasinghe', designation: 'Chief Pharmacist', departmentId: 'cd5', email: 'kanishka.w@nawaloka.lk', joinDate: '2019-03-15', active: true },
  { employeeId: 'NH-CD5-002', name: 'Nadeeka Perera', designation: 'Senior Inpatient Pharmacist', departmentId: 'cd5', email: 'nadeeka.p@nawaloka.lk', joinDate: '2020-07-01', active: true },
  { employeeId: 'NH-CD5-003', name: 'Chaminda Fernando', designation: 'Outpatient Dispensary Pharmacist', departmentId: 'cd5', email: 'chaminda.f@nawaloka.lk', joinDate: '2021-11-10', active: true },
  { employeeId: 'NH-CD5-004', name: 'Sanduni Jayawardena', designation: 'Clinical Pharmacist - ICU', departmentId: 'cd5', email: 'sanduni.j@nawaloka.lk', joinDate: '2022-04-18', active: true },
  { employeeId: 'NH-CD5-005', name: 'Dilan Samarasinghe', designation: 'Pharmacy Inventory Controller', departmentId: 'cd5', email: 'dilan.s@nawaloka.lk', joinDate: '2023-01-09', active: true },

  // CD1 - Medical Administration
  { employeeId: 'NH-CD1-001', name: 'Dr. Lalith Senanayake', designation: 'Medical Director', departmentId: 'cd1', email: 'lalith.s@nawaloka.lk', joinDate: '2017-02-01', active: true },
  { employeeId: 'NH-CD1-002', name: 'Dr. Aruni Gunasekara', designation: 'Clinical Audit Lead', departmentId: 'cd1', email: 'aruni.g@nawaloka.lk', joinDate: '2019-08-15', active: true },
  { employeeId: 'NH-CD1-003', name: 'Malith Ratnayake', designation: 'Medical Records Officer', departmentId: 'cd1', email: 'malith.r@nawaloka.lk', joinDate: '2021-03-20', active: true },
  { employeeId: 'NH-CD1-004', name: 'Sachini Weerakoon', designation: 'Infection Control Coordinator', departmentId: 'cd1', email: 'sachini.w@nawaloka.lk', joinDate: '2022-09-01', active: true },
  { employeeId: 'NH-CD1-005', name: 'Ruwan Dissanaike', designation: 'EMR Specialist', departmentId: 'cd1', email: 'ruwan.d@nawaloka.lk', joinDate: '2023-05-12', active: true },

  // CD2 - Nursing
  { employeeId: 'NH-CD2-001', name: 'Sister Nirmala Silva', designation: 'Director of Nursing Services', departmentId: 'cd2', email: 'nirmala.s@nawaloka.lk', joinDate: '2016-01-10', active: true },
  { employeeId: 'NH-CD2-002', name: 'Priyanthi Karunaratne', designation: 'Nurse In-Charge - CCU', departmentId: 'cd2', email: 'priyanthi.k@nawaloka.lk', joinDate: '2018-06-25', active: true },
  { employeeId: 'NH-CD2-003', name: 'Gayani Bandara', designation: 'Staff Nurse - Pediatric', departmentId: 'cd2', email: 'gayani.b@nawaloka.lk', joinDate: '2021-02-14', active: true },
  { employeeId: 'NH-CD2-004', name: 'Anura Kumara', designation: 'Charge Nurse - Emergency', departmentId: 'cd2', email: 'anura.k@nawaloka.lk', joinDate: '2020-10-05', active: true },
  { employeeId: 'NH-CD2-005', name: 'Oshadi Mendis', designation: 'Clinical Nurse Educator', departmentId: 'cd2', email: 'oshadi.m@nawaloka.lk', joinDate: '2022-12-01', active: true },

  // CD3 - Operation Theatre
  { employeeId: 'NH-CD3-001', name: 'Dr. Mohan Jayasuriya', designation: 'Head of Surgical Services', departmentId: 'cd3', email: 'mohan.j@nawaloka.lk', joinDate: '2015-09-15', active: true },
  { employeeId: 'NH-CD3-002', name: 'Lakmini Alahakoon', designation: 'OT Nurse Manager', departmentId: 'cd3', email: 'lakmini.a@nawaloka.lk', joinDate: '2018-04-12', active: true },
  { employeeId: 'NH-CD3-003', name: 'Supun Abeyratne', designation: 'Surgical Technologist', departmentId: 'cd3', email: 'supun.a@nawaloka.lk', joinDate: '2020-08-20', active: true },
  { employeeId: 'NH-CD3-004', name: 'Hasitha Madushanka', designation: 'Anesthetic Support Specialist', departmentId: 'cd3', email: 'hasitha.m@nawaloka.lk', joinDate: '2022-01-15', active: true },
  { employeeId: 'NH-CD3-005', name: 'Tharindu Gamage', designation: 'Sterile Processing Technician', departmentId: 'cd3', email: 'tharindu.g@nawaloka.lk', joinDate: '2023-03-01', active: true },

  // CD6 - Laboratory Services
  { employeeId: 'NH-CD6-001', name: 'Dr. Rohitha Pathirana', designation: 'Consultant Hematologist & Lab Head', departmentId: 'cd6', email: 'rohitha.p@nawaloka.lk', joinDate: '2017-05-10', active: true },
  { employeeId: 'NH-CD6-002', name: 'Samanthi Wijewardena', designation: 'Chief Medical Laboratory Technologist', departmentId: 'cd6', email: 'samanthi.w@nawaloka.lk', joinDate: '2019-01-20', active: true },
  { employeeId: 'NH-CD6-003', name: 'Gayan Fonseka', designation: 'Biochemist', departmentId: 'cd6', email: 'gayan.f@nawaloka.lk', joinDate: '2021-07-15', active: true },
  { employeeId: 'NH-CD6-004', name: 'Nilmini Ekanayake', designation: 'Microbiologist', departmentId: 'cd6', email: 'nilmini.e@nawaloka.lk', joinDate: '2022-03-30', active: true },
  { employeeId: 'NH-CD6-005', name: 'Buddhika Jayathilake', designation: 'Phlebotomy Supervisor', departmentId: 'cd6', email: 'buddhika.j@nawaloka.lk', joinDate: '2023-06-10', active: true },

  // NCD02 - Finance
  { employeeId: 'NH-NCD02-001', name: 'Rohan De Silva', designation: 'Chief Financial Officer', departmentId: 'ncd02', email: 'rohan.d@nawaloka.lk', joinDate: '2016-11-01', active: true },
  { employeeId: 'NH-NCD02-002', name: 'Manori Liyanage', designation: 'Senior Accountant - Revenue', departmentId: 'ncd02', email: 'manori.l@nawaloka.lk', joinDate: '2019-04-18', active: true },
  { employeeId: 'NH-NCD02-003', name: 'Dinesh Rodrigo', designation: 'Financial Analyst', departmentId: 'ncd02', email: 'dinesh.r@nawaloka.lk', joinDate: '2021-09-05', active: true },
  { employeeId: 'NH-NCD02-004', name: 'Kavindi Kulatunga', designation: 'Billing Operations Lead', departmentId: 'ncd02', email: 'kavindi.k@nawaloka.lk', joinDate: '2022-02-14', active: true },
  { employeeId: 'NH-NCD02-005', name: 'Pradeep Hettiarachchi', designation: 'Procurement Auditor', departmentId: 'ncd02', email: 'pradeep.h@nawaloka.lk', joinDate: '2023-04-01', active: true },

  // NCD03 - IT
  { employeeId: 'NH-NCD03-001', name: 'Mahesh Gunawardena', designation: 'Head of Information Technology', departmentId: 'ncd03', email: 'mahesh.g@nawaloka.lk', joinDate: '2018-01-15', active: true },
  { employeeId: 'NH-NCD03-002', name: 'Ishara Jayatissa', designation: 'Lead HIS Systems Architect', departmentId: 'ncd03', email: 'ishara.j@nawaloka.lk', joinDate: '2019-10-01', active: true },
  { employeeId: 'NH-NCD03-003', name: 'Nuwan Kasun', designation: 'Information Security Engineer', departmentId: 'ncd03', email: 'nuwan.k@nawaloka.lk', joinDate: '2021-05-12', active: true },
  { employeeId: 'NH-NCD03-004', name: 'Thilini Ranasinghe', designation: 'Clinical Applications Specialist', departmentId: 'ncd03', email: 'thilini.r@nawaloka.lk', joinDate: '2022-08-20', active: true },
  { employeeId: 'NH-NCD03-005', name: 'Sanjaya Bogahawatta', designation: 'Cloud Infrastructure Administrator', departmentId: 'ncd03', email: 'sanjaya.b@nawaloka.lk', joinDate: '2023-02-15', active: true },
];

export const SEED_USERS: UserProfile[] = [
  {
    uid: 'demo-admin-uid',
    name: 'Deshamanya H. K. Dharmadasa',
    email: 'admin@nawaloka.lk',
    departmentId: 'ALL',
    active: true,
    createdAt: '2025-01-01T08:00:00Z',
    lastLogin: '2026-10-24T10:30:00Z',
  },
  {
    uid: 'demo-pharmacy-head-uid',
    name: 'Dr. Kanishka Wickramasinghe',
    email: 'pharmacy.head@nawaloka.lk',
    departmentId: 'cd5',
    active: true,
    createdAt: '2025-01-10T09:00:00Z',
    lastLogin: '2026-10-24T14:15:00Z',
  },
  {
    uid: 'demo-pharmacy-evaluator-uid',
    name: 'Nadeeka Perera',
    email: 'nadeeka.eval@nawaloka.lk',
    departmentId: 'cd5',
    active: true,
    createdAt: '2025-02-01T09:00:00Z',
    lastLogin: '2026-10-23T11:20:00Z',
  },
  {
    uid: 'demo-finance-head-uid',
    name: 'Rohan De Silva',
    email: 'finance.head@nawaloka.lk',
    departmentId: 'ncd02',
    active: true,
    createdAt: '2025-01-12T09:00:00Z',
    lastLogin: '2026-10-22T16:00:00Z',
  },
];

export const SEED_ROLES: UserRoleRecord[] = [
  { uid: 'demo-admin-uid', role: 'super_admin' },
  { uid: 'demo-pharmacy-head-uid', role: 'dept_head' },
  { uid: 'demo-pharmacy-evaluator-uid', role: 'evaluator' },
  { uid: 'demo-finance-head-uid', role: 'dept_head' },
];

// Helper to generate seed evaluations with calculated scores
export function generateSeedEvaluations(): Evaluation[] {
  const ev1Items = [
    { id: '1', bscCategory: 'financial' as const, kpiName: 'Pharma waste reduction (FEFO compliance)', target: '15 % reduction', actual: '16.5 % achieved', rating: 5, comment: 'Exceeded reduction target with zero expired vials' },
    { id: '2', bscCategory: 'financial' as const, kpiName: 'Inventory turnover ratio & dead-stock control', target: '95 % optimized', actual: '94 % optimized', rating: 4, comment: 'Excellent inventory turns, minimal dead stock' },
    { id: '3', bscCategory: 'customer' as const, kpiName: 'Patient medication counselling coverage', target: '90 % patients', actual: '92 % counselled', rating: 5, comment: 'Patients gave overwhelmingly positive feedback' },
    { id: '4', bscCategory: 'customer' as const, kpiName: 'Critical medicine availability across counters', target: '99.9 % availability', actual: '100 % availability', rating: 5, comment: 'Zero stock-outs on ICU emergency lists' },
    { id: '5', bscCategory: 'internal_process' as const, kpiName: 'Medication dispensing accuracy rate', target: '99.95 % error-free', actual: '99.98 % error-free', rating: 5, comment: 'Double check barcode verification successful' },
    { id: '6', bscCategory: 'internal_process' as const, kpiName: 'Digital prescription integration & e-verification', target: '90 % digital', actual: '88 % digital', rating: 4, comment: 'Strong digital adoption across wards' },
    { id: '7', bscCategory: 'learning_growth' as const, kpiName: 'Clinical pharmacology and drug interaction CPD', target: '24 hours/staff', actual: '26 hours completed', rating: 5, comment: 'Completed advanced oncology pharmacology module' },
    { id: '8', bscCategory: 'learning_growth' as const, kpiName: 'Continuous quality improvement audit contribution', target: '100 % compliance', actual: '100 % completed', rating: 5, comment: 'Active member of the medication safety committee' },
    { id: '9', bscCategory: 'individual_performance' as const, kpiName: 'Attendance & punctuality', target: 'Standard', actual: 'Zero unplanned leaves, 99% on time', rating: 5, comment: 'Impeccable discipline' },
    { id: '10', bscCategory: 'individual_performance' as const, kpiName: 'Competency & skills', target: 'Standard', actual: 'Subject matter expert', rating: 5, comment: 'Demonstrates deep clinical mastery' },
    { id: '11', bscCategory: 'individual_performance' as const, kpiName: 'Behaviour & teamwork', target: 'Standard', actual: 'Collaborative with nursing and doctors', rating: 5, comment: 'Patient and encouraging' },
    { id: '12', bscCategory: 'individual_performance' as const, kpiName: 'Initiative & self-development', target: 'Standard', actual: 'Volunteered for night ward audits', rating: 4, comment: 'Proactive problem solver' },
  ];

  const score1 = calculateEvaluationScore(ev1Items);

  const ev2Items = [
    { id: '1', bscCategory: 'financial' as const, kpiName: 'Pharma waste reduction (FEFO compliance)', target: '15 % reduction', actual: '13 % achieved', rating: 4, comment: 'Good progress on tablet blister lines' },
    { id: '2', bscCategory: 'financial' as const, kpiName: 'Inventory turnover ratio & dead-stock control', target: '95 % optimized', actual: '90 % optimized', rating: 3, comment: 'Needs closer monitoring on refrigerated stock' },
    { id: '3', bscCategory: 'customer' as const, kpiName: 'Patient medication counselling coverage', target: '90 % patients', actual: '86 % counselled', rating: 4, comment: 'Queue pressures in peak morning hours' },
    { id: '4', bscCategory: 'customer' as const, kpiName: 'Critical medicine availability across counters', target: '99.9 % availability', actual: '99.5 % availability', rating: 4, comment: 'Handled emergency supplies well' },
    { id: '5', bscCategory: 'internal_process' as const, kpiName: 'Medication dispensing accuracy rate', target: '99.95 % error-free', actual: '99.90 % error-free', rating: 4, comment: 'Adhered strictly to verification checks' },
    { id: '6', bscCategory: 'internal_process' as const, kpiName: 'Digital prescription integration & e-verification', target: '90 % digital', actual: '82 % digital', rating: 4, comment: 'Assisted senior doctors with e-signatures' },
    { id: '7', bscCategory: 'learning_growth' as const, kpiName: 'Clinical pharmacology and drug interaction CPD', target: '24 hours/staff', actual: '20 hours completed', rating: 4, comment: 'On track to fulfill annual requirement' },
    { id: '8', bscCategory: 'learning_growth' as const, kpiName: 'Continuous quality improvement audit contribution', target: '100 % compliance', actual: '100 % completed', rating: 4, comment: 'Submitted 2 QI audit logs' },
    { id: '9', bscCategory: 'individual_performance' as const, kpiName: 'Attendance & punctuality', target: 'Standard', actual: 'Good attendance record', rating: 4, comment: 'Reliable team player' },
    { id: '10', bscCategory: 'individual_performance' as const, kpiName: 'Competency & skills', target: 'Standard', actual: 'Solid dispensing proficiency', rating: 4, comment: 'Good knowledge of dosages' },
    { id: '11', bscCategory: 'individual_performance' as const, kpiName: 'Behaviour & teamwork', target: 'Standard', actual: 'Supportive of junior colleagues', rating: 4, comment: 'Friendly and professional' },
    { id: '12', bscCategory: 'individual_performance' as const, kpiName: 'Initiative & self-development', target: 'Standard', actual: 'Attends hospital CME webinars', rating: 3, comment: 'Encouraged to lead more department discussions' },
  ];

  const score2 = calculateEvaluationScore(ev2Items);

  return [
    {
      id: 'eval-cd5-001-2026-q3',
      employeeId: 'NH-CD5-002',
      employeeName: 'Nadeeka Perera',
      designation: 'Senior Inpatient Pharmacist',
      departmentId: 'cd5',
      evaluatorId: 'demo-pharmacy-head-uid',
      evaluatorName: 'Dr. Kanishka Wickramasinghe',
      evaluatorRole: 'dept_head',
      periodType: 'quarterly',
      periodStart: '2026-07-01',
      periodEnd: '2026-09-30',
      status: 'approved',
      items: ev1Items,
      categoryScores: score1.categoryScores,
      finalScore: score1.finalScore,
      grade: score1.grade,
      strengths: 'Exceptional clinical mastery, proactive leadership in clinical audits, and outstanding patient feedback on discharge medication counselling.',
      improvements: 'Continue mentoring junior pharmacists on digital oncology dispensing protocols.',
      comments: 'An exemplary asset to Nawaloka Hospitals. Recommend for hospital-wide merit recognition.',
      approvedBy: 'Dr. Kanishka Wickramasinghe',
      approvedAt: '2026-10-05T10:00:00Z',
      createdAt: '2026-10-02T14:30:00Z',
      updatedAt: '2026-10-05T10:00:00Z',
    },
    {
      id: 'eval-cd5-002-2026-q3',
      employeeId: 'NH-CD5-003',
      employeeName: 'Chaminda Fernando',
      designation: 'Outpatient Dispensary Pharmacist',
      departmentId: 'cd5',
      evaluatorId: 'demo-pharmacy-head-uid',
      evaluatorName: 'Dr. Kanishka Wickramasinghe',
      evaluatorRole: 'dept_head',
      periodType: 'quarterly',
      periodStart: '2026-07-01',
      periodEnd: '2026-09-30',
      status: 'submitted',
      items: ev2Items,
      categoryScores: score2.categoryScores,
      finalScore: score2.finalScore,
      grade: score2.grade,
      strengths: 'Steady, highly reliable dispensing accuracy and good rapport with patients and nursing staff.',
      improvements: 'Sharpen speed during peak morning rush and complete the remaining 4 hours of CPD credit.',
      comments: 'Strong performance throughout Q3. Meets all core clinical standards with consistency.',
      createdAt: '2026-10-12T11:00:00Z',
      updatedAt: '2026-10-15T15:20:00Z',
    },
  ];
}
