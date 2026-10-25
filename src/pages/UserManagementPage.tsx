import React, { useState, useEffect } from 'react';
import { Department, UserProfile, UserRole } from '../types';
import { dataService } from '../data';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import {
  UserPlus,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Building,
  KeyRound,
  AlertCircle,
  Clock,
  CheckCircle,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<{ profile: UserProfile; role: UserRole }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserDept, setNewUserDept] = useState('cd5');
  const [newUserRole, setNewUserRole] = useState<UserRole>('evaluator');
  const [isCreating, setIsCreating] = useState(false);

  // Edit Role/Dept Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{ profile: UserProfile; role: UserRole } | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('viewer');
  const [editDept, setEditDept] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [depts, userList] = await Promise.all([
        dataService.getDepartments(),
        dataService.getUsers(),
      ]);
      setDepartments(depts);
      setUsers(userList);
    } catch (err: any) {
      toastError(err.message || 'Error loading user accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      toastError('All fields are required.');
      return;
    }

    if (newUserPassword.length < 6) {
      toastError('Password must be at least 6 characters.');
      return;
    }

    setIsCreating(true);
    try {
      await dataService.createUser(
        newUserName.trim(),
        newUserEmail.trim().toLowerCase(),
        newUserPassword,
        newUserRole === 'super_admin' ? 'ALL' : newUserDept,
        newUserRole
      );
      success(`Created user account for ${newUserName}`);
      setIsModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (u: UserProfile) => {
    if (u.uid === currentUser?.uid) {
      toastError('You cannot deactivate your own administrative account.');
      return;
    }

    try {
      await dataService.toggleUserActive(u.uid, !u.active);
      success(`User ${u.name} set to ${!u.active ? 'active' : 'inactive'}`);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to update user status');
    }
  };

  const handleSaveRoleAndDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await dataService.updateUserRoleAndDept(
        editingUser.profile.uid,
        editRole,
        editRole === 'super_admin' ? 'ALL' : editDept
      );
      success(`Updated role and department for ${editingUser.profile.name}`);
      setIsEditModalOpen(false);
      setEditingUser(null);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to update user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              User Accounts & Role Management (RBAC)
            </h1>
            <Badge variant="teal" size="sm">
              Super Admin Control
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provision department heads and evaluators. Roles are isolated in the separate <code>userRoles</code> collection for security.
          </p>
        </div>

        <Button
          onClick={() => {
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('password123');
            setNewUserDept(departments[0]?.id || 'cd5');
            setNewUserRole('dept_head');
            setIsModalOpen(true);
          }}
          variant="primary"
          size="sm"
        >
          <UserPlus className="h-4 w-4 mr-1 text-teal-400" />
          <span>Provision New User</span>
        </Button>
      </div>

      {/* User Accounts List */}
      <Card>
        <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Registered System Users</CardTitle>
            <CardDescription className="text-xs">
              {users.length} active and inactive accounts
            </CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Assigned Department</th>
                <th className="p-3">Security Role</th>
                <th className="p-3">Last Login</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map(({ profile, role }) => {
                const dept = departments.find((d) => d.id === profile.departmentId);

                return (
                  <tr
                    key={profile.uid}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {profile.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {profile.email}
                      </div>
                    </td>

                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                      {profile.departmentId === 'ALL' ? (
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          All Hospital Units
                        </span>
                      ) : (
                        <span>
                          {dept?.code} - {dept?.name || profile.departmentId}
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <Badge
                        variant={
                          role === 'super_admin'
                            ? 'blue'
                            : role === 'dept_head'
                            ? 'teal'
                            : role === 'evaluator'
                            ? 'purple'
                            : 'secondary'
                        }
                        size="sm"
                      >
                        {role === 'super_admin'
                          ? 'Super Admin'
                          : role === 'dept_head'
                          ? 'Dept Head'
                          : role === 'evaluator'
                          ? 'Evaluator'
                          : 'Viewer (Read-only)'}
                      </Badge>
                    </td>

                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'Never'}
                    </td>

                    <td className="p-3 text-center">
                      <Badge variant={profile.active ? 'success' : 'danger'} size="sm">
                        {profile.active ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>

                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingUser({ profile, role });
                          setEditRole(role);
                          setEditDept(profile.departmentId);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded font-medium text-xs"
                      >
                        Edit
                      </button>

                      {profile.uid !== currentUser?.uid && (
                        <button
                          onClick={() => handleToggleActive(profile)}
                          className={`p-1.5 text-xs font-semibold rounded ${
                            profile.active
                              ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'text-emerald-500 hover:bg-emerald-50'
                          }`}
                        >
                          {profile.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Provision New User */}
      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Provision Department User"
        description="Creates credentials and records role in the dedicated userRoles collection"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
          <Input
            label="Full Name & Title"
            required
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="e.g. Dr. Aruni Gunasekara"
          />

          <Input
            label="Official Hospital Email"
            type="email"
            required
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            placeholder="aruni.g@nawaloka.lk"
          />

          <Input
            label="Initial Password (min 6 characters)"
            type="password"
            required
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Select
            label="Assigned Role"
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value as UserRole)}
            options={[
              { value: 'dept_head', label: 'Department Head (Evaluates, manages staff, approves)' },
              { value: 'evaluator', label: 'Evaluator (Scores employees in assigned department)' },
              { value: 'viewer', label: 'Viewer (Read-only reports and dashboards)' },
              { value: 'super_admin', label: 'Super Admin (Hospital-wide authority, all depts)' },
            ]}
          />

          {newUserRole !== 'super_admin' && (
            <Select
              label="Assigned Department"
              value={newUserDept}
              onChange={(e) => setNewUserDept(e.target.value)}
              options={departments.map((d) => ({
                value: d.id,
                label: `${d.code} - ${d.name}`,
              }))}
            />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreating}>
              Create User Account
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Edit User Role & Department */}
      <Dialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Update User Security Role"
        description={`Modify access permissions for ${editingUser?.profile.name}`}
      >
        <form onSubmit={handleSaveRoleAndDept} className="space-y-4 pt-2">
          <Select
            label="Assigned Security Role"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value as UserRole)}
            options={[
              { value: 'dept_head', label: 'Department Head' },
              { value: 'evaluator', label: 'Evaluator' },
              { value: 'viewer', label: 'Viewer' },
              { value: 'super_admin', label: 'Super Admin' },
            ]}
          />

          {editRole !== 'super_admin' && (
            <Select
              label="Assigned Department"
              value={editDept}
              onChange={(e) => setEditDept(e.target.value)}
              options={departments.map((d) => ({
                value: d.id,
                label: `${d.code} - ${d.name}`,
              }))}
            />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal">
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
