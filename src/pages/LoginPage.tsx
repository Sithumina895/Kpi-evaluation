import React, { useState } from 'react';
import { Department } from '../types';
import { useAuth } from '../context/AuthContext';
import { DepartmentIcon } from '../components/common/DepartmentIcon';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { ArrowLeft, Lock, Mail, AlertCircle, Building, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  department: Department;
  onBack: () => void;
  onLoginSuccess: () => void;
  initialEmail?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  department,
  onBack,
  onLoginSuccess,
  initialEmail = '',
}) => {
  const { login, isDemoMode } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('password123'); // Demo default for testing convenience
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6 px-4">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Departments</span>
        </button>

        {/* Selected Department Branding Card */}
        <div
          className="rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center relative overflow-hidden"
          style={{
            borderTop: `5px solid ${department.colour}`,
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="p-3 rounded-2xl"
              style={{
                backgroundColor: `${department.colour}15`,
                color: department.colour,
              }}
            >
              <DepartmentIcon name={department.icon} className="h-8 w-8" />
            </div>
            <div>
              <span
                className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${department.colour}20`,
                  color: department.colour,
                }}
              >
                {department.code}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {department.name}
              </h2>
              <p className="text-xs text-slate-500 capitalize">
                {department.type.replace('_', ' ')} Department Portal
              </p>
            </div>
          </div>
        </div>

        {/* Login Form Card */}
        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your hospital credentials. Access is restricted to staff assigned to {department.code}.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
                </div>
              )}

              <Input
                label="Hospital Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. employee@nawaloka.lk"
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                helperText={isDemoMode ? "In demo mode, any password works for pre-seeded users" : undefined}
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full mt-2 h-10 font-semibold"
                style={{
                  backgroundColor: department.colour,
                }}
              >
                Enter {department.code} Portal
              </Button>
            </form>
          </CardContent>

          {isDemoMode && (
            <CardFooter className="flex-col items-start gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-b-xl border-t border-slate-100 dark:border-slate-800 pt-4">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Test Credentials:</span>
              <div className="space-y-1 w-full text-[11px] font-mono">
                <div
                  className="cursor-pointer hover:text-teal-600 flex justify-between items-center p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setEmail('pharmacy.head@nawaloka.lk')}
                >
                  <span>pharmacy.head@nawaloka.lk</span>
                  <span className="text-teal-600 font-sans font-medium text-[10px]">Dept Head</span>
                </div>
                <div
                  className="cursor-pointer hover:text-blue-600 flex justify-between items-center p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setEmail('admin@nawaloka.lk')}
                >
                  <span>admin@nawaloka.lk</span>
                  <span className="text-blue-600 font-sans font-medium text-[10px]">Super Admin</span>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};
