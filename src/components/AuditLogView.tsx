import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  User as UserIcon,
  Globe,
  CheckCircle2,
  XCircle,
  AlertOctagon,
} from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogViewProps {
  auditLogs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction !== 'ALL' && log.actionType !== filterAction) return false;
    if (filterStatus !== 'ALL' && log.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        log.userName.toLowerCase().includes(q) ||
        log.userEmail.toLowerCase().includes(q) ||
        log.actionType.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.ipAddress.includes(q)
      );
    }
    return true;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  const handleExportCsv = () => {
    const headers = 'ID,Timestamp,User,Email,Role,Action,Status,IP,Details\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.userName}","${l.userEmail}","${l.userRole}","${l.actionType}","${l.status}","${l.ipAddress}","${l.details.replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const getActionBadgeColor = (action: AuditLog['actionType']) => {
    if (action.includes('RBAC') || action.includes('DENIED') || action.includes('RATE_LIMIT')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    if (action.includes('RESTART') || action.includes('WEBHOOK')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    if (action.includes('TOKEN')) {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
    return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Compliance & Security Audit Trail
          </h2>
          <p className="text-xs text-slate-400">
            Immutable chronicle of all operator sessions, bot actions, secret disclosures, and access violations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export CSV
          </button>
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-950/40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by operator, IP, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Action Types</option>
            <option value="BOT_RESTART">BOT_RESTART</option>
            <option value="BOT_WEBHOOK_CHANGE">BOT_WEBHOOK_CHANGE</option>
            <option value="BOT_TOKEN_REVEAL">BOT_TOKEN_REVEAL</option>
            <option value="BOT_BROADCAST">BOT_BROADCAST</option>
            <option value="APP_REDEPLOY">APP_REDEPLOY</option>
            <option value="ADMIN_INVITE">ADMIN_INVITE</option>
            <option value="RBAC_ACCESS_DENIED">RBAC_ACCESS_DENIED</option>
            <option value="DB_BACKUP">DB_BACKUP</option>
            <option value="AUTH_2FA_VERIFY">AUTH_2FA_VERIFY</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="BLOCKED">BLOCKED (Violations)</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Operator</th>
                <th className="p-4">Action Type</th>
                <th className="p-4">Details</th>
                <th className="p-4">Status</th>
                <th className="p-4">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                    No audit records matching query parameters...
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-950/60 transition-colors cursor-pointer"
                  >
                    <td className="p-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{log.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {log.userRole}
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${getActionBadgeColor(
                          log.actionType
                        )}`}
                      >
                        {log.actionType}
                      </span>
                    </td>

                    <td className="p-4 text-slate-300 max-w-md truncate">
                      {log.details}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border flex items-center gap-1 w-fit ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : log.status === 'BLOCKED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {log.status === 'SUCCESS' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : log.status === 'BLOCKED' ? (
                          <AlertOctagon className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {log.status}
                      </span>
                    </td>

                    <td className="p-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Log Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Audit Record Event: {selectedLog.id}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 overflow-x-auto text-slate-300">
              <pre className="text-[11px] leading-relaxed">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
