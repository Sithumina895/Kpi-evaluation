import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { Department, Employee } from './types';
import { Header } from './components/layout/Header';
import { Sidebar, NavTabId } from './components/layout/Sidebar';
import { DepartmentSelectionPage } from './pages/DepartmentSelectionPage';
import { LoginPage } from './pages/LoginPage';
import { CreateSuperAdminPage } from './pages/CreateSuperAdminPage';
import { DepartmentDashboardPage } from './pages/DepartmentDashboardPage';
import { ObjectivesPage } from './pages/ObjectivesPage';
import { EvaluationFormPage } from './pages/EvaluationFormPage';
import { EvaluationResultPage } from './pages/EvaluationResultPage';
import { EmployeeDirectoryPage } from './pages/EmployeeDirectoryPage';
import { EmployeeManagementPage } from './pages/EmployeeManagementPage';
import { ReportsPage } from './pages/ReportsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuditLogPage } from './pages/AuditLogPage';

function AppContent() {
  const {
    user,
    role,
    selectedDepartment,
    selectDepartment,
    clearDepartment,
    isLoading,
    login,
  } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTabId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Cross-page navigation parameters
  const [targetEmployeeForEval, setTargetEmployeeForEval] = useState<Employee | null>(null);
  const [viewingEvaluationId, setViewingEvaluationId] = useState<string | null>(null);
  const [isManagingEmployees, setIsManagingEmployees] = useState(false);
  const [prefilledLoginEmail, setPrefilledLoginEmail] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1F3A6E] text-teal-400 font-extrabold text-lg animate-pulse">
            NH
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Nawaloka Hospital Systems...
          </span>
        </div>
      </div>
    );
  }

  // --- 1. Initial Root Setup: Create Super Admin ---
  if (!user && isCreatingAdmin) {
    return (
      <CreateSuperAdminPage
        onSuccess={() => setIsCreatingAdmin(false)}
        onCancel={() => setIsCreatingAdmin(false)}
      />
    );
  }

  // --- 2. Unauthenticated: Department Selection Page ---
  if (!user && !selectedDepartment) {
    return (
      <DepartmentSelectionPage
        onSelectDepartment={(dept) => {
          setPrefilledLoginEmail('');
          selectDepartment(dept);
        }}
        onGoToCreateAdmin={() => setIsCreatingAdmin(true)}
        onQuickLogin={async (email, dept) => {
          selectDepartment(dept);
          try {
            await login(email, 'password123');
          } catch {
            setPrefilledLoginEmail(email);
          }
        }}
      />
    );
  }

  // --- 3. Unauthenticated: Login Page for Selected Department ---
  if (!user && selectedDepartment) {
    return (
      <LoginPage
        department={selectedDepartment}
        initialEmail={prefilledLoginEmail}
        onBack={() => clearDepartment()}
        onLoginSuccess={() => {
          setCurrentTab('dashboard');
        }}
      />
    );
  }

  // --- 4. Authenticated: Evaluation Result View Overlay ---
  if (viewingEvaluationId && selectedDepartment) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <EvaluationResultPage
            evaluationId={viewingEvaluationId}
            department={selectedDepartment}
            onBack={() => setViewingEvaluationId(null)}
            onEdit={(evalId) => {
              setViewingEvaluationId(null);
              setCurrentTab('evaluate');
            }}
          />
        </main>
      </div>
    );
  }

  // --- 5. Authenticated: Employee Management Sub-View ---
  if (isManagingEmployees && selectedDepartment) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <EmployeeManagementPage
            currentDepartment={selectedDepartment}
            onBack={() => setIsManagingEmployees(false)}
          />
        </main>
      </div>
    );
  }

  // --- 6. Authenticated: Main Workspace with Sidebar ---
  const renderMainTab = () => {
    if (!selectedDepartment) return null;

    switch (currentTab) {
      case 'dashboard':
        return (
          <DepartmentDashboardPage
            department={selectedDepartment}
            onGoToEvaluate={(emp) => {
              setTargetEmployeeForEval(emp || null);
              setCurrentTab('evaluate');
            }}
            onGoToObjectives={() => setCurrentTab('objectives')}
            onGoToReports={() => setCurrentTab('reports')}
          />
        );

      case 'objectives':
        return <ObjectivesPage department={selectedDepartment} />;

      case 'evaluate':
        return (
          <EvaluationFormPage
            department={selectedDepartment}
            initialEmployee={targetEmployeeForEval}
            onBack={() => {
              setTargetEmployeeForEval(null);
              setCurrentTab('dashboard');
            }}
            onEvaluationSaved={(evalId) => {
              setTargetEmployeeForEval(null);
              setViewingEvaluationId(evalId);
            }}
          />
        );

      case 'employees':
        return (
          <EmployeeDirectoryPage
            department={selectedDepartment}
            onSelectEmployeeForEval={(emp) => {
              setTargetEmployeeForEval(emp);
              setCurrentTab('evaluate');
            }}
            onViewEvaluation={(evalId) => setViewingEvaluationId(evalId)}
            onGoToEmployeeManagement={() => setIsManagingEmployees(true)}
          />
        );

      case 'reports':
        return (
          <ReportsPage
            currentDepartment={selectedDepartment}
            onViewEvaluation={(evalId) => setViewingEvaluationId(evalId)}
          />
        );

      case 'users':
        return <UserManagementPage />;

      case 'settings':
        return <SettingsPage />;

      case 'audit':
        return <AuditLogPage currentDepartment={selectedDepartment} />;

      default:
        return (
          <DepartmentDashboardPage
            department={selectedDepartment}
            onGoToEvaluate={() => setCurrentTab('evaluate')}
            onGoToObjectives={() => setCurrentTab('objectives')}
            onGoToReports={() => setCurrentTab('reports')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setViewingEvaluationId(null);
            setIsManagingEmployees(false);
            setCurrentTab(tab);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 max-w-7xl w-full mx-auto">
          {renderMainTab()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
