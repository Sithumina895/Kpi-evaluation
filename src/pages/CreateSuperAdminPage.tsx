import React, { useState } from 'react';
import { dataService } from '../data';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { ShieldCheck, AlertCircle, ArrowLeft, Lock, Mail, User } from 'lucide-react';

interface CreateSuperAdminPageProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateSuperAdminPage: React.FC<CreateSuperAdminPageProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { refreshUser } = useAuth();
  const [name, setName] = useState('Deshamanya H. K. Dharmadasa');
  const [email, setEmail] = useState('admin@nawaloka.lk');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await dataService.createFirstSuperAdmin(name, email, password);
      await refreshUser();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create Super Administrator.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6 px-4">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Department Selection</span>
        </button>

        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1F3A6E] to-blue-900 text-white shadow-md shadow-blue-900/20 mb-2">
              <ShieldCheck className="h-6 w-6 text-teal-400" />
            </div>
            <CardTitle className="text-xl">Initial System Provisioning</CardTitle>
            <CardDescription>
              Create the first Master Super Administrator account for Nawaloka Hospitals PLC. This one-time setup establishes the root security authority.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">{error}</div>
                </div>
              )}

              <Input
                label="Full Name & Title"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Deshamanya H. K. Dharmadasa"
                leftIcon={<User className="h-4 w-4" />}
              />

              <Input
                label="Super Admin Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nawaloka.lk"
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <Input
                label="Master Password (min 6 chars)"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
              />

              <Input
                label="Confirm Master Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full mt-2 h-10 font-semibold bg-[#1F3A6E]"
              >
                Provision Master Super Admin
              </Button>
            </form>
          </CardContent>

          <CardFooter className="text-center text-[11px] text-slate-500 justify-center">
            Once provisioned, this page is locked. User accounts are created via User Management.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
