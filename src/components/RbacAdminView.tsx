import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Trash2,
  Lock,
  Unlock,
  Key,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Flame,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { canAccess, getRoleBadgeStyle } from '../lib/rbac';

interface RbacAdminViewProps {
  currentUser: User;
  users: User[];
  blockedIps: { ip: string; reason: string; blockedAt: string; attempts: number }[];
  onInviteAdmin: (data: {
    telegramId: string;
    telegramUsername: string;
    name: string;
    accessCode: string;
    role?: UserRole;
  }) => void;
  onRevokeAdmin: (userId: string) => void;
  onUnblockIp: (ip: string) => void;
  onSwitchUser: (idx: number) => void;
}

export const RbacAdminView: React.FC<RbacAdminViewProps> = ({
  currentUser,
  users,
  blockedIps,
  onInviteAdmin,
  onRevokeAdmin,
  onUnblockIp,
  onSwitchUser,
}) => {
  const isOwner = currentUser.role === 'OWNER';

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteTelegramId, setInviteTelegramId] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('ADMIN');

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteTelegramId || !inviteName || !inviteCode) return;
    onInviteAdmin({
      telegramId: inviteTelegramId,
      telegramUsername: inviteUsername,
      name: inviteName,
      accessCode: inviteCode,
      role: inviteRole,
    });
    setShowInviteModal(false);
    setInviteTelegramId('');
    setInviteUsername('');
    setInviteName('');
    setInviteCode('');
  };

  // If unprivileged ADMIN, render realistic enterprise 403 Access Denied Shield
  if (!isOwner) {
    return (
      <div className="p-10 max-w-2xl mx-auto my-12 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-950/20">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            HTTP 403 FORBIDDEN • RBAC ENFORCEMENT
          </span>
          <h2 className="text-xl font-bold text-white mt-2">Restricted Security Boundary</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            Your current operational session is identified as{' '}
            <strong className="text-cyan-400 font-mono">ADMIN (Alex Rivera)</strong>. Operator
            privileges permit viewing bot telemetry, logs, and restarts, but strictly prohibit
            inspecting or modifying administrative credentials and security firewall rules.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs font-mono space-y-2">
          <div className="text-slate-400">Required Role Permission:</div>
          <div className="text-amber-400 font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            manage_admins (OWNER / Root Exclusive)
          </div>
          <div className="text-slate-500 text-[11px]">
            To inspect the admin management module, switch active operator session to Sarah Connor
            (OWNER).
          </div>
        </div>

        <button
          onClick={() => onSwitchUser(0)}
          className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/40 cursor-pointer transition-all"
        >
          Switch to Root Owner (Sarah Connor)
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            Operator Directory & RBAC Privileges
          </h2>
          <p className="text-xs text-slate-400">
            Configure administrative team access, 2FA enforcement, and brute-force IP rate limits
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-950/30 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Invite Operator
        </button>
      </div>

      {/* Operator Accounts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <h3 className="text-sm font-semibold text-white">Active System Operators ({users.length})</h3>
          <span className="text-[11px] font-mono text-slate-400">
            RBAC Enforcement: Strict Role Isolation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Operator</th>
                <th className="p-4">Role Tier</th>
                <th className="p-4">2FA Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4">Origin IP</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map((user) => {
                const style = getRoleBadgeStyle(user.role);
                const isSelf = user.id === currentUser.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            {user.name}
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block text-[10px] px-2.5 py-0.5 rounded font-mono font-semibold border ${style.bg} ${style.text} ${style.border}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono flex items-center gap-1 w-fit border ${
                          user.twoFactorEnabled
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {user.twoFactorEnabled ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {user.twoFactorEnabled ? 'ENFORCED' : 'DISABLED'}
                      </span>
                    </td>

                    <td className="p-4 text-slate-300 font-mono text-[11px]">
                      {user.lastLogin.includes('T')
                        ? new Date(user.lastLogin).toLocaleDateString() +
                          ' ' +
                          new Date(user.lastLogin).toLocaleTimeString()
                        : user.lastLogin}
                    </td>

                    <td className="p-4 text-slate-400 font-mono text-[11px]">{user.lastIp}</td>

                    <td className="p-4 text-right">
                      {!isSelf ? (
                        <button
                          onClick={() => onRevokeAdmin(user.id)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 cursor-pointer"
                          title="Revoke operator credentials"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">Root Lock</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Firewall: Rate Limiting & Brute Force Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Security Rules */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white font-sans font-bold">
            <Flame className="w-4 h-4 text-amber-400" />
            Security Middleware & Rate Limiting
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">AUTH ATTEMPTS THRESHOLD:</span>
              <strong className="text-white text-xs">Max 5 failed attempts per 15 mins</strong>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">API ROUTE RATE LIMITING:</span>
              <strong className="text-white text-xs">Sliding window: 60 req/min per IP</strong>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">TELEGRAM WEBHOOK AUTH:</span>
              <strong className="text-white text-xs">Enforced secret-token hash header</strong>
            </div>
          </div>
        </div>

        {/* Right: Blocked IPs Table */}
        <div className="md:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Blocked IPs & Brute-Force Blacklist ({blockedIps.length})
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Automated IP Jail</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {blockedIps.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs font-mono">
                No active IP blocks in blacklist...
              </div>
            ) : (
              blockedIps.map((item) => (
                <div key={item.ip} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-bold text-white flex items-center gap-2">
                      {item.ip}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 font-mono border border-rose-500/20">
                        {item.attempts} attempts
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.reason}</div>
                  </div>

                  <button
                    onClick={() => onUnblockIp(item.ip)}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono cursor-pointer border border-slate-700"
                  >
                    Unblock IP
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleInviteSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                Invite System Operator
              </h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

             <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Telegram User ID (Required)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8295677952"
                  value={inviteTelegramId}
                  onChange={(e) => setInviteTelegramId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Telegram Username (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. @username"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Access Passcode (Required)</label>
                <input
                  type="text"
                  required
                  placeholder="Set 4-digit code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">RBAC Role Assignment</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                >
                  <option value="ADMIN">ADMIN - Operational Telemetry & Restarts (Recommended)</option>
                  <option value="OWNER">OWNER - Full Root Access & Secret Keys</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
              >
                Issue Access Credentials
              </button>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
