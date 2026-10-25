import React, { useState, useEffect } from 'react';
import { Department, AuditLogEntry } from '../types';
import { dataService } from '../data';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { History, Shield, Filter, Search } from 'lucide-react';

interface AuditLogPageProps {
  currentDepartment: Department;
}

export const AuditLogPage: React.FC<AuditLogPageProps> = ({ currentDepartment }) => {
  const { isSuperAdmin } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const auditData = await dataService.getAuditLogs(
          isSuperAdmin ? 'ALL' : currentDepartment.id
        );
        setLogs(auditData);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [currentDepartment.id, isSuperAdmin]);

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.details.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Security & Audit Trail
          </h1>
          <Badge variant="teal" size="sm">
            Append-Only
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically isolated ledger recording all evaluation submits, approvals, user role changes, and system access.
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by user or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs"
            >
              <option value="ALL">All Actions</option>
              <option value="submit">Evaluation Submit</option>
              <option value="approve">Evaluation Approval</option>
              <option value="reopen">Evaluation Reopen</option>
              <option value="user_role_change">User / Role Changes</option>
              <option value="login">Authentication / Login</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base">Audit Trail Records ({filteredLogs.length})</CardTitle>
          <CardDescription className="text-xs">
            Chronological log of administrative and clinical evaluation events
          </CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">User</th>
                <th className="p-3">Dept</th>
                <th className="p-3">Log Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => {
                const actionBadges: Record<string, 'default' | 'success' | 'warning' | 'teal' | 'danger'> = {
                  create: 'default',
                  update: 'secondary' as any,
                  submit: 'teal',
                  approve: 'success',
                  reopen: 'warning',
                  delete: 'danger',
                  user_role_change: 'warning',
                  login: 'teal',
                };

                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <Badge variant={actionBadges[log.action] || 'default'} size="sm">
                        {log.action.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono font-medium text-slate-600 dark:text-slate-400">
                      {log.entity}
                    </td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      {log.userName}
                    </td>
                    <td className="p-3 font-mono uppercase text-slate-500">
                      {log.departmentId}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                      {log.details}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No audit records match the current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
